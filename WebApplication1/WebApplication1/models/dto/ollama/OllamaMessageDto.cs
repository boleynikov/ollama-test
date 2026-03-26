namespace WebApplication1.models.dto.ollama;

using System.Text.Json.Serialization;

/**
 * UI Designer: Ollama Message Transfer Object
 * Мінімальний набір даних для спілкування з API
 */
public class OllamaMessageDto
{
    // Роль відправника: "user" або "assistant"
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    // Текст повідомлення
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
}