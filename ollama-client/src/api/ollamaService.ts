import type { Message, PersonaConfig } from "../types";

const PORT = 5262;
const API_URL = `http://localhost:${PORT}/api/Ollama/ask-stream`;

export const streamOllama = async (
  messages: Message[],
  config: PersonaConfig,
  model: string,
  onChunk: (text: string) => void,
  onDone: () => void,
) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model,
      system: config.system,
      temperature: config.temperature,
      num_ctx: config.num_ctx,
    }), // Відправляємо масив об'єктів
  });

  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.trim().startsWith("data: ")) {
        try {
          const data = JSON.parse(line.substring(6));
          // У Chat API відповідь лежить у message.content
          if (data.message?.content) {
            onChunk(data.message.content);
          }
          if (data.done) onDone();
        } catch (e) {}
      }
    }
  }
};
