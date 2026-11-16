import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { LanguageProvider } from "./context/Languagecontext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { CustomerAuthProvider } from "./context/CustomerAuthContext.jsx";

import "./index.css";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <StoreProvider>
          <ToastProvider>
            <CustomerAuthProvider>
              <App />
            </CustomerAuthProvider>
          </ToastProvider>
        </StoreProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);