import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Avatar, Box, Paper, Stack } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "../../../types";
import { TypingIndicator } from "../TypingIndicator";
import { CodeBlock } from "./CodeBlock";
import { ThinkingBlock } from "./ThikingBlock";

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
  console.log('isTyping', isTyping);
  
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
      onScroll={() => handleScroll}
      sx={{ flex: 1, overflowY: "visible", p: { xs: 2, md: 4 } }}
    >
      <Stack spacing={3}>
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    gap: 1.5,
                    alignItems: "flex-end",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor:
                        msg.role === "user"
                          ? "primary.main"
                          : "background.paper",
                    }}
                  >
                    {isUser ? (
                      <PersonIcon fontSize="small" />
                    ) : (
                      <SmartToyIcon fontSize="small" color="disabled" />
                    )}
                  </Avatar>
                  <Box
                    sx={{
                      maxWidth: "75%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {!isUser && <ThinkingBlock thinking={msg.thinking} />}
                    <Paper
                      elevation={0}
                      sx={{
                        p: "10px 18px",
                        borderRadius:
                          msg.role === "user"
                            ? "20px 20px 4px 20px"
                            : "20px 20px 20px 4px",
                        bgcolor:
                          msg.role === "user"
                            ? "primary.main"
                            : "background.paper",
                        color: msg.role === "user" ? "#fff" : "text.primary",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          // UI Designer: Використовуємо наш новий CodeBlock
                          code: CodeBlock,
                          // Вимикаємо стандартний pre, бо наш CodeBlock вже має його всередині
                          pre: ({ children }) => <>{children}</>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </Paper>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <Box sx={{ height: 20 }} />
      </Stack>
    </Box>
  );
};
