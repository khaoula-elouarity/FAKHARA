import React, { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import { useLanguage } from "../../context/Languagecontext.jsx";
import {
  requestPasswordReset,
  resetPassword as resetPasswordRequest,
} from "../../services/api.js";
import {
  getAccountError,
  getAccountTranslations,
} from "./accountTranslations.js";
import "./account.css";

function AuthShell({ eyebrow, title, subtitle, children }) {
  const { language } = useLanguage();
  const t = getAccountTranslations(language);

  return (
    <main className="account-auth-page">
      <section className="account-auth-banner">
        <span>FAKHARA</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <div className="account-auth-shell">
        <aside className="account-auth-aside">
          <div className="account-auth-aside__mark">F</div>
          <p className="account-auth-aside__eyebrow">{eyebrow}</p>
          <h2>{t.asideTitle}</h2>
          <p>{t.asideText}</p>
          <ul>
            <li>{t.benefitOrders}</li>
            <li>{t.benefitAddresses}</li>
            <li>{t.benefitSecurity}</li>
          </ul>
        </aside>

        <section className="account-auth-card">{children}</section>
      </div>
    </main>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="account-field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function Alert({ type = "error", children }) {
  if (!children) {
    return null;
  }

  return (
    <p className={`account-alert account-alert--${type}`} role="alert">
      {children}
    </p>
  );
}

export function Login() {
  const { language } = useLanguage();
  const t = getAccountTranslations(language);
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requestedFrom = location.state?.from;
  const from =
    requestedFrom === "/account" || requestedFrom?.startsWith("/account/")
      ? requestedFrom
      : "/account";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError(t.requiredFields);
      return;
    }

    setSubmitting(true);

    try {
      const payload = await login({
        email: form.email.trim(),
        password: form.password,
      });
      const role = payload?.role;

      if (role === "admin" || role === "superadmin") {
        navigate("/admin", { replace: true });
        return;
      }

      navigate(from, { replace: true });
    } catch (loginError) {
      setError(getAccountError(loginError.code, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="FAKHARA"
      title={t.loginTitle}
      subtitle={t.loginSubtitle}
    >
      <form className="account-auth-form" onSubmit={handleSubmit}>
        <Field label={t.email} required>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="exemple@email.com"
            required
          />
        </Field>

        <Field label={t.password} required>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </Field>

        <div className="account-auth-row">
          <Link to="/account/forgot-password" className="account-text-link">
            {t.forgotPassword}
          </Link>
        </div>

        <Alert>{error}</Alert>

        <button
          type="submit"
          className="account-button account-button--wide"
          disabled={submitting}
        >
          {submitting ? t.loading : t.loginButton}
        </button>

        <p className="account-auth-switch">
          {t.noAccount}{" "}
          <Link to="/account/register">{t.createAccount}</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { language } = useLanguage();
  const t = getAccountTranslations(language);
  const { register } = useCustomerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError(t.requiredFields);
      return;
    }

    if (form.password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setSubmitting(true);

    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      navigate("/account", { replace: true });
    } catch (registerError) {
      setError(getAccountError(registerError.code, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="FAKHARA"
      title={t.registerTitle}
      subtitle={t.registerSubtitle}
    >
      <form className="account-auth-form" onSubmit={handleSubmit}>
        <div className="account-field-row">
          <Field label={t.firstName} required>
            <input
              type="text"
              name="firstName"
              autoComplete="given-name"
              value={form.firstName}
              onChange={handleChange}
              placeholder={t.firstName}
              required
            />
          </Field>

          <Field label={t.lastName} required>
            <input
              type="text"
              name="lastName"
              autoComplete="family-name"
              value={form.lastName}
              onChange={handleChange}
              placeholder={t.lastName}
              required
            />
          </Field>
        </div>

        <Field label={t.email} required>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="exemple@email.com"
            required
          />
        </Field>

        <Field label={`${t.phone} (${t.optional})`}>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+212 6..."
          />
        </Field>

        <div className="account-field-row">
          <Field label={t.password} required>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </Field>

          <Field label={t.confirmPassword} required>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </Field>
        </div>

        <Alert>{error}</Alert>

        <button
          type="submit"
          className="account-button account-button--wide"
          disabled={submitting}
        >
          {submitting ? t.loading : t.registerButton}
        </button>

        <p className="account-auth-switch">
          {t.haveAccount}{" "}
          <Link to="/account/login">{t.signIn}</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function ForgotPassword() {
  const { language } = useLanguage();
  const t = getAccountTranslations(language);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setError(t.requiredFields);
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");
    setDevResetUrl("");

    try {
      const payload = await requestPasswordReset(email.trim());
      setNotice(t.resetSent);
      setDevResetUrl(payload?.devResetUrl || "");
    } catch (requestError) {
      setError(getAccountError(requestError.code, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="FAKHARA"
      title={t.forgotTitle}
      subtitle={t.forgotSubtitle}
    >
      <form className="account-auth-form" onSubmit={handleSubmit}>
        <Field label={t.email} required>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setNotice("");
            }}
            placeholder="exemple@email.com"
            required
          />
        </Field>

        <Alert type="success">{notice}</Alert>
        {notice && <p className="account-auth-help">{t.resetSentHelp}</p>}
        {devResetUrl && (
          <div className="account-dev-link">
            <strong>{t.devResetLink}</strong>
            <a href={devResetUrl}>{t.openResetLink}</a>
          </div>
        )}
        <Alert>{error}</Alert>

        <button
          type="submit"
          className="account-button account-button--wide"
          disabled={submitting}
        >
          {submitting ? t.loading : t.forgotButton}
        </button>

        <p className="account-auth-switch">
          <Link to="/account/login">{t.backToLogin}</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function ResetPassword() {
  const { language } = useLanguage();
  const t = getAccountTranslations(language);
  const { setUser } = useCustomerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      setError(t.invalidResetLink);
      return;
    }

    if (!form.password) {
      setError(t.requiredFields);
      return;
    }

    if (form.password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setSubmitting(true);

    try {
      const payload = await resetPasswordRequest({
        token,
        password: form.password,
      });
      setUser(payload?.user || null);
      navigate("/account", { replace: true });
    } catch (resetError) {
      setError(getAccountError(resetError.code, t));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell
        eyebrow="FAKHARA"
        title={t.resetTitle}
        subtitle={t.resetSubtitle}
      >
        <Alert>{t.invalidResetLink}</Alert>
        <Link
          to="/account/forgot-password"
          className="account-button account-button--wide"
        >
          {t.requestNewLink}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="FAKHARA"
      title={t.resetTitle}
      subtitle={t.resetSubtitle}
    >
      <form className="account-auth-form" onSubmit={handleSubmit}>
        <Field label={t.newPassword} required>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            minLength={8}
            required
          />
        </Field>

        <Field label={t.confirmNewPassword} required>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            minLength={8}
            required
          />
        </Field>

        <Alert>{error}</Alert>

        <button
          type="submit"
          className="account-button account-button--wide"
          disabled={submitting}
        >
          {submitting ? t.loading : t.resetButton}
        </button>

        <p className="account-auth-switch">
          <Link to="/account/login">{t.backToLogin}</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default Login;
