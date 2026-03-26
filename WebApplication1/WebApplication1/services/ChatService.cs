using Microsoft.EntityFrameworkCore;
using WebApplication1.models.entities;
using WebApplication1.services.interfaces;

namespace WebApplication1.services;

public class ChatService(AppDbContext context) : IChatService
{
    private readonly AppDbContext _context = context;

    public async Task<IEnumerable<ChatSession>> GetAllSessionsAsync(CancellationToken ct = default)
    {
        return await _context.ChatSessions
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<ChatSession> CreateSessionAsync(ChatSession session, CancellationToken ct = default)
    {
        if (session.Id == Guid.Empty) session.Id = Guid.NewGuid();
        session.CreatedAt = DateTime.UtcNow;

        _context.ChatSessions.Add(session);
        await _context.SaveChangesAsync(ct);
        return session;
    }

    public async Task<ChatSession?> UpdateSessionAsync(Guid id, ChatSession updateData, CancellationToken ct = default)
    {
        var session = await _context.ChatSessions.FindAsync(new object[] { id }, ct);
        if (session == null) return null;

        if (!string.IsNullOrWhiteSpace(updateData.Title)) session.Title = updateData.Title;
        if (!string.IsNullOrWhiteSpace(updateData.Model)) session.Model = updateData.Model;
        if (!string.IsNullOrWhiteSpace(updateData.Persona)) session.Persona = updateData.Persona;

        await _context.SaveChangesAsync(ct);
        return session;
    }

    public async Task<IEnumerable<ChatMessage>> GetMessagesAsync(Guid sessionId, CancellationToken ct = default)
    {
        return await _context.ChatMessages
            .Where(m => m.ChatSessionId == sessionId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<ChatMessage> SaveMessageAsync(Guid sessionId, ChatMessage message, CancellationToken ct = default)
    {
        message.Id = Guid.NewGuid();
        message.ChatSessionId = sessionId;
        message.CreatedAt = DateTime.UtcNow;

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync(ct);
        return message;
    }

    public async Task<bool> DeleteSessionAsync(Guid id, CancellationToken ct = default)
    {
        var session = await _context.ChatSessions.FindAsync(new object[] { id }, ct);
        if (session == null) return false;

        _context.ChatSessions.Remove(session);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}