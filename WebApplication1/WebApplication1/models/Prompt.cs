namespace WebApplication1.models;

public class ChatRequest 
{
    public List<OllamaMessage> Messages { get; set; }
    public string Model { get; set; }
    public string System { get; set; } // Окремий параметр для інструкції
    public float Temperature { get; set; }
    public int NumCtx { get; set; }
}

public class OllamaMessage {
    public string Role { get; set; } // "user" або "assistant"
    public string Content { get; set; }
}