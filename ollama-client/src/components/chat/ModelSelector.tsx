import {
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  useTheme,
  Skeleton,
} from "@mui/material";

/**
 * UI Designer: Dynamic Model Selector
 * Тепер автоматично будує інтерфейс на основі доступних в Ollama моделей
 */

interface Props {
  value: string; // Тепер просто string, бо моделі динамічні
  models: string[]; // Список моделей з бекенду
  onChange: (model: string) => void;
  disabled: boolean;
  loading?: boolean;
}

export const ModelSelector = ({
  value,
  models,
  onChange,
  disabled,
  loading,
}: Props) => {
  const theme = useTheme();

  // Якщо моделі ще вантажаться, показуємо "скелетон" у стилі macOS
  if (loading && models.length === 0) {
    return (
      <Skeleton
        variant="rounded"
        width={200}
        height={32}
        sx={{ borderRadius: "8px" }}
      />
    );
  }

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, newValue) => newValue && onChange(newValue)}
      disabled={disabled}
      size="small"
      sx={{
        bgcolor: alpha(theme.palette.text.primary, 0.05),
        borderRadius: "8px",
        p: 0.5,
        border: "none",
        "& .MuiToggleButton-root": {
          px: 2,
          py: 0.5,
          borderRadius: "6px !important",
          border: "none",
          fontSize: "0.72rem", // Трохи менший шрифт для довгих назв
          fontWeight: 600,
          color: "text.secondary",
          textTransform: "uppercase", // Apple Style для тех-параметрів
          letterSpacing: "0.02em",
          transition: "all 150ms ease",

          "&.Mui-selected": {
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            "&:hover": { bgcolor: "background.paper" },
          },
        },
      }}
    >
      {models.map((modelName) => (
        <ToggleButton key={modelName} value={modelName}>
          {/* Вирізаємо ":latest" для чистоти UI, якщо воно є */}
          {modelName.replace(":latest", "")}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
