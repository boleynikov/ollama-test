using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.models;

namespace WebApplication1;

[ApiController]
[Route("api/[controller]")]
public class OllamaController(IHttpClientFactory httpClientFactory) : ControllerBase
{
    private readonly HttpClient _httpClient = httpClientFactory.CreateClient();

    [HttpPost("ask-stream")]
    public async Task AskModelStream([FromBody] ChatRequest request, CancellationToken ct)
    {
        // Тепер ми передаємо 'messages' (весь масив), а не один 'prompt'
        var ollamaRequest = new
        {
            // model = "llama3.1:8b",
            // model = "gemma3:12b",
            model = request.Model,
            messages = request.Messages,
            system = request.System,
            stream = true,
            options = new { 
                temperature = request.Temperature,
                // num_ctx = request.NumCtx          
            }
        };
        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "http://127.0.0.1:11434/api/chat")
        {
            Content = JsonContent.Create(ollamaRequest)
        };

        Response.ContentType = "text/event-stream";
        Response.Headers.Append("X-Accel-Buffering", "no");

        using var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, ct);
        using var stream = await response.Content.ReadAsStreamAsync(ct);
    
        var buffer = new byte[1024];
        int bytesRead;

        while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length, ct)) > 0)
        {
            var chunk = System.Text.Encoding.UTF8.GetString(buffer, 0, bytesRead);
            var lines = chunk.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            foreach (var line in lines)
            {
                await Response.WriteAsync($"data: {line}\n\n");
            }
            await Response.Body.FlushAsync(ct);
        }
    }
}