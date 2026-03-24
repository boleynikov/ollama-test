import { createTheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { type SvgIconProps } from "@mui/material";

/**
 * UI Designer: Dynamic Theme Factory
 * Впровадження семантичних кольорів та токенів для різних режимів
 */

export type ThemeColor = "blue" | "purple" | "dark";

export type ThemeOption = {
  value: ThemeColor;
  label: string;
  color: string;
  icon: React.ElementType<SvgIconProps>;
};

// 1. Єдине джерело істини для тем (Design Tokens)
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
  { value: "dark", label: "Темна", color: "#1D1D1F", icon: DarkModeIcon },
];

export const getMacTheme = (mode: ThemeColor) => {
  const isDark = mode === "dark";

  // Визначення акцентного кольору згідно з палітрою
  const primaryColor = mode === "purple" ? "#AF52DE" : "#007AFF";

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: primaryColor,
        contrastText: "#FFFFFF",
      },
      background: {
        default: isDark ? "#1E1E1E" : "#F5F5F7", // macOS Dark/Light
        paper: isDark ? "#2D2D2D" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#FFFFFF" : "#1D1D1F",
        secondary: isDark ? "#A1A1A6" : "#6E6E73",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
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
          body: {
            transition: "background-color 0.3s ease", // Плавна зміна теми
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
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
    },
  });
};
