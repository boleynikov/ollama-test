import { createTheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // Іконка для градієнтної теми
import { type SvgIconProps } from "@mui/material";

/**
 * UI Designer: Dynamic Theme Factory
 * Додано підтримку Cosmic Gradient для преміального вигляду
 */

// Додаємо "cosmic" у список доступних кольорів
export type ThemeColor = "blue" | "purple" | "dark" | "cosmic";

export type ThemeOption = {
  value: ThemeColor;
  label: string;
  color: string;
  icon: React.ElementType<SvgIconProps>;
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "blue",
    label: "Синя (Classic)",
    color: "#007AFF",
    icon: ColorLensIcon,
  },
  {
    value: "purple",
    label: "Фіолетова",
    color: "#AF52DE",
    icon: ColorLensIcon,
  },
  {
    value: "cosmic",
    label: "Cosmic Gradient",
    color: "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)", // Візуалізація градієнта в меню
    icon: AutoAwesomeIcon,
  },
  { value: "dark", label: "Темна", color: "#1D1D1F", icon: DarkModeIcon },
];

export const getMacTheme = (mode: ThemeColor) => {
  const isDark = mode === "dark" || mode === "cosmic"; // Cosmic за замовчуванням базується на темному режимі

  // Логіка вибору базового акцентного кольору
  const getPrimaryColor = () => {
    switch (mode) {
      case "purple":
        return "#AF52DE";
      case "cosmic":
        return "#6366F1"; // Базовий колір градієнта
      default:
        return "#007AFF";
    }
  };

  const primaryColor = getPrimaryColor();

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: primaryColor,
        contrastText: "#FFFFFF",
      },
      background: {
        default: isDark ? "#0F1115" : "#F5F5F7", // Для Cosmic робимо фон ще глибшим
        paper: isDark ? "#1C1F26" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#FFFFFF" : "#1D1D1F",
        secondary: isDark ? "#94A3B8" : "#6E6E73",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    },
    spacing: 4,
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      h6: { fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            // Реєструємо CSS-токен для градієнта, щоб використовувати його в компонентах
            "--gradient-primary":
              mode === "cosmic"
                ? "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)"
                : primaryColor,
            "--transition-standard": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          body: {
            transition: "var(--transition-standard)",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.1)",
              borderRadius: "10px",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 10px 15px -3px rgba(0, 0, 0, 0.4)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      // Приклад автоматичного використання градієнта для активних ListItem у Sidebar
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              // Градієнтний фон для теми 'cosmic'
              background:
                mode === "cosmic" ? "var(--gradient-primary)" : undefined,

              // UI Designer Fix: Встановлюємо БІЛИЙ колір тексту для контрасту
              color: mode === "cosmic" ? "#FFFFFF" : undefined,

              // Також робимо іконку білою
              "& .MuiListItemIcon-root": {
                color: mode === "cosmic" ? "#FFFFFF" : "inherit",
              },

              "&:hover": {
                background:
                  mode === "cosmic" ? "var(--gradient-primary)" : undefined,
                opacity: 0.9,
              },
            },
          },
        },
      },
    },
  });
};
