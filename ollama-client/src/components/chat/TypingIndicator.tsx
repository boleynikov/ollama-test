import { Box, Avatar } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { motion } from "framer-motion";

// Анімація для кожної точки
const dotVariants = {
  animate: (i: number) => ({
    y: [0, -5, 0], // Стрибає вгору-вниз
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15, // Різний делей для кожної точки
      ease: "easeInOut",
    },
  }),
} as const;

export const TypingIndicator = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: "#E9E9EB",
          color: "#86868B",
        }}
      >
        <SmartToyIcon fontSize="small" />
      </Avatar>

      {/* Сірий бабл із точками */}
      <Box
        sx={{
          p: "10px 18px",
          borderRadius: "18px 18px 18px 2px",
          bgcolor: "#E9E9EB",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
        }}
      >
        {/* Створюємо 3 точки */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={dotVariants}
            animate="animate"
            style={{
              width: 6,
              height: 6,
              backgroundColor: "#8E8E93",
              borderRadius: "50%",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
