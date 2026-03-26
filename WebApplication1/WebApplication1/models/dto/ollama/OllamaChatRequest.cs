namespace WebApplication1.models.dto.ollama;

using System.Text.Json.Serialization;

/**
 * UI Designer: Ollama API Request DTO
 * Специфікація запиту до моделі Ollama
 */
public class OllamaChatRequest
{
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    [JsonPropertyName("messages")]
    public List<OllamaMessageDto> Messages { get; set; } = new();

    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = true;

    /**
     * UI Designer: System Prompt
     * Глобальна інструкція для моделі (Persona)
     */
    [JsonPropertyName("system")]
    public string? SystemPrompt { get; set; }

    /**
     * UI Designer: Generation Parameters
     * Ollama очікує ці параметри всередині об'єкта "options"
     */
    [JsonPropertyName("options")]
    public OllamaOptions Options { get; set; } = new();
}

public class OllamaOptions
{
    [JsonPropertyName("temperature")]
    public float Temperature { get; set; } = 0.7f;

    [JsonPropertyName("num_ctx")]
    public int NumCtx { get; set; } = 4096;
}