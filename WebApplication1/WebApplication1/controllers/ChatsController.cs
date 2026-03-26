using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.models.entities;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatsController(AppDbContext context) => _context = context;

    /**
     * UI Designer: Get Active Sessions
     * Отримує список усіх сесій для відображення в Sidebar 
     */
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChatSession>>> GetChats()
    {
        return await _context.ChatSessions
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    /**
     * UI Designer: Create Session
     * Створює нову сесію розмови
     */
    [HttpPost]
    public async Task<ActionResult<ChatSession>> CreateChat([FromBody] ChatSession session)
    {
        session.Id = Guid.NewGuid();
        session.CreatedAt = DateTime.UtcNow;
        
        _context.ChatSessions.Add(session);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetChats), new { id = session.Id }, session);
    }
    
    /**
     * UI Designer: Universal Patch Method
     * Оновлює Title, Model або Persona без перезапису всього об'єкта
     */
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> PatchChat(Guid id, [FromBody] ChatSession updateData)
    {
        var session = await _context.ChatSessions.FindAsync(id);
        
        if (session == null)
        {
            return NotFound(new { message = "Сесію не знайдено" });
        }

        // Оновлюємо поля за потреби
        if (!string.IsNullOrWhiteSpace(updateData.Title))
            session.Title = updateData.Title;

        if (!string.IsNullOrWhiteSpace(updateData.Model))
            session.Model = updateData.Model;

        if (!string.IsNullOrWhiteSpace(updateData.Persona))
            session.Persona = updateData.Persona;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(session);
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, "Помилка при оновленні сесії в базі даних");
        }
    }

    /**
     * UI Designer: Retrieve Dialogue History
     * Отримує всі повідомлення для конкретної сесії
     */
    [HttpGet("{sessionId:guid}/messages")]
    public async Task<ActionResult<IEnumerable<ChatMessage>>> GetMessages(Guid sessionId)
    {
        return await _context.ChatMessages
            .Where(m => m.ChatSessionId == sessionId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    /**
     * UI Designer: Manual Message Save
     * Зазвичай використовується для системних нотаток або логів
     */
    [HttpPost("{sessionId:guid}/messages")]
    public async Task<ActionResult<ChatMessage>> SaveMessage(Guid sessionId, [FromBody] ChatMessage message)
    {
        message.Id = Guid.NewGuid();
        message.ChatSessionId = sessionId;
        message.CreatedAt = DateTime.UtcNow;
        
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();
        
        return Ok(message);
    }
    
    /**
     * UI Designer: Destructive Action
     * Видаляє сесію та всі пов'язані повідомлення (Cascade)
     */
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteChat(Guid id)
    {
        var session = await _context.ChatSessions.FindAsync(id);
        
        if (session == null)
        {
            return NotFound(new { message = "Сесію вже видалено або не знайдено" });
        }

        try
        {
            _context.ChatSessions.Remove(session);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Не вдалося видалити сесію", details = ex.Message });
        }
    }
}