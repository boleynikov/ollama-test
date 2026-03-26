using Microsoft.AspNetCore.Mvc;
using WebApplication1.services.interfaces;
using WebApplication1.models.dto.ollama;

namespace WebApplication1.controllers;

[ApiController]
[Route("api/[controller]")]
public class OllamaController(IOllamaService ollamaService) : ControllerBase
{
    private readonly IOllamaService _ollamaService = ollamaService;

    [HttpGet("local-models")]
    public async Task<IActionResult> GetLocalModels()
    {
        var models = await _ollamaService.GetLocalModelNamesAsync();
        return Ok(models);
    }

    [HttpPost("ask-stream/{chatSessionId:guid}")]
    public async Task AskModelStream(Guid chatSessionId, [FromBody] OllamaChatRequest request, CancellationToken ct)
    {
        Response.ContentType = "text/event-stream";
        Response.Headers.Append("Cache-Control", "no-cache"); // Забороняємо кешування
        Response.Headers.Append("Connection", "keep-alive");
        Response.Headers.Append("X-Accel-Buffering", "no"); // Для Nginx 

        try 
        {
            await foreach (var line in _ollamaService.StreamChatAsync(chatSessionId, request, ct))
            {
                // Формат SSE: "data: {json}\n\n"
                await Response.WriteAsync($"data: {line}\n\n", ct);
            
                // ПРИМУСОВИЙ ФЛАШ: Виштовхуємо дані з буфера сервера в мережу
                await Response.Body.FlushAsync(ct);
            }
        }
        catch (OperationCanceledException) 
        {
            // Користувач закрив вкладку або натиснув "Stop" — це нормально
        }
    }
}