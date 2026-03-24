import {
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  useTheme,
} from "@mui/material";

/**
 * UI Designer: Model Selector (Segmented Control)
 * Створено для чіткої візуальної ієрархії в шапці
 */

export type ModelType = "llama3.1:8b" | "gemma3:12b";

interface Props {
  value: ModelType;
  onChange: (model: ModelType) => void;
  disabled: boolean;
}

export const ModelSelector = ({ value, onChange, disabled }: Props) => {
  const theme = useTheme();

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
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "text.secondary",
          textTransform: "none",
          transition: "all 150ms ease", // Transition Fast

          "&.Mui-selected": {
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)", // Shadow SM
            "&:hover": { bgcolor: "background.paper" },
          },
        },
      }}
    >
      <ToggleButton value="llama3.1:8b">Llama 3.1</ToggleButton>
      <ToggleButton value="gemma3:12b">Gemma 3</ToggleButton>
    </ToggleButtonGroup>
  );
};
