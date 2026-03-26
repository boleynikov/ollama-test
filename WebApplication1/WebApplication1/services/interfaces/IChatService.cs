using WebApplication1.models.entities;

namespace WebApplication1.services.interfaces;

public interface IChatService
{
    Task<IEnumerable<ChatSession>> GetAllSessionsAsync(CancellationToken ct = default);
    Task<ChatSession> CreateSessionAsync(ChatSession session, CancellationToken ct = default);
    Task<ChatSession?> UpdateSessionAsync(Guid id, ChatSession updateData, CancellationToken ct = default);
    Task<IEnumerable<ChatMessage>> GetMessagesAsync(Guid sessionId, CancellationToken ct = default);
    Task<ChatMessage> SaveMessageAsync(Guid sessionId, ChatMessage message, CancellationToken ct = default);
    Task<bool> DeleteSessionAsync(Guid id, CancellationToken ct = default);
}