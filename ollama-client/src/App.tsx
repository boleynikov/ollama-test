import {
  Box,
  ThemeProvider,
  CssBaseline,
  Typography,
  AppBar,
  Toolbar,
  Container,
  alpha,
} from "@mui/material";
import { useState, useMemo } from "react";
import { ChatWindow } from "./components/chat/ChatWindow";
import { MessageInput } from "./components/chat/MessageInput";
import { streamOllama } from "./api/ollamaService";
import { getMacTheme, type ThemeColor } from "./theme";
import { PERSONAS, type Message, type PersonaType } from "./types";
import { PersonaSelector } from "./components/chat/PersonaSelector";
import { ModelSelector, type ModelType } from "./components/chat/ModelSelector";
import { SettingsMenu } from "./components/chat/SettingsMenu";
import { useLocalStorage } from "./hooks/useLocalStorage";

/**
 * UI Designer: App Shell with Model Integration
 * Впровадження системного вибору моделей та Safe Area
 */

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [themeMode, setThemeMode] = useLocalStorage<ThemeColor>(
    "app-theme",
    "blue",
  );

  const [currentModel, setCurrentModel] = useLocalStorage<ModelType>(
    "app-model",
    "gemma3:12b",
  );

  const theme = useMemo(() => getMacTheme(themeMode), [themeMode]);

  // Системні стейти
  const [currentPersona, setCurrentPersona] = useState<PersonaType>("Thinking");

  const activePersonaConfig = useMemo(
    () => PERSONAS[currentPersona],
    [currentPersona],
  );

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedHistory = [...messages, userMsg];

    setMessages(updatedHistory);
    setLoading(true);
    setIsTyping(true);

    let fullAiResponse = "";
    let aiMessageStarted = false;

    await streamOllama(
      updatedHistory,
      activePersonaConfig,
      currentModel, // ТРЕТІЙ АРГУМЕНТ: Назва моделі
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
          bgcolor: "background.default",
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Apple Style Header with Model Switcher */}
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
              sx={{ fontSize: "1rem" }}
            >
              Local Chat
            </Typography>
            {/* Системний перемикач моделей */}
            <ModelSelector
              value={currentModel}
              onChange={setCurrentModel}
              disabled={loading}
            />
            <SettingsMenu
              currentTheme={themeMode}
              onThemeChange={setThemeMode}
            />
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="lg"
          disableGutters
          sx={{ flex: 1, display: "flex", flexDirection: "column" }}
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
            <MessageInput onSend={handleSend} disabled={loading} />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
