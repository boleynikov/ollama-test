import { GlobalStyles as MuiGlobalStyles, CssBaseline } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * UI Designer: Global Styles & Reset
 * Забезпечує системну естетику macOS на рівні всього додатка
 */

export const GlobalStyles = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <>
      {/* Стандартне скидання стилів MUI */}
      <CssBaseline />

      {/* Наші кастомні глобальні правила */}
      <MuiGlobalStyles
        styles={{
          "html, body, #root": {
            margin: 0,
            padding: 0,
            height: "100%",
            width: "100%",
            overflow: "hidden", // Запобігаємо двійним скролбарам на macOS
            // backgroundColor: theme.palette.background.default,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            transition: "background-color 0.3s ease", // Плавна зміна теми
          },

          /* Стилізація скролбарів під macOS */
          "::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "::-webkit-scrollbar-thumb": {
            background: isDark
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(0, 0, 0, 0.12)",
            borderRadius: "10px",
            border: "2px solid transparent",
            backgroundClip: "content-box",
            "&:hover": {
              background: isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.2)",
              backgroundClip: "content-box",
            },
          },

          /* Глобальні анімації для переходів */
          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
      />
    </>
  );
};
