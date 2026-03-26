import { AppBar, Box, Container, ThemeProvider, Toolbar, Typography, alpha } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useOptimistic, useState, useTransition } from "react";

import { chatApi } from "./api/chat";
import { streamOllama } from "./api/ollama";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";
import { MessageInput } from "./components/chat/MessageInput";
import { ModelSelector } from "./components/chat/ModelSelector";
import { PersonaSelector } from "./components/chat/PersonaSelector";
import { SettingsMenu } from "./components/chat/SettingsMenu";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getMacTheme, type ThemeColor } from "./theme";
import { GlobalStyles } from "./theme/GlobalStyles";
import { PERSONAS, type Chat, type Message, type PersonaType } from "./types";

function App() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // --- 1. React Query: Отримання даних ---
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: chatApi.getChats,
  });

  const { data: availableModels = [] } = useQuery<string[]>({
    queryKey: ["models"],
    queryFn: chatApi.getLocalModels,
  });

  // --- 2. Локальні налаштування ---
  const [themeMode, setThemeMode] = useLocalStorage<ThemeColor>("app-theme", "blue");
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>("active-chat-id", null);
  const [currentModel, setCurrentModel] = useLocalStorage<string>("app-model", "");
  const [currentPersona, setCurrentPersona] = useState<PersonaType>("Thinking");

  // Отримання повідомлень для активного чату
  const { data: messages = [], isFetching: messagesLoading } = useQuery<Message[]>({
    queryKey: ["messages", activeChatId],
    queryFn: () => (activeChatId ? chatApi.getMessages(activeChatId) : Promise.resolve([])),
    enabled: !!activeChatId,
  });

  // --- 3. Оптимістичні стани (React 19) ---
  const [optimisticChats, setOptimisticChats] = useOptimistic(
    chats,
    (state, action: { type: "add" | "delete" | "rename"; payload: any }) => {
      switch (action.type) {
        case "add":
          if (state.some((c) => c.id === action.payload.id)) return state;
          return [action.payload, ...state];
        case "delete": return state.filter((c) => c.id !== action.payload);
        case "rename": return state.map((c) => c.id === action.payload.id ? { ...c, title: action.payload.title } : c);
        default: return state;
      }
    }
  );

  const [optimisticMessages, dispatchOptimisticMessages] = useOptimistic(
    messages,
    (state, action: { type: "add" | "update"; payload: Message }) => {
      switch (action.type) {
        case "add":
          // Перевірка на дублікат, щоб не було "стрибків" при синхронізації з кешем
          if (state.some((m) => m.id === action.payload.id)) return state;
          return [...state, action.payload];

        case "update":
          return state.map((m) =>
            m.id === action.payload.id ? action.payload : m
          );

        default:
          return state;
      }
    }
  );

  const [isTyping, setIsTyping] = useState(false);
  const theme = useMemo(() => getMacTheme(themeMode), [themeMode]);
  const activeChat = useMemo(() => optimisticChats.find((c) => c.id === activeChatId), [optimisticChats, activeChatId]);

  // --- 4. Мутації (React Query) ---
  const createMutation = useMutation({
    mutationFn: (chat: Chat) => chatApi.createChat(chat.title, chat.model, chat.persona, chat.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chats"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: chatApi.deleteChat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chats"] }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => chatApi.renameChat(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chats"] }),
  });

  // --- 5. Handlers ---
  const handleCreateChat = useCallback(() => {
    const tempChat: Chat = {
      id: crypto.randomUUID(),
      title: "Нова розмова...",
      model: currentModel || availableModels[0],
      persona: currentPersona,
    };

    startTransition(async () => {
      // 1. Показуємо оптимістично
      setOptimisticChats({ type: "add", payload: tempChat });

      try {
        // 2. Виконуємо запит
        await createMutation.mutateAsync(tempChat);

        // 3. Тільки після успішного оновлення кешу (в onSuccess) змінюємо ID активного чату
        setActiveChatId(tempChat.id);
      } catch (err) {
        console.error("Помилка:", err);
      }
    });
  }, [currentModel, availableModels, currentPersona, setActiveChatId, createMutation]);

  const handleDeleteChat = useCallback((id: string) => {
    startTransition(async () => {
      setOptimisticChats({ type: "delete", payload: id });
      if (activeChatId === id) setActiveChatId(null);
      await deleteMutation.mutateAsync(id);
    });
  }, [activeChatId]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId) return;

    // 1. ТЕРМІНОВО (Urgent): Індикатор друку
    setIsTyping(true);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const aiMsgId = crypto.randomUUID();

    // 2. ТРАНЗАКЦІЯ: Весь процес стрімінгу вважається одним переходом стану
    startTransition(async () => {
      // Оптимістично додаємо повідомлення користувача
      dispatchOptimisticMessages({ type: "add", payload: userMsg });

      let fullAiResponse = "";
      let fullAiThinking = "";
      let aiMessageStarted = false;

      try {
        await streamOllama(
          [...messages, userMsg], // Базуємось на актуальних даних із кешу
          PERSONAS[currentPersona],
          currentModel,
          activeChatId,
          ({ content, thinking }) => {
            if (!aiMessageStarted) {
              setIsTyping(false);
              // Додаємо порожній бабл асистента
              dispatchOptimisticMessages({
                type: "add",
                payload: { id: aiMsgId, role: "assistant", content: "", thinking: "" },
              });
              aiMessageStarted = true;
            }

            fullAiResponse += content;
            fullAiThinking += thinking;

            // Оновлюємо вміст бабла асистента в реальному часі
            dispatchOptimisticMessages({
              type: "update",
              payload: {
                id: aiMsgId,
                role: "assistant",
                content: fullAiResponse,
                thinking: fullAiThinking
              },
            });
          },
          () => {
            // 3. ФІНАЛ: Коли стрім завершено, інвалідуємо кеш.
            // React Query підтягне реальні дані, і useOptimistic плавно "відпустить" стейт.
            queryClient.invalidateQueries({ queryKey: ["messages", activeChatId] });
            setIsTyping(false);
          }
        );
      } catch (err) {
        console.error("Помилка стріму:", err);
        setIsTyping(false);
      }
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Box sx={{ display: "flex", width: "100vw", height: "100vh", bgcolor: "background.default", overflow: "hidden" }}>
        <Sidebar
          chats={optimisticChats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onCreateChat={handleCreateChat}
          onRenameChat={(id, title) => startTransition(() => {
            setOptimisticChats({ type: "rename", payload: { id, title } });
            renameMutation.mutate({ id, title });
          })}
          onDeleteChat={handleDeleteChat}
        />

        <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <AppBar position="sticky" elevation={0} sx={{ bgcolor: alpha(theme.palette.background.paper, 0.2), backdropFilter: "blur(20px)" }}>
            <Toolbar sx={{ justifyContent: "space-between", px: 4 }}>
              <Typography variant="h6" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                {activeChat?.title || "Оберіть чат"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <ModelSelector value={currentModel} models={availableModels} onChange={setCurrentModel} disabled={isPending || messagesLoading} />
                <SettingsMenu currentTheme={themeMode} onThemeChange={setThemeMode} />
              </Box>
            </Toolbar>
          </AppBar>

          {activeChatId ? (
            <Container maxWidth="lg" disableGutters sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto", }}>
              <ChatWindow messages={optimisticMessages} isTyping={isTyping} />
              <Box
                component="footer"
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.4),
                  borderRadius: '26px',
                  backdropFilter: "blur(3px)",
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1100,
                }}>
                <PersonaSelector selected={currentPersona} onSelect={setCurrentPersona} disabled={isPending || messagesLoading} />
                <MessageInput onSend={handleSend} disabled={isTyping || isPending || messagesLoading} />
              </Box>
            </Container>
          ) : (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
              <Typography>Створіть або оберіть розмову</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;