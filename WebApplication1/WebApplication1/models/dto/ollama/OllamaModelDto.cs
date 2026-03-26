namespace WebApplication1.models.dto.ollama;

using System.Text.Json.Serialization;

/**
 * UI Designer: Ollama Inventory DTOs
 * Описує структуру даних локальних моделей, які встановлені в Ollama
 */

public class OllamaModelsListDto
{
    [JsonPropertyName("models")]
    public List<OllamaModelDto> Models { get; set; } = new();
}

public class OllamaModelDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    // Технічний ID моделі (напр. "gemma3:12b")
    [JsonPropertyName("model")]
    public string ModelId { get; set; } = string.Empty;

    [JsonPropertyName("modified_at")]
    public DateTime ModifiedAt { get; set; }

    // Вага моделі в байтах
    [JsonPropertyName("size")]
    public long Size { get; set; }

    [JsonPropertyName("digest")]
    public string Digest { get; set; } = string.Empty;

    [JsonPropertyName("details")]
    public OllamaModelDetailsDto Details { get; set; } = new();
}

public class OllamaModelDetailsDto
{
    [JsonPropertyName("parent_model")]
    public string ParentModel { get; set; } = string.Empty;

    [JsonPropertyName("format")]
    public string Format { get; set; } = string.Empty;

    [JsonPropertyName("family")]
    public string Family { get; set; } = string.Empty;

    [JsonPropertyName("families")]
    public List<string>? Families { get; set; }

    [JsonPropertyName("parameter_size")]
    public string ParameterSize { get; set; } = string.Empty;

    [JsonPropertyName("quantization_level")]
    public string QuantizationLevel { get; set; } = string.Empty;
}