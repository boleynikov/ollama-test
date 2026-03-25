import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // Іконка інтелекту
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  alpha,
  Avatar,
  Box,
  Collapse,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "../../types";
import { TypingIndicator } from "./TypingIndicator";

/**
 * UI Designer: macOS Thinking Block
 * Візуалізація процесу роздумів моделі
 */

const ThinkingBlock = ({ thinking }: { thinking?: string }) => {
  const [isExpanded, setIsExpanded] = useState(true); // За замовчуванням розгорнуто під час стрімінгу

  if (!thinking) return null;

  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: "14px",
        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
        borderLeft: (theme) =>
          `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        overflow: "hidden", // Для коректної анімації Collapse
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
        },
      }}
    >
      {/* Header / Toggle Area */}
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          p: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.2, opacity: 0.6 }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 14, color: "primary.main" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontSize: "0.7rem",
            }}
          >
            Дупля збираю
          </Typography>
        </Box>

        <KeyboardArrowDownIcon
          sx={{
            fontSize: 18,
            opacity: 0.4,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: "0 16px 16px 16px" }}>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.secondary",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap", // Зберігаємо форматування роздумів
            }}
          >
            {thinking}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export const ChatWindow = ({
  messages,
  isTyping,
}: {
  messages: Message[];
  isTyping: boolean;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const lastScrollTop = useRef(0); // Для відстеження напрямку руху
  const theme = useTheme();

  /**
   * UI Designer Logic: Детектор наміру користувача
   */
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;

    // 1. Визначаємо напрямок скролу (чи тягне користувач вгору?)
    const isScrollingUp = scrollTop < lastScrollTop.current;
    lastScrollTop.current = scrollTop;

    // 2. Перевіряємо, чи ми в самому низу (з невеликим запасом)
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;

    // 3. ПРАВИЛО: Якщо користувач почав скролити вгору — ВИМИКАЄМО автоскрол миттєво
    if (isScrollingUp && !isAtBottom) {
      setIsAutoScrollEnabled(false);
    }

    // 4. Якщо користувач вручну повернувся в самий низ — вмикаємо назад
    if (isAtBottom) {
      setIsAutoScrollEnabled(true);
    }
  };

  /**
   * Скрол до низу
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const lastMessage = messages[messages.length - 1];

    // Пріоритет 1: Якщо це твоє нове повідомлення — ЗАВЖДИ скролимо вниз
    if (lastMessage?.role === "user") {
      container.scrollTo({ top: container.scrollHeight, behavior: "auto" });
      setIsAutoScrollEnabled(true);
      return;
    }

    // Пріоритет 2: Під час стрімінгу скролимо ТІЛЬКИ якщо автоскрол увімкнено (ти не скролив вгору)
    if (isAutoScrollEnabled) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isAutoScrollEnabled]);

  return (
    <Box
      ref={scrollContainerRef}
      onScroll={handleScroll} // Наш «детектор намірів»
      sx={{
        width: "100%",
        p: { xs: 2, md: 4 },
        pb: "40px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflowY: "auto", // Дозволяємо контейнеру скролитись
        height: "100%",
        // macOS Scrollbar Style
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: alpha(theme.palette.text.primary, 0.1),
          borderRadius: "10px",
          border: "2px solid transparent",
          backgroundClip: "content-box",
        },
      }}
    >
      <Stack spacing={3}>
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isUser ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: isUser ? "primary.main" : "background.paper",
                      border: isUser
                        ? "none"
                        : `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {isUser ? (
                      <PersonIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <SmartToyIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    )}
                  </Avatar>

                  <Box
                    sx={{
                      maxWidth: { xs: "85%", md: "70%" },
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {!isUser && <ThinkingBlock thinking={msg.thinking} />}
                    <Paper
                      elevation={0}
                      sx={{
                        p: "12px 18px",
                        borderRadius: isUser
                          ? "20px 20px 4px 20px"
                          : "20px 20px 20px 4px",
                        bgcolor: isUser ? "primary.main" : "background.paper",
                        color: isUser ? "#fff" : "text.primary",
                        boxShadow: isUser
                          ? "0 4px 12px rgba(0, 122, 255, 0.12)"
                          : "0 2px 8px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <Typography
                        component="div"
                        sx={{ fontSize: "1rem", lineHeight: 1.6 }}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        {/* Додатковий відступ внизу для «повітря» */}
        <Box sx={{ height: 20 }} />
      </Stack>
    </Box>
  );
};
