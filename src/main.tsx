import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./hooks/useTheme";
import { AuthProvider } from "./hooks/useAuth";
import { RequireAuth, RedirectIfAuthed } from "./components/AuthGuards";
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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <LoginPage />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/register"
              element={
                <RedirectIfAuthed>
                  <RegisterPage />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/new"
              element={
                <RequireAuth>
                  <NewChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/chat"
              element={
                <RequireAuth>
                  <ChatView />
                </RequireAuth>
              }
            />
            <Route
              path="/chat/:id"
              element={
                <RequireAuth>
                  <ChatView />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              }
            >
              <Route path="general" element={<SettingsGeneral />} />
              <Route path="account" element={<SettingsAccount />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
