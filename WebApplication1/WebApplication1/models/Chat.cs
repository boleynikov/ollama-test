namespace WebApplication1.models;

public class Chat
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "Новий чат";
    public string Model { get; set; } = "gemma3:12b";
    public string Persona { get; set; } = "Thinking";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навігаційна властивість
    public List<Message> Messages { get; set; } = new();
}

public class Message
{
    public Guid Id { get; set; }
    public Guid ChatId { get; set; }
    public string Role { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}