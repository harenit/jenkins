import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./styles.css";

// Restore stored appearance settings across the entire application immediately
try {
  document.documentElement.dataset.theme = localStorage.getItem("prepcycle_theme") || "light";
  document.documentElement.dataset.color = localStorage.getItem("prepcycle_color") || "default";
  document.documentElement.dataset.font = localStorage.getItem("prepcycle_font") || "medium";
} catch {
  // Graceful fallback
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
