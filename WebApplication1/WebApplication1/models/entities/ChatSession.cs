namespace WebApplication1.models.entities;

/**
 * UI Designer: Domain Entity for a Chat Instance
 * Представляє збережену сесію розмови в базі даних
 */
public class ChatSession
{
    public Guid Id { get; set; }
    
    // Тема розмови (відображається в Sidebar)
    public string Title { get; set; } = "Нова розмова";
    
    // Модель, закріплена за цією сесією (напр. "gemma3:12b")
    public string Model { get; set; } = "gemma3:12b";
    
    // Обрана персона (напр. "Thinking", "Creative")
    public string Persona { get; set; } = "Thinking";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /** * Навігаційна властивість для Entity Framework
     * Змінено з Message -> ChatMessage для усунення плутанини
     */
    public List<ChatMessage> Messages { get; set; } = new();
}