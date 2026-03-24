import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { type ThemeColor, THEME_OPTIONS } from "../../theme";

/**
 * UI Designer: Scalable Settings Menu
 * Використання маппінгу для усунення хардкоду та підтримки консистентності
 */

interface SettingsMenuProps {
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
}

export const SettingsMenu = ({
  currentTheme,
  onThemeChange,
}: SettingsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: "text.secondary",
          "&:hover": {
            color: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        <SettingsIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            backdropFilter: "blur(20px)",
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1.5,
            display: "block",
            fontWeight: 700,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Зовнішній вигляд
        </Typography>

        {/* UI Designer: Динамічний рендеринг через .map() */}
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = currentTheme === opt.value;

          return (
            <MenuItem
              key={opt.value}
              onClick={() => {
                onThemeChange(opt.value);
                handleClose();
              }}
              selected={isSelected}
              sx={{
                borderRadius: "8px",
                mx: 1,
                mb: 0.5,
                // Micro-interaction для стану вибору
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  },
                },
              }}
            >
              <ListItemIcon>
                <Icon
                  sx={{ color: opt.value === "dark" ? "inherit" : opt.color }}
                  fontSize="small"
                />
              </ListItemIcon>
              <ListItemText
                primary={opt.label}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: isSelected ? 600 : 400,
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
