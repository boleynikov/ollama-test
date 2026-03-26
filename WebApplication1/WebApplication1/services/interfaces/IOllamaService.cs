using WebApplication1.models.dto.ollama;

namespace WebApplication1.services.interfaces;

public interface IOllamaService
{
    Task<IEnumerable<string>> GetLocalModelNamesAsync(CancellationToken ct = default);
    IAsyncEnumerable<string> StreamChatAsync(Guid chatSessionId, OllamaChatRequest request, CancellationToken ct = default);
}