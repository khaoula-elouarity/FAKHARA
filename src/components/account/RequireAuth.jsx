import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import { getAccountTranslations } from "./accountTranslations.js";
import { useLanguage } from "../../context/Languagecontext.jsx";

export default function RequireAuth({ children }) {
  const { user, loading } = useCustomerAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const t = getAccountTranslations(language);

  if (loading) {
    return (
      <main className="account-page">
        <div className="account-loading">{t.loading}</div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/account/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
