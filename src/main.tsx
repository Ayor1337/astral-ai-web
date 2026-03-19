import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import ChatView from "@/views/chat/ChatPage.tsx";
import NewChatPage from "@/views/chat/new/NewChatPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/new" element={<NewChatPage />} />
        <Route path="/chat" element={<ChatView />} />
        <Route path="/chat/:id" element={<ChatView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
