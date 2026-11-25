import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { LanguageProvider } from "./context/Languagecontext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { CustomerAuthProvider } from "./context/CustomerAuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import "./index.css";
import "./App.css";
import "./responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
       <ThemeProvider>
        <StoreProvider>
          <ToastProvider>
            <CustomerAuthProvider>
              <App />
            </CustomerAuthProvider>
          </ToastProvider>
        </StoreProvider>
       </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
