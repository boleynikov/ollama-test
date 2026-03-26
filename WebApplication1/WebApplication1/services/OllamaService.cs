using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using WebApplication1.models.entities;
using WebApplication1.models.dto.ollama;
using WebApplication1.services.interfaces;

namespace WebApplication1.services;

public class OllamaService(IHttpClientFactory httpClientFactory, AppDbContext context) : IOllamaService
{
    private readonly HttpClient _httpClient = httpClientFactory.CreateClient("Ollama");
    private readonly AppDbContext _context = context;

    public async Task<IEnumerable<string>> GetLocalModelNamesAsync(CancellationToken ct = default)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<OllamaModelsListDto>("api/tags", ct);
            return response?.Models.Select(m => m.Name) ?? Enumerable.Empty<string>();
        }
        catch
        {
            return new[] { "gemma3:12b", "llama3.1:8b" }; // Fallback
        }
    }

   public async IAsyncEnumerable<string> StreamChatAsync(
    Guid chatSessionId, 
    OllamaChatRequest request, 
    [EnumeratorCancellation] CancellationToken ct = default)
{
    // 1. Збереження повідомлення користувача (залишаємо як було)
    var lastInput = request.Messages.LastOrDefault();
    if (lastInput != null) {
        _context.ChatMessages.Add(new ChatMessage {
            Id = Guid.NewGuid(),
            ChatSessionId = chatSessionId,
            Role = "user",
            Content = lastInput.Content
        });
        await _context.SaveChangesAsync(ct);
    }

    var ollamaPayload = new {
        model = request.Model,
        messages = request.Messages,
        stream = true,
        system = request.SystemPrompt,
        options = new { 
            temperature = request.Options.Temperature,
            num_ctx = request.Options.NumCtx 
        }
    };

    // ВАЖЛИВО: Використовуємо SendAsync для миттєвого читання заголовків 
    var httpRequest = new HttpRequestMessage(HttpMethod.Post, "api/chat")
    {
        Content = JsonContent.Create(ollamaPayload)
    };

    // ResponseHeadersRead — це ключ до стрімінгу
    using var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, ct);
    response.EnsureSuccessStatusCode();

    using var stream = await response.Content.ReadAsStreamAsync(ct);
    using var reader = new StreamReader(stream);

    var fullAiContent = new StringBuilder();
    var fullAiThinking = new StringBuilder();

    // Читаємо по рядках, але виштовхуємо їх негайно
    while (!reader.EndOfStream)
    {
        if (ct.IsCancellationRequested) break;

        var line = await reader.ReadLineAsync(ct);
        if (string.IsNullOrWhiteSpace(line)) continue;

        // Yield return негайно віддає дані в контролер
        yield return line;

        // Накопичуємо дані для бази паралельно
        ProcessLineForDb(line, fullAiContent, fullAiThinking);
    }

    // Збереження в базу тільки ПІСЛЯ завершення циклу стрімінгу
    await SaveAssistantMessageToDb(chatSessionId, fullAiContent.ToString(), fullAiThinking.ToString(), ct);
}

private void ProcessLineForDb(string line, StringBuilder content, StringBuilder thinking)
{
    try {
        using var json = JsonDocument.Parse(line);
        if (json.RootElement.TryGetProperty("message", out var msg)) {
            if (msg.TryGetProperty("content", out var c)) content.Append(c.GetString());
            if (msg.TryGetProperty("thinking", out var t)) thinking.Append(t.GetString());
        }
    } catch { /* Тут помилок бути не повинно, бо line завжди повний JSON */ }
}

private async Task SaveAssistantMessageToDb(
    Guid chatSessionId, 
    string content, 
    string thinking, 
    CancellationToken ct)
{
    // Створюємо нову сутність повідомлення
    var aiMsg = new ChatMessage
    {
        Id = Guid.NewGuid(),
        ChatSessionId = chatSessionId,
        Role = "assistant",
        Content = content,
        Thinking = thinking,
        CreatedAt = DateTime.UtcNow
    };

    // Додаємо в контекст та зберігаємо
    _context.ChatMessages.Add(aiMsg);
    await _context.SaveChangesAsync(ct);
}
}