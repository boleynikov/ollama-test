import { Box, InputBase, IconButton, useTheme, alpha } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useState } from "react";

/**
 * UI Designer: Message Input Component
 * Реалізація піксельної точності та інтерактивних станів
 */

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [text, setText] = useState("");
  const theme = useTheme();

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText("");
    }
  };

  const isButtonActive = text.trim() && !disabled;

  return (
    <Box
      component="section"
      sx={{
        p: theme.spacing(3), // Spacing Token: Space-3
        display: "flex",
        alignItems: "flex-end", // Для коректного вирівнювання при multiline

        // macOS Glassmorphism Integration
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: "blur(20px)",

        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
      }}
    >
      <InputBase
        multiline
        maxRows={4}
        placeholder="Повідомлення..."
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        sx={{
          flex: 1,
          minHeight: 40,
          p: "8px 16px", // Pixel-perfect padding

          // Typography Token: Body1
          fontSize: theme.typography.body1.fontSize,
          fontFamily: theme.typography.fontFamily,

          // Native macOS Input Look
          bgcolor: alpha(theme.palette.text.primary, 0.04),
          borderRadius: "20px",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.05),

          transition: theme.transitions.create(["border-color", "box-shadow"], {
            duration: 150, // Transition Fast
          }),

          "&.Mui-focused": {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`, // Focus visual indicator
          },

          "& .MuiInputBase-input": {
            "&::placeholder": {
              color: theme.palette.text.secondary,
              opacity: 0.7,
            },
          },
        }}
      />

      <IconButton
        onClick={handleSend}
        disabled={!isButtonActive}
        aria-label="Надіслати повідомлення"
        sx={{
          ml: 2, // Space-2 Token
          width: 36,
          height: 36,

          // Dynamic Action Colors
          bgcolor: isButtonActive
            ? "primary.main"
            : alpha(theme.palette.text.primary, 0.05),
          color: isButtonActive
            ? "primary.contrastText"
            : alpha(theme.palette.text.primary, 0.2),

          transition: theme.transitions.create(
            ["transform", "background-color", "box-shadow"],
            {
              duration: 150, // Transition Fast
            },
          ),

          "&:hover": {
            bgcolor: isButtonActive
              ? "primary.dark"
              : alpha(theme.palette.text.primary, 0.05),
            transform: isButtonActive ? "translateY(-1px)" : "none", // Interaction feedback
            boxShadow: isButtonActive ? theme.shadows[2] : "none",
          },

          "&:active": {
            transform: isButtonActive ? "scale(0.92)" : "none", // Micro-animation for tactile feel
          },

          "&.Mui-disabled": {
            bgcolor: alpha(theme.palette.text.primary, 0.05),
            color: alpha(theme.palette.text.primary, 0.15), // WCAG AA accessibility compliance
          },
        }}
      >
        <ArrowUpwardIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );
};
