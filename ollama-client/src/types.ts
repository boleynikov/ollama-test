import type { ModelType } from "./components/chat/ModelSelector";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type OllamaChunk = {
  response: string;
  done: boolean;
  context?: number[];
};

export interface Chat {
  id: string;
  title: string;
  model: ModelType; // Використовуємо суворий тип замість просто string
  persona: PersonaType;
  createdAt: string; // DateTime -> ISO string

  /**
   * Навігаційна властивість: Масив повідомлень.
   * Опціонально, бо при завантаженні списку для Sidebar ми можемо їх не тягнути
   */
  messages?: Message[];
}

export type PersonaType =
  | "Thinking"
  | "Sarcasm"
  | "Planning"
  | "Friend"
  | "Girlfriend";

// 1. Це масив для ВІДОБРАЖЕННЯ в інтерфейсі (UI)
export const PERSONAS_OPTIONS: { label: string; value: PersonaType }[] = [
  { label: "🧠 Думаюча", value: "Thinking" },
  { label: "😏 Саркастична", value: "Sarcasm" },
  { label: "📅 Планування", value: "Planning" },
  { label: "🤝 Кращий друг", value: "Friend" },
  { label: "❤️ Дівчина", value: "Girlfriend" },
];

export type PersonaConfig = {
  system: string;
  temperature: number; // 0.0 - 1.0 (точность vs креативность)
  num_ctx: number; // размер контекста
};

// 2. А це самі інструкції для Ollama
export const PERSONAS: Record<PersonaType, PersonaConfig> = {
  Thinking: {
    system:
      "You are a professional analyst. Provide logical, structured, and deep responses. **Always respond in Ukrainian.**",
    temperature: 0.2,
    num_ctx: 8192,
  },
  Sarcasm: {
    system:
      "You are a sarcastic and witty AI programmer. Use irony and dry humor. Be slightly edgy but helpful. **Always respond in Ukrainian.**",
    temperature: 0.9,
    num_ctx: 2048,
  },
  Planning: {
    system:
      "You are an expert Project Manager. Focus on deadlines, priorities, and actionable checklists. **Always respond in Ukrainian.**",
    temperature: 0.4,
    num_ctx: 4096,
  },
  Friend: {
    system:
      "You are a best friend (bro). Use informal language, slang, and emojis. Be supportive and chill. **Always respond in Ukrainian.**",
    temperature: 0.7,
    num_ctx: 2048,
  },
  Girlfriend: {
    system:
      "You are a caring and loving girlfriend. Be sweet, supportive, and use affectionate words and hearts. **Always respond in Ukrainian.**",
    temperature: 0.8,
    num_ctx: 2048,
  },
};
