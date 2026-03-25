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
  chatId: string, // 1. Додано обов'язковий параметр chatId
  onChunk: (text: string) => void,
  onDone: () => void,
) => {
  // 2. Формуємо динамічний URL з ID чату
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

    /**
     * UI Designer Note: Розбиваємо чанки за форматом SSE (Server-Sent Events)
     * Бекенд тепер шле дані у форматі "data: {json}\n\n"
     */
    const lines = chunk.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("data: ")) {
        try {
          // Витягуємо JSON після префікса "data: "
          const jsonString = trimmedLine.substring(6);
          const data = JSON.parse(jsonString);

          // Обробка контенту від Ollama
          if (data.message?.content) {
            onChunk(data.message.content);
          }

          // Якщо Ollama сигналізує про завершення
          if (data.done) {
            onDone();
          }
        } catch (e) {
          // Ігноруємо неповні JSON-чанки, які можуть виникнути при стрімінгу
          // Це частина стратегії "Reliability"
        }
      }
    }
  }
};
