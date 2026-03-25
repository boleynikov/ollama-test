using WebApplication1.models;

namespace WebApplication1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ChatsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatsController(AppDbContext context) => _context = context;

    // Отримати всі чати для Sidebar
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Chat>>> GetChats()
    {
        return await _context.Chats
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // Створити новий чат
    [HttpPost]
    public async Task<ActionResult<Chat>> CreateChat([FromBody] Chat chat)
    {
        chat.Id = Guid.NewGuid();
        chat.CreatedAt = DateTime.UtcNow;
        _context.Chats.Add(chat);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetChats), new { id = chat.Id }, chat);
    }
    
    /**
     * UI Designer: Universal Patch Method
     * Дозволяє оновити будь-яке поле чату (Title, Model, Persona)
     */
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> PatchChat(Guid id, [FromBody] Chat updateData)
    {
        var chat = await _context.Chats.FindAsync(id);
        
        if (chat == null)
        {
            return NotFound(new { message = "Чат не знайдено" });
        }

        // Оновлюємо поля лише якщо вони передані в запиті
        if (!string.IsNullOrWhiteSpace(updateData.Title))
            chat.Title = updateData.Title;

        if (!string.IsNullOrWhiteSpace(updateData.Model))
            chat.Model = updateData.Model;

        if (!string.IsNullOrWhiteSpace(updateData.Persona))
            chat.Persona = updateData.Persona;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(chat); // Повертаємо оновлений об'єкт для синхронізації фронтенду
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, "Помилка при оновленні бази даних");
        }
    }

    // Отримати історію повідомлень конкретного чату
    [HttpGet("{chatId}/messages")]
    public async Task<ActionResult<IEnumerable<Message>>> GetMessages(Guid chatId)
    {
        return await _context.Messages
            .Where(m => m.ChatId == chatId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    // Зберегти нове повідомлення
    [HttpPost("{chatId}/messages")]
    public async Task<ActionResult<Message>> SaveMessage(Guid chatId, [FromBody] Message message)
    {
        message.Id = Guid.NewGuid();
        message.ChatId = chatId;
        message.CreatedAt = DateTime.UtcNow;
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return Ok(message);
    }
}