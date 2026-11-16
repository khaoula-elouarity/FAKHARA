import React, { createContext, useCallback, useContext, useState } from "react";
import { useLanguage } from "./Languagecontext.jsx";
import "./Toast.css";

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  ),
};

const DEFAULT_DURATION = 3600;

let toastId = 0;

export function ToastProvider({ children }) {
  const { language } = useLanguage();
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, leaving: true } : toast
      )
    );
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 320);
  }, []);

  const addToast = useCallback(
    ({ type = "success", message, duration = DEFAULT_DURATION, image, action, ariaLive }) => {
      const id = ++toastId;
      const toast = {
        id,
        type,
        message,
        image,
        action,
        duration,
        leaving: false,
        ariaLive: ariaLive || (type === "error" ? "assertive" : "polite"),
      };
      setToasts((current) => [...current, toast]);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const containerLabels = {
    ar: "الإشعارات",
    fr: "Notifications",
    en: "Notifications",
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        className={`fakhara-toast-container ${language === "ar" ? "is-rtl" : ""}`}
        aria-live="polite"
        aria-label={containerLabels[language] || containerLabels.en}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, removeToast }) {
  const { language } = useLanguage();
  const closeLabels = { ar: "إغلاق", fr: "Fermer", en: "Close" };
  const { id, type, message, image, leaving } = toast;

  return (
    <div
      className={`fakhara-toast fakhara-toast--${type} ${leaving ? "is-leaving" : ""}`}
      role={toast.ariaLive === "assertive" ? "alert" : "status"}
    >
      <div className="fakhara-toast__icon">{ICONS[type] || ICONS.success}</div>
        <div className="fakhara-toast__content">
          {image ? (
            <div className="fakhara-toast__row">
              <div className="fakhara-toast__thumb">
                <img src={image} alt="" />
              </div>
              <div className="fakhara-toast__text-group">
                <div className="fakhara-toast__text">{message}</div>
                {toast.action ? (
                  <button
                    type="button"
                    className="fakhara-toast__action"
                    onClick={() => {
                      toast.action.onClick?.();
                      removeToast(id);
                    }}
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="fakhara-toast__text-group">
              <div className="fakhara-toast__text">{message}</div>
              {toast.action ? (
                <button
                  type="button"
                  className="fakhara-toast__action"
                  onClick={() => {
                    toast.action.onClick?.();
                    removeToast(id);
                  }}
                >
                  {toast.action.label}
                </button>
              ) : null}
            </div>
          )}
        </div>
      <button
        type="button"
        className="fakhara-toast__close"
        onClick={() => removeToast(id)}
        aria-label={closeLabels[language] || closeLabels.en}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
