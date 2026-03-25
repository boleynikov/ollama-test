import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import {
  Box,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import type { Chat } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";

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
  onDeleteChat: (id: string) => void;
};

export const Sidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onRenameChat,
  onDeleteChat,
}: SidebarProps) => {
  const theme = useTheme();

  // --- States ---
  const [isCollapsed, setIsCollapsed] = useLocalStorage("isCollapsed", false);
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
            Про що ми балакали
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
      <List sx={{ px: 1.5, mt: 2, flex: 1, overflowY: "auto" }}>
        {chats.map((chat) => (
          <Tooltip
            key={chat.id}
            title={isCollapsed ? chat.title : ""}
            placement="right"
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
                px: isCollapsed ? 1 : 2,
                transition: "all 0.2s ease",
                justifyContent: "center",
                // Показуємо кнопку видалення при наведенні
                "&:hover .delete-chat-btn": {
                  opacity: 1,
                  transform: "translateX(0)",
                },
                "&.Mui-selected": {
                  background: "var(--gradient-primary)",
                  color: "#FFFFFF !important",
                  "& .MuiListItemIcon-root, & .MuiSvgIcon-root": {
                    color: "#FFFFFF !important",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 1.5 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 18, opacity: 0.8 }} />
              </ListItemIcon>

              {!isCollapsed && (
                <>
                  {editingId === chat.id ? (
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
                          color: "inherit",
                        },
                      }}
                    />
                  ) : (
                    <ListItemText
                      primary={chat.title}
                      primaryTypographyProps={{
                        variant: "body2",
                        noWrap: true,
                        fontWeight: activeChatId === chat.id ? 700 : 400,
                        color: "inherit",
                      }}
                    />
                  )}

                  {/* Кнопка видалення: з'являється тільки на ховері */}
                  <IconButton
                    className="delete-chat-btn"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Щоб не вибирався чат
                      onDeleteChat(chat.id);
                    }}
                    sx={{
                      opacity: 0, // Прихована за замовчуванням
                      transform: "translateX(10px)",
                      transition: "all 0.2s ease",
                      color: activeChatId === chat.id ? "white" : "error.main",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                      },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </>
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
};
