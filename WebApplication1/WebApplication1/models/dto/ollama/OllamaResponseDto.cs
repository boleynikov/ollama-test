namespace WebApplication1.Models.Dto.Ollama;

using System.Text.Json.Serialization;

/**
 * UI Designer: Ollama API Response DTO
 * Описує структуру відповіді або окремого чанка під час стрімінгу
 */
public class OllamaResponseDto
{
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    // Текст відповіді (або частина тексту при стрімінгу)
    [JsonPropertyName("response")]
    public string Response { get; set; } = string.Empty;

    [JsonPropertyName("done")]
    public bool Done { get; set; }

    // Причина завершення (напр. "stop" або "length")
    [JsonPropertyName("done_reason")]
    public string? DoneReason { get; set; }

    // Контекстне вікно (масив токенів для збереження стану)
    [JsonPropertyName("context")]
    public List<long>? Context { get; set; }

    /**
     * UI Designer: Performance Metrics
     * Примітка: Всі тривалості вказані у наносекундах
     */

    [JsonPropertyName("total_duration")]
    public long TotalDuration { get; set; }

    [JsonPropertyName("load_duration")]
    public long LoadDuration { get; set; }

    [JsonPropertyName("prompt_eval_count")]
    public int PromptEvalCount { get; set; }

    [JsonPropertyName("prompt_eval_duration")]
    public long PromptEvalDuration { get; set; }

    [JsonPropertyName("eval_count")]
    public int EvalCount { get; set; }

    [JsonPropertyName("eval_duration")]
    public long EvalDuration { get; set; }
}