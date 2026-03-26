import {
  Box,
  ThemeProvider,
  Container,
  AppBar,
  Toolbar,
  Typography,
  alpha,
} from "@mui/material";
import {
  useState,
  useMemo,
  useEffect,
  useOptimistic,
  useTransition,
  useCallback,
} from "react";

// Components
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";
import { MessageInput } from "./components/chat/MessageInput";
import { PersonaSelector } from "./components/chat/PersonaSelector";
import { ModelSelector } from "./components/chat/ModelSelector";
import { SettingsMenu } from "./components/chat/SettingsMenu";

// Logic & Theme
import { getMacTheme, type ThemeColor } from "./theme";
import { GlobalStyles } from "./theme/GlobalStyles";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { PERSONAS, type Chat, type Message, type PersonaType } from "./types";
import { chatApi } from "./api/chat";
import { streamOllama } from "./api/ollama";

/**
 * UI Designer: macOS Multi-Chat Workspace (React 19 Edition)
 * Впроваджено: Vibrancy Effects (AppBar & Footer), useOptimistic, Thinking Blocks
 */

function App() {
  const [isPending, startTransition] = useTransition();

  // --- States ---
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [optimisticChats, setOptimisticChats] = useOptimistic(
    chats,
    (state, action: { type: "add" | "delete" | "rename"; payload: any }) => {
      switch (action.type) {
        case "add":
          if (state.some((c) => c.id === action.payload.id)) {
            return state;
          }
          return [action.payload, ...state];
        case "delete":
          return state.filter((c) => c.id !== action.payload);
        case "rename":
          return state.map((c) =>
            c.id === action.payload.id
              ? { ...c, title: action.payload.title }
              : c,
          );
        default:
          return state;
      }
    },
  );

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => {
      if (state.some((m) => m.id === newMessage.id)) {
        return state;
      }
      return [...state, newMessage];
    },
  );

  const [themeMode, setThemeMode] = useLocalStorage<ThemeColor>(
    "app-theme",
    "blue",
  );
  const [currentModel, setCurrentModel] = useLocalStorage<string>(
    "app-model",
    "",
  );
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>(
    "active-chat-id",
    null,
  );

  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<PersonaType>("Thinking");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  const theme = useMemo(() => getMacTheme(themeMode), [themeMode]);
  const activePersonaConfig = useMemo(
    () => PERSONAS[currentPersona],
    [currentPersona],
  );
  const activeChat = useMemo(
    () => optimisticChats.find((c) => c.id === activeChatId),
    [optimisticChats, activeChatId],
  );

  // --- Effects ---

  useEffect(() => {
    const init = async () => {
      try {
        const [loadedChats, models] = await Promise.all([
          chatApi.getChats(),
          chatApi.getLocalModels(),
        ]);
        setChats(loadedChats);
        setAvailableModels(models);
        if (
          models.length > 0 &&
          (!currentModel || !models.includes(currentModel))
        ) {
          setCurrentModel(models[0]);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setModelsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      setLoading(true);
      chatApi
        .getMessages(activeChatId)
        .then(setMessages)
        .finally(() => setLoading(false));
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // --- Handlers ---

  const handleCreateChat = useCallback(async () => {
    const tempChat: Chat = {
      id: crypto.randomUUID(), // Наш "Золотий ID"
      title: "Нова розмова...",
      model: currentModel,
      persona: currentPersona,
    };

    startTransition(async () => {
      // 1. Додаємо в оптимістичний стейт
      setOptimisticChats({ type: "add", payload: tempChat });

      try {
        const newChat = await chatApi.createChat(
          tempChat.title,
          currentModel,
          currentPersona,
          tempChat.id
        );

        // 3. Оновлюємо реальний стейт
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
      } catch (err) {
        console.error("Помилка створення чату:", err);
      }
    });
  }, [currentModel, currentPersona, setActiveChatId]);

  const handleRenameChat = useCallback(async (id: string, title: string) => {
    startTransition(async () => {
      setOptimisticChats({ type: "rename", payload: { id, title } });
      try {
        await chatApi.renameChat(id, title);
        setChats((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c)),
        );
      } catch (err) {
        console.error(err);
      }
    });
  }, []);

  const handleDeleteChat = useCallback(
    async (id: string) => {
      startTransition(async () => {
        setOptimisticChats({ type: "delete", payload: id });
        if (activeChatId === id) setActiveChatId(null);
        try {
          await chatApi.deleteChat(id);
          setChats((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
          console.error(err);
        }
      });
    },
    [activeChatId, setActiveChatId],
  );

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId || loading) return;

    setLoading(true);
    setIsTyping(true);

    // 1. Створюємо повідомлення користувача з ID
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    startTransition(async () => {
      // 2. Миттєво додаємо в оптимістичний стейт
      addOptimisticMessage(userMsg);

      let fullAiResponse = "";
      let fullAiThinking = "";
      let aiMessageStarted = false;

      // Створюємо ID для майбутньої відповіді бота
      const aiMsgId = crypto.randomUUID();

      try {
        await streamOllama(
          [...messages, userMsg],
          activePersonaConfig,
          currentModel,
          activeChatId,
          ({ content, thinking }) => {
            if (!aiMessageStarted) {
              // ФІКС: Обов'язково додаємо id: aiMsgId сюди!
              setMessages((prev) => [
                ...prev,
                userMsg, // Тепер воно в основному стейті, useOptimistic його відфільтрує
                { id: aiMsgId, role: "assistant", content: "", thinking: "" },
              ]);
              aiMessageStarted = true;
              if (!thinking || thinking?.length === 0) {
                setIsTyping(false);
              }
            }

            fullAiResponse += content;
            fullAiThinking += thinking;

            setMessages((prev) => {
              const last = prev[prev.length - 1];
              // Перевіряємо саме за ID, щоб точно оновити потрібне повідомлення
              if (last?.role === "assistant" && last.id === aiMsgId) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    content: fullAiResponse,
                    thinking: fullAiThinking,
                  },
                ];
              }
              return prev;
            });
          },
          () => {
            setLoading(false);
            setIsTyping(false);
          },
        );
      } catch (err) {
        console.error("Stream error:", err);
        setLoading(false);
      }
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Box
        sx={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        <Sidebar
          chats={optimisticChats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onCreateChat={handleCreateChat}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            position: "relative",
          }}
        >
          {/* Header Panel із Glassmorphism */}
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              top: 0,
              bgcolor: alpha(theme.palette.background.paper, 0.2),
              borderColor: "divider",
              zIndex: 1100,
            }}
          >
            <Toolbar sx={{ justifyContent: "space-between", px: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {activeChat?.title || "Оберіть чат"}
                {isPending && (
                  <Typography variant="caption" sx={{ ml: 2, opacity: 0.5 }}>
                    Збереження...
                  </Typography>
                )}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ModelSelector
                  value={currentModel}
                  models={availableModels}
                  onChange={setCurrentModel}
                  disabled={loading}
                  loading={modelsLoading}
                />
                <SettingsMenu
                  currentTheme={themeMode}
                  onThemeChange={setThemeMode}
                />
              </Box>
            </Toolbar>
          </AppBar>

          {activeChatId ? (
            <Container
              maxWidth="lg"
              disableGutters
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                overflowY: "auto",
              }}
            >
              <ChatWindow messages={optimisticMessages} isTyping={isTyping} />

              {/* Footer Panel із Glassmorphism */}
              <Box
                component="footer"
                sx={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1100,
                  bgcolor: alpha(theme.palette.background.paper, 0.4),
                  backdropFilter: "blur(3px)",

                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                }}
              >
                <PersonaSelector
                  selected={currentPersona}
                  onSelect={setCurrentPersona}
                  disabled={loading}
                />
                <MessageInput onSend={handleSend} disabled={loading} />
              </Box>
            </Container>
          ) : (
            <Box
              sx={{
                flex: 1,
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
