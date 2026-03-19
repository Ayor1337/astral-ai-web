import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./hooks/useTheme";
import ChatView from "@/views/chat/ChatPage.tsx";
import NewChatPage from "@/views/chat/new/NewChatPage.tsx";

document.documentElement.style.minHeight = "100%";
document.body.style.minHeight = "100%";
document.body.style.margin = "0";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
root.style.minHeight = "100%";

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/new" element={<NewChatPage />} />
          <Route path="/chat" element={<ChatView />} />
          <Route path="/chat/:id" element={<ChatView />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
