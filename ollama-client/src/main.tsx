import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Якщо Ollama на секунду "задумається", React Query спробує ще 2 рази
            retry: 2,
            // Не оновлювати дані автоматично при перемиканні вікон (щоб не смикати Ollama зайвий раз)
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // Кешуємо список чатів на 5 хвилин
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
);