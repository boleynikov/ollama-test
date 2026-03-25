import type { Message, PersonaConfig } from "../types";

/**
 * UI Designer: Optimized Stream Service
 * Тепер підтримує динамічні маршрути для збереження історії в PostgreSQL
 */

const PORT = 5262;
const BASE_URL = `http://localhost:${PORT}/api/Ollama/ask-stream`;

export const streamOllama = async (
  messages: Message[],
  config: PersonaConfig,
  model: string,
  chatId: string,
  onChunk: (chunk: { content: string; thinking: string }) => void, // Оновлено
  onDone: () => void,
) => {
  const response = await fetch(`${BASE_URL}/${chatId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model,
      system: config.system,
      temperature: config.temperature,
      num_ctx: config.num_ctx,
    }),
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
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("data: ")) {
        try {
          const jsonString = trimmedLine.substring(6);
          const data = JSON.parse(jsonString);

          // UI Designer Fix: Передаємо обидва поля одночасно
          onChunk({
            content: data.message?.content || "",
            thinking: data.message?.thinking || "",
          });

          if (data.done) onDone();
        } catch (e) {}
      }
    }
  }
};
