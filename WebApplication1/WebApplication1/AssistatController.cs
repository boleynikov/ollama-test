using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.models;

namespace WebApplication1;

[ApiController]
[Route("api/[controller]")]
public class OllamaController(IHttpClientFactory httpClientFactory, AppDbContext context) : ControllerBase
{
    private readonly HttpClient _httpClient = httpClientFactory.CreateClient();
    private readonly AppDbContext _context = context;

    [HttpPost("ask-stream/{chatId:guid}")]
    public async Task AskModelStream(Guid chatId, [FromBody] ChatRequest request, CancellationToken ct)
    {
        // 1. ПЕРЕВІРКА ЧАТУ: Чи існує такий чат у базі?
        var chatExists = await _context.Chats.AnyAsync(c => c.Id == chatId, ct);
        if (!chatExists)
        {
            Response.StatusCode = 404;
            return;
        }

        // 2. ЗБЕРЕЖЕННЯ ПОВІДОМЛЕННЯ КОРИСТУВАЧА
        // Ми робимо це до запиту в Ollama, щоб зафіксувати намір користувача
        var userMsg = new Message
        {
            Id = Guid.NewGuid(),
            ChatId = chatId,
            Role = "user",
            Content = request.Messages.Last().Content, // Беремо останнє повідомлення з масиву
            CreatedAt = DateTime.UtcNow
        };
        _context.Messages.Add(userMsg);
        await _context.SaveChangesAsync(ct);

        // 3. ПІДГОТОВКА ЗАПИТУ ДО OLLAMA
        var ollamaRequest = new
        {
            model = request.Model,
            messages = request.Messages, // Передаємо всю історію для контексту
            system = request.System,
            stream = true,
            options = new { temperature = request.Temperature }
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "http://127.0.0.1:11434/api/chat")
        {
            Content = JsonContent.Create(ollamaRequest)
        };

        Response.ContentType = "text/event-stream";
        Response.Headers.Append("X-Accel-Buffering", "no");

        using var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, ct);
        using var stream = await response.Content.ReadAsStreamAsync(ct);
    
        var fullAiResponse = new StringBuilder();
        var buffer = new byte[1024];
        int bytesRead;

        // 4. СТРІМІНГ ТА НАКОПИЧЕННЯ
        while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length, ct)) > 0)
        {
            var chunk = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            
            // Відправляємо на фронтенд миттєво
            await Response.WriteAsync($"data: {chunk}\n\n", ct);
            await Response.Body.FlushAsync(ct);

            // Накопичуємо текст для збереження в БД
            try 
            {
                // Оскільки Ollama шле JSON об'єкти, нам треба витягнути саме контент
                // У спрощеному варіанті можна парсити JSON тут або накопичувати сирі дані
                // і розпарсити їх в кінці, але для надійності парсимо кожен чанк:
                var lines = chunk.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    var json = JsonDocument.Parse(line);
                    if (json.RootElement.TryGetProperty("message", out var msg) && 
                        msg.TryGetProperty("content", out var content))
                    {
                        fullAiResponse.Append(content.GetString());
                    }
                }
            }
            catch { /* Пропускаємо неповні JSON-чанки під час стрімінгу */ }
        }

        // 5. ФІНАЛЬНЕ ЗБЕРЕЖЕННЯ ВІДПОВІДІ ШІ
        var aiMsg = new Message
        {
            Id = Guid.NewGuid(),
            ChatId = chatId,
            Role = "assistant",
            Content = fullAiResponse.ToString(),
            CreatedAt = DateTime.UtcNow
        };
        _context.Messages.Add(aiMsg);
        await _context.SaveChangesAsync(ct);
    }
}