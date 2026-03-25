import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  alpha,
  useTheme,
  InputBase,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { useState } from "react";
import type { Chat } from "../types";

/**
 * UI Designer: macOS Sidebar with High-Contrast Gradient Support
 * Виправлено видимість тексту на градієнтному фоні
 */

type SidebarProps = {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onCreateChat: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
};

export const Sidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onRenameChat,
}: SidebarProps) => {
  const theme = useTheme();

  // --- States ---
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  // --- Handlers ---
  const handleDoubleClick = (chat: Chat) => {
    if (isCollapsed) return;
    setEditingId(chat.id);
    setTempTitle(chat.title);
  };

  const handleSave = () => {
    if (
      editingId &&
      tempTitle.trim() &&
      tempTitle !== chats.find((c) => c.id === editingId)?.title
    ) {
      onRenameChat(editingId, tempTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditingId(null);
  };

  return (
    <Box
      sx={{
        width: isCollapsed ? 80 : 280,
        height: "100vh",
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: "blur(40px)",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        zIndex: 1200,
      }}
    >
      {/* Header Area */}
      <Box
        sx={{
          p: 2,
          px: isCollapsed ? 2 : 4,
          pt: 6,
          display: "flex",
          flexDirection: isCollapsed ? "column" : "row",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {!isCollapsed && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              opacity: 0.5,
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            ІСТОРІЯ ЧАТІВ
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: isCollapsed ? "column" : "row",
            gap: 1,
          }}
        >
          <Tooltip title="Новий чат" placement="right" arrow disableInteractive>
            <IconButton
              onClick={onCreateChat}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={isCollapsed ? "Розгорнути" : "Згорнути"}
            placement="right"
            arrow
            disableInteractive
          >
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="small"
              sx={{
                color: "text.secondary",
                transform: isCollapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.4s",
              }}
            >
              <MenuOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chat List */}
      <List
        sx={{
          px: 1.5,
          mt: 2,
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "::-webkit-scrollbar": { display: "none" },
        }}
      >
        {chats.map((chat) => (
          <Tooltip
            key={chat.id}
            title={isCollapsed ? chat.title : ""}
            placement="right"
            arrow
            enterDelay={500}
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: alpha(theme.palette.common.black, 0.8),
                  backdropFilter: "blur(10px)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                },
              },
            }}
          >
            <ListItemButton
              selected={activeChatId === chat.id}
              onClick={() => onSelectChat(chat.id)}
              onDoubleClick={() => handleDoubleClick(chat)}
              sx={{
                borderRadius: "10px",
                mb: 0.5,
                py: 1.5,
                minHeight: 48,
                justifyContent: isCollapsed ? "center" : "initial",
                px: isCollapsed ? 1 : 2,
                transition: "all 0.2s ease",

                // UI Designer: Виправлення видимості тексту на градієнті
                "&.Mui-selected": {
                  background: "var(--gradient-primary)", // Наш CSS-токен з теми
                  color: "#FFFFFF !important", // Форсуємо білий колір тексту

                  "& .MuiListItemIcon-root, & .MuiSvgIcon-root": {
                    color: "#FFFFFF !important", // Форсуємо білий колір іконок
                  },

                  "& .MuiListItemText-root span": {
                    color: "#FFFFFF !important", // Захист для внутрішнього span MUI
                  },

                  "&:hover": {
                    background: "var(--gradient-primary)",
                    opacity: 0.9,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 1.5 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 18, opacity: 0.8 }} />
              </ListItemIcon>

              {!isCollapsed &&
                (editingId === chat.id ? (
                  <InputBase
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    inputProps={{
                      style: {
                        padding: 0,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "inherit", // Використовує білий колір від батька
                      },
                    }}
                    sx={{
                      borderBottom: "1px solid rgba(255,255,255,0.5)",
                    }}
                  />
                ) : (
                  <ListItemText
                    primary={chat.title}
                    primaryTypographyProps={{
                      variant: "body2",
                      noWrap: true,
                      fontWeight: activeChatId === chat.id ? 700 : 400,
                      color: "inherit", // Використовує білий колір від батька
                    }}
                  />
                ))}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
};
