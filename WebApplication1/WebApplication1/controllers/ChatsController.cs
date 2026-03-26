using Microsoft.AspNetCore.Mvc;
using WebApplication1.models.entities;
using WebApplication1.services.interfaces;

namespace WebApplication1.controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatsController(IChatService chatService) : ControllerBase
{
    private readonly IChatService _chatService = chatService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChatSession>>> GetChats()
    {
        return Ok(await _chatService.GetAllSessionsAsync());
    }

    [HttpPost]
    public async Task<ActionResult<ChatSession>> CreateChat([FromBody] ChatSession session)
    {
        var newSession = await _chatService.CreateSessionAsync(session);
        return CreatedAtAction(nameof(GetChats), new { id = newSession.Id }, newSession);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> PatchChat(Guid id, [FromBody] ChatSession updateData)
    {
        var updated = await _chatService.UpdateSessionAsync(id, updateData);
        return updated != null ? Ok(updated) : NotFound(new { message = "Сесію не знайдено" });
    }

    [HttpGet("{sessionId:guid}/messages")]
    public async Task<ActionResult<IEnumerable<ChatMessage>>> GetMessages(Guid sessionId)
    {
        return Ok(await _chatService.GetMessagesAsync(sessionId));
    }

    [HttpPost("{sessionId:guid}/messages")]
    public async Task<ActionResult<ChatMessage>> SaveMessage(Guid sessionId, [FromBody] ChatMessage message)
    {
        return Ok(await _chatService.SaveMessageAsync(sessionId, message));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteChat(Guid id)
    {
        var success = await _chatService.DeleteSessionAsync(id);
        return success ? NoContent() : NotFound(new { message = "Сесію не знайдено" });
    }
}