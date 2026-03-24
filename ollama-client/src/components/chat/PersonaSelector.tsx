import { Stack, Chip, Box, useTheme, alpha } from "@mui/material";
import { type PersonaType, PERSONAS_OPTIONS } from "../../types";

/**
 * UI Designer: Persona Selector Component
 * Реалізація Glassmorphism та системних токенів взаємодії
 */

interface Props {
  selected: PersonaType;
  onSelect: (type: PersonaType) => void;
  disabled: boolean;
}

export const PersonaSelector = ({ selected, onSelect, disabled }: Props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        px: theme.spacing(4), // Використання Space-4 Token
        py: theme.spacing(2),

        // macOS Glassmorphism System
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: "blur(20px)", // Ефект розмиття фону для візуальної легкості

        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        overflow: "visible",
      }}
    >
      <Stack
        direction="row"
        spacing={2} // Space-2 Token
        sx={{
          overflowX: "auto",
          pb: 1,
          // Приховуємо скролбар для "піксельної точності"
          "::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {PERSONAS_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <Chip
              key={opt.value}
              label={opt.label}
              clickable
              disabled={disabled}
              onClick={() => onSelect(opt.value)}
              // Мікровзаємодії та токени анімації
              sx={{
                height: 32,
                borderRadius: "10px", // System standard
                px: 0.5,
                fontWeight: isSelected ? 600 : 500,
                fontSize: "0.8125rem",

                // Динамічні кольори на основі токенів бренду
                bgcolor: isSelected
                  ? theme.palette.primary.main
                  : alpha(theme.palette.text.primary, 0.04),
                color: isSelected
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
                border: "1px solid",
                borderColor: isSelected
                  ? theme.palette.primary.main
                  : alpha(theme.palette.divider, 0.08),

                transition: theme.transitions.create(
                  ["background-color", "transform", "box-shadow"],
                  {
                    duration: 150, // Transition Fast
                  },
                ),

                "&:hover": {
                  bgcolor: isSelected
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.text.primary, 0.08),
                  transform: disabled ? "none" : "translateY(-1px)", // Стан наведення
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(0, 122, 255, 0.2)"
                    : "none",
                },

                "&:active": {
                  transform: "scale(0.96)", // Стан натискання для тактильного відгуку
                },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
