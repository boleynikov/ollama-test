const API_BASE = "http://localhost:5262/api/chats";

export const chatApi = {
  // Завантажити список чатів
  getChats: () => fetch(API_BASE).then((res) => res.json()),

  // Створити чат
  createChat: (title: string, model: string, persona: string, id: string) =>
    fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, model, persona }),
    }).then((res) => res.json()),

  // Отримати повідомлення
  getMessages: (chatId: string) =>
    fetch(`${API_BASE}/${chatId}/messages`).then((res) => res.json()),
  renameChat: (chatId: string, newTitle: string) =>
    fetch(`${API_BASE}/${chatId}`, {
      method: "PATCH", // Або PUT, залежно від твого бекенду
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    }).then((res) => res.json()),

  getLocalModels: (): Promise<string[]> =>
    fetch("http://localhost:5262/api/Ollama/local-models").then((res) =>
      res.json(),
    ),

  deleteChat: (chatId: string) =>
    fetch(`${API_BASE}/${chatId}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to delete chat");
      return res;
    }),
};
