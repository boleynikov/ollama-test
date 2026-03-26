using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.models.entities;
using WebApplication1.models.dto.ollama;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OllamaController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _context;

    public OllamaController(IHttpClientFactory httpClientFactory, AppDbContext context)
    {
        _httpClient = httpClientFactory.CreateClient("Ollama");
        _context = context;
    }

    /**
     * UI Designer: Get Local Models Inventory
     * Отримує список встановлених моделей з Ollama
     */
    [HttpGet("local-models")]
    public async Task<ActionResult<IEnumerable<string>>> GetLocalModels()
    {
        try 
        {
            // Використовуємо наш новий Dto клас
            var response = await _httpClient.GetFromJsonAsync<OllamaModelsListDto>("api/tags");
            var modelNames = response?.Models.Select(m => m.Name) ?? Enumerable.Empty<string>();
            return Ok(modelNames);
        }
        catch (Exception)
        {
            // Fallback для розробки, якщо Ollama офлайн
            return Ok(new[] { "gemma3:12b", "llama3.1:8b" });
        }
    }

    /**
     * UI Designer: Intelligent Streaming Endpoint
     * Обробляє діалог, зберігає історію та транслює відповідь ШІ
     */
    [HttpPost("ask-stream/{chatSessionId:guid}")]
    public async Task AskModelStream(Guid chatSessionId, [FromBody] OllamaChatRequest request, CancellationToken ct)
    {
        // 1. Перевірка сесії (Entity: ChatSession)
        var session = await _context.ChatSessions.FirstOrDefaultAsync(c => c.Id == chatSessionId, ct);
        if (session == null)
        {
            Response.StatusCode = 404;
            return;
        }

        // 2. Збереження повідомлення користувача (Entity: ChatMessage)
        var lastInput = request.Messages.LastOrDefault();
        if (lastInput != null)
        {
            var userMsg = new ChatMessage
            {
                Id = Guid.NewGuid(),
                ChatSessionId = chatSessionId,
                Role = "user",
                Content = lastInput.Content,
                CreatedAt = DateTime.UtcNow
            };
            _context.ChatMessages.Add(userMsg);
            await _context.SaveChangesAsync(ct);
        }

        // 3. Підготовка запиту до Ollama (DTO: OllamaChatRequest)
        // Переконуємося, що ми шлемо тільки те, що розуміє Ollama
        var ollamaPayload = new
        {
            model = request.Model,
            messages = request.Messages, // Використовує OllamaMessageDto
            stream = true,
            system = request.SystemPrompt,
            options = new { 
                temperature = request.Options.Temperature,
                num_ctx = request.Options.NumCtx
            }
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "api/chat")
        {
            Content = JsonContent.Create(ollamaPayload)
        };

        Response.ContentType = "text/event-stream";
        Response.Headers.Append("X-Accel-Buffering", "no"); // Для миттєвого відображення в Nginx/IIS

        using var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, ct);
        using var stream = await response.Content.ReadAsStreamAsync(ct);
    
        var fullAiContent = new StringBuilder();
        var fullAiThinking = new StringBuilder();
        
        var buffer = new byte[2048];
        int bytesRead;

        // 4. Стрімінг та обробка чанків
        while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length, ct)) > 0)
        {
            var chunk = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            
            // Відправляємо сирий JSON-чанк на фронтенд для React-обробки
            await Response.WriteAsync($"data: {chunk}\n\n", ct);
            await Response.Body.FlushAsync(ct);

            // Накопичуємо текст для збереження в БД
            try 
            {
                var lines = chunk.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    using var json = JsonDocument.Parse(line);
                    if (json.RootElement.TryGetProperty("message", out var msg))
                    {
                        if (msg.TryGetProperty("content", out var content))
                            fullAiContent.Append(content.GetString());
                            
                        // Якщо модель підтримує "thinking" токени, Ollama може слати їх так
                        if (msg.TryGetProperty("thinking", out var thinking))
                            fullAiThinking.Append(thinking.GetString());
                    }
                }
            }
            catch { /* Ігноруємо розірвані JSON-пакети всередині стріму */ }
        }

        // 5. Фінальне збереження відповіді (Entity: ChatMessage)
        var aiMsg = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ChatSessionId = chatSessionId,
            Role = "assistant",
            Content = fullAiContent.ToString(),
            Thinking = fullAiThinking.ToString(), // Зберігаємо роздуми для історії
            CreatedAt = DateTime.UtcNow
        };
        
        _context.ChatMessages.Add(aiMsg);
        await _context.SaveChangesAsync(ct);
    }
}