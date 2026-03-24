import { Box, Avatar, Stack, Paper, Typography, useTheme } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { motion, AnimatePresence } from "framer-motion";
import { TypingIndicator } from "./TypingIndicator";
import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import ReactMarkdown from "react-markdown";

/**
 * UI Designer: Chat Window Component
 * Реалізація Safe Area та Markdown System
 */

const messageAnimation = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const;

export const ChatWindow = ({
  messages,
  isTyping,
}: {
  messages: Message[];
  isTyping: boolean;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isTyping]);

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        p: { xs: 2, md: 4 },
        pb: "40px", // Системний відступ між контентом і панеллю
        display: "flex",
        flexDirection: "column",
        flex: 1,

        "& .markdown-content": {
          fontSize: "1rem",
          lineHeight: 1.6,
          "& pre": {
            bgcolor: "rgba(0, 0, 0, 0.04)",
            p: 3,
            borderRadius: 8,
            overflowX: "auto",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          },
          "& code": {
            bgcolor: "rgba(0, 0, 0, 0.05)",
            px: 0.6,
            py: 0.2,
            borderRadius: 1,
          },
        },
      }}
    >
      <Stack spacing={3}>
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <motion.div key={idx} {...messageAnimation}>
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
                      border: isUser ? "none" : "1px solid rgba(0,0,0,0.08)",
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
                  <Paper
                    elevation={0}
                    sx={{
                      p: "12px 18px",
                      maxWidth: { xs: "85%", md: "70%" },
                      borderRadius: isUser
                        ? "20px 20px 4px 20px"
                        : "20px 20px 20px 4px",
                      bgcolor: isUser ? "primary.main" : "background.paper",
                      color: isUser ? "#fff" : "text.primary",
                      boxShadow: isUser
                        ? "0 4px 12px rgba(0, 122, 255, 0.15)"
                        : "0 2px 8px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Typography component="div" className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </Typography>
                  </Paper>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
        <Box sx={{ height: theme.spacing(4) }} aria-hidden="true" />
        <div ref={scrollRef} aria-hidden="true" />
      </Stack>
    </Box>
  );
};
