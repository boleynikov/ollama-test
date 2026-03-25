import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // Іконка інтелекту
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { alpha, Box, Collapse, Typography } from "@mui/material";
import { useState } from "react";

/**
 * UI Designer: macOS Thinking Block
 * Візуалізація процесу роздумів моделі
 */
export const ThinkingBlock = ({ thinking }: { thinking?: string }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!thinking) return null;

  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: "14px",
        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
        borderLeft: (theme) =>
          `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        overflow: "hidden", // Для коректної анімації Collapse
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
        },
      }}
    >
      {/* Header / Toggle Area */}
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          p: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.2, opacity: 0.6 }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 14, color: "primary.main" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontSize: "0.7rem",
            }}
          >
            Дупля збираю
          </Typography>
        </Box>

        <KeyboardArrowDownIcon
          sx={{
            fontSize: 18,
            opacity: 0.4,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: "0 16px 16px 16px" }}>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.secondary",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {thinking}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};
