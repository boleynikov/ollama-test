import {
  Box,
  ThemeProvider,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  alpha,
} from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";
import { MessageInput } from "./components/chat/MessageInput";
import { PersonaSelector } from "./components/chat/PersonaSelector";
import { ModelSelector, type ModelType } from "./components/chat/ModelSelector";
import { SettingsMenu } from "./components/chat/SettingsMenu";
import { getMacTheme, type ThemeColor } from "./theme";
import { useLocalStorage } from "./hooks/useLocalStorage";

import { PERSONAS, type Chat, type Message, type PersonaType } from "./types";
import { chatApi } from "./api/chat";
import { streamOllama } from "./api/ollama";

/**
 * UI Designer: Multi-Chat macOS Workspace
 * Реалізація бічної навігації та синхронізації з PostgreSQL
 */

function App() {
  // --- States: Persistence ---
  const [themeMode, setThemeMode] = useLocalStorage<ThemeColor>(
    "app-theme",
    "blue",
  );
  const [currentModel, setCurrentModel] = useLocalStorage<ModelType>(
    "app-model",
    "gemma3:12b",
  );
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>(
    "active-chat-id",
    null,
  );

  // --- States: UI & Data ---
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<PersonaType>("Thinking");

  const theme = useMemo(() => getMacTheme(themeMode), [themeMode]);
  const activePersonaConfig = useMemo(
    () => PERSONAS[currentPersona],
    [currentPersona],
  );

  // --- Effects: Data Fetching ---

  // Завантаження списку чатів при старті
  useEffect(() => {
    chatApi.getChats().then(setChats).catch(console.error);
  }, []);

  // Завантаження повідомлень при зміні активного чату
  useEffect(() => {
    if (activeChatId) {
      setLoading(true);
      chatApi
        .getMessages(activeChatId)
        .then(setMessages)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // --- Handlers ---

  const handleCreateChat = async () => {
    try {
      const newChat = await chatApi.createChat(
        "Нова розмова",
        currentModel,
        currentPersona,
      );
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    } catch (err) {
      console.error("Не вдалося створити чат:", err);
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      await chatApi.renameChat(chatId, newTitle);
      // Оновлюємо локальний стейт для миттєвого відображення
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c)),
      );
    } catch (err) {
      console.error("Помилка перейменування:", err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId || loading) return;

    // Оптимістичне оновлення UI (User Message)
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    setIsTyping(true);

    let fullAiResponse = "";
    let aiMessageStarted = false;

    // Виклик бекенду (який сам збереже повідомлення в БД)
    await streamOllama(
      [...messages, userMsg], // Передаємо історію + нове повідомлення
      activePersonaConfig,
      currentModel,
      activeChatId, // Передаємо ID чату для збереження на бекенді
      (chunk) => {
        if (!aiMessageStarted) {
          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
          aiMessageStarted = true;
          setIsTyping(false);
        }
        fullAiResponse += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, content: fullAiResponse }];
          }
          return prev;
        });
      },
      () => setLoading(false),
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Sidebar: Навігація по чатах */}
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onCreateChat={handleCreateChat}
          onRenameChat={handleRenameChat}
        />

        {/* Main Content: Робоча область */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0, // Важливо для коректного overflow
            position: "relative",
            overflowY: "auto", // Скролбар тепер на краї контентної області
          }}
        >
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              top: 0,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid",
              borderColor: "divider",
              zIndex: 1100,
            }}
          >
            <Toolbar sx={{ justifyContent: "space-between", px: 4 }}>
              <Typography
                variant="h6"
                color="text.primary"
                sx={{ fontSize: "0.95rem", fontWeight: 700 }}
              >
                {chats.find((c) => c.id === activeChatId)?.title ||
                  "Оберіть чат"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ModelSelector
                  value={currentModel}
                  onChange={setCurrentModel}
                  disabled={loading}
                />
                <SettingsMenu
                  currentTheme={themeMode}
                  onThemeChange={setThemeMode}
                />
              </Box>
            </Toolbar>
          </AppBar>

          <Container
            maxWidth="lg"
            disableGutters
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              visibility: activeChatId ? "visible" : "hidden", // Ховаємо, якщо чат не обрано
            }}
          >
            <ChatWindow messages={messages} isTyping={isTyping} />

            <Box
              component="footer"
              sx={{
                position: "sticky",
                bottom: 0,
                width: "100%",
                zIndex: 1100,
                boxShadow: "0 -10px 15px -3px rgba(0, 0, 0, 0.03)",
              }}
            >
              <PersonaSelector
                selected={currentPersona}
                onSelect={setCurrentPersona}
                disabled={loading}
              />
              <MessageInput
                onSend={handleSend}
                disabled={loading || !activeChatId}
              />
            </Box>
          </Container>

          {!activeChatId && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.5,
              }}
            >
              <Typography variant="body1">
                Створіть або оберіть чат, щоб почати
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
