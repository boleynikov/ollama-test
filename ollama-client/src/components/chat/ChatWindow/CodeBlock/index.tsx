import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { alpha, Box, IconButton, Tooltip, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type CodeProps = {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
};

/**
 * UI Designer: macOS Code Block with Copy Button
 * Кастомний рендерер для Markdown з підтримкою копіювання
 */
export const CodeBlock = ({ children, className }: CodeProps) => {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const handleCopy = async () => {
    const text = String(children).replace(/\n$/, "");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Визначаємо, чи це блок коду чи інлайновий текст
  const isBlock = className?.includes("language-");

  if (!isBlock) {
    return (
      <code
        style={{
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          padding: "2px 6px",
          borderRadius: "4px",
          fontFamily: "'SF Mono', monospace",
        }}
      >
        {children}
      </code>
    );
  }

  return (
    <Box sx={{ position: "relative", my: 2, group: "true" }}>
      <Tooltip
        title={copied ? "Скопійовано!" : "Копіювати"}
        placement="left"
        arrow
      >
        <IconButton
          onClick={handleCopy}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            backdropFilter: "blur(8px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            color: copied ? "success.main" : "text.secondary",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              transform: "scale(1.05)",
            },
          }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                // ВИПРАВЛЕННЯ: Центруємо іконку всередині motion.div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon sx={{ fontSize: 16 }} />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                // ВИПРАВЛЕННЯ: Центруємо іконку всередині motion.div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </IconButton>
      </Tooltip>
      <pre
        style={{
          margin: 0,
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: alpha(theme.palette.common.black, 0.04),
          overflowX: "auto",
          border: `1px solid ${theme.palette.divider}`,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: "0.85rem",
          lineHeight: 1.5,
        }}
      >
        <code>{children}</code>
      </pre>
    </Box>
  );
};
