import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./hooks/useTheme";
import ChatView from "@/views/chat/ChatPage.tsx";
import NewChatPage from "@/views/chat/new/NewChatPage.tsx";
import SettingsPage from "@/views/settings/SettingsPage.tsx";
import SettingsGeneral from "@/views/settings/components/SettingsGeneral.tsx";
import SettingsAccount from "@/views/settings/components/SettingsAccount.tsx";
import LoginPage from "@/views/auth/LoginPage.tsx";
import RegisterPage from "@/views/auth/RegisterPage.tsx";

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/new" element={<NewChatPage />} />
          <Route path="/chat" element={<ChatView />} />
          <Route path="/chat/:id" element={<ChatView />} />
          <Route path="/settings" element={<SettingsPage />}>
            <Route path="general" element={<SettingsGeneral />} />
            <Route path="account" element={<SettingsAccount />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
