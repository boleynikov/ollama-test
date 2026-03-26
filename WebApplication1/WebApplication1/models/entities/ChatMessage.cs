namespace WebApplication1.models.entities;

/**
 * UI Designer: Chat Message Entity
 * Представляє окреме повідомлення в межах розмови
 */
public class ChatMessage
{
    public Guid Id { get; set; }
    
    // Зв'язок із сесією розмови
    public Guid ChatSessionId { get; set; }
    
    // Хто відправив: "user" або "assistant"
    public string Role { get; set; } = null!;
    
    // Основний текст відповіді
    public string Content { get; set; } = null!;

    /**
     * UI Designer: Thinking Context
     * Зберігає процес "роздумів" моделі (якщо він був).
     * Додано для того, щоб історія виглядала ідентично при перезавантаженні.
     */
    public string? Thinking { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навігаційна властивість (опціонально для EF)
    public ChatSession? ChatSession { get; set; }
}