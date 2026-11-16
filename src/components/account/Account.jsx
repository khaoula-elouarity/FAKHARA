import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import { useLanguage } from "../../context/Languagecontext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  createAddress as createAddressRequest,
  deleteAddress as deleteAddressRequest,
  fetchMyOrders,
  updateAddress as updateAddressRequest,
} from "../../services/api.js";
import {
  ORDER_FLOW,
  formatAccountDate,
  getAccountError,
  getAccountTranslations,
} from "./accountTranslations.js";
import "./account.css";

function AccountIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "account-nav-icon",
    "aria-hidden": "true",
  };

  if (name === "overview") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }

  if (name === "info") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (name === "addresses") {
    return (
      <svg {...common}>
        <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "orders") {
    return (
      <svg {...common}>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg {...common}>
        <path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function AccountAlert({ type = "error", children }) {
  if (!children) {
    return null;
  }

  return (
    <p className={`account-alert account-alert--${type}`} role="alert">
      {children}
    </p>
  );
}

function StatusBadge({ status, t }) {
  return (
    <span className={`account-status account-status--${status}`}>
      {t.statuses[status] || status}
    </span>
  );
}

function OrderTimeline({ status, t }) {
  if (status === "cancelled") {
    return (
      <div className="account-timeline-cancelled">
        {t.statuses.cancelled}
      </div>
    );
  }

  const currentIndex = Math.max(0, ORDER_FLOW.indexOf(status));

  return (
    <ol className="account-timeline">
      {ORDER_FLOW.map((step, index) => {
        const state =
          index < currentIndex
            ? "is-complete"
            : index === currentIndex
            ? "is-current"
            : "";

        return (
          <li key={step} className={state}>
            <span className="account-timeline-dot">
              {index < currentIndex ? "✓" : index + 1}
            </span>
            <span className="account-timeline-label">
              {t.statuses[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderCard({ order, expanded, onToggle, t, language }) {
  const items = order.items || [];
  const itemCount = items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  return (
    <article className={`account-order ${expanded ? "is-open" : ""}`}>
      <div className="account-order-head">
        <div className="account-order-heading">
          <span className="account-order-number">
            {t.orderNumber} · {order.orderNumber}
          </span>
          <span className="account-order-date">
            {formatAccountDate(order.createdAt, language)}
          </span>
        </div>

        <div className="account-order-head-side">
          <StatusBadge status={order.status} t={t} />
          <strong>
            {order.total} {t.currency}
          </strong>
        </div>
      </div>

      <div className="account-order-summary">
        <span>
          {itemCount} {t.itemsCount}
        </span>
        <button
          type="button"
          className="account-text-button"
          onClick={onToggle}
        >
          {expanded ? t.hideDetails : t.showDetails}
        </button>
      </div>

      {expanded && (
        <div className="account-order-details">
          <ul className="account-order-items">
            {items.map((item, index) => (
              <li key={`${item.productId}-${item.variant?.key || index}`}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name?.[language] || item.name?.en || ""}
                    loading="lazy"
                  />
                ) : (
                  <span className="account-order-item-placeholder">F</span>
                )}
                <div>
                  <strong>
                    {item.name?.[language] || item.name?.en || ""}
                  </strong>
                  {item.variant?.name && (
                    <span>
                      {item.variant.name?.[language] ||
                        item.variant.name?.en ||
                        ""}
                    </span>
                  )}
                  <span>
                    {t.quantity}: {item.quantity} × {item.price}{" "}
                    {t.currency}
                  </span>
                </div>
                <strong>
                  {item.price * item.quantity} {t.currency}
                </strong>
              </li>
            ))}
          </ul>

          <div className="account-order-info">
            <div>
              <h4>{t.deliveryAddress}</h4>
              <p>{order.customer?.fullName}</p>
              <p>{order.customer?.phone}</p>
              {order.customer?.email && <p>{order.customer.email}</p>}
              <p>
                {order.customer?.address}, {order.customer?.city}
                {order.customer?.postalCode
                  ? `, ${order.customer.postalCode}`
                  : ""}
              </p>
            </div>

            <div>
              <h4>{t.paymentMethod}</h4>
              <p>
                {order.paymentMethod === "cash_on_delivery"
                  ? t.cashOnDelivery
                  : order.paymentMethod}
              </p>
            </div>
          </div>

          <div className="account-order-totals">
            <div>
              <span>{t.subtotal}</span>
              <strong>
                {order.subtotal} {t.currency}
              </strong>
            </div>
            <div>
              <span>{t.deliveryFee}</span>
              <strong>
                {order.deliveryFee} {t.currency}
              </strong>
            </div>
            <div className="account-order-totals-grand">
              <span>{t.total}</span>
              <strong>
                {order.total} {t.currency}
              </strong>
            </div>
          </div>

          <div className="account-order-tracking">
            <h4>{t.orderStatus}</h4>
            <OrderTimeline status={order.status} t={t} />
          </div>
        </div>
      )}
    </article>
  );
}

function AddressCard({
  address,
  t,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  return (
    <article className="account-address">
      <div className="account-address-head">
        <h3>{address.label || address.city}</h3>
        {address.isDefault && (
          <span className="account-address-default">
            {t.defaultBadge}
          </span>
        )}
      </div>

      {address.fullName && <p>{address.fullName}</p>}
      <p>{address.address}</p>
      <p>
        {address.city}
        {address.postalCode ? `, ${address.postalCode}` : ""}
      </p>
      {address.phone && <p>{address.phone}</p>}

      <div className="account-address-actions">
        <button type="button" onClick={() => onEdit(address)}>
          {t.edit}
        </button>
        {!address.isDefault && (
          <button type="button" onClick={() => onSetDefault(address)}>
            {t.setDefault}
          </button>
        )}
        <button
          type="button"
          className="is-danger"
          onClick={() => onDelete(address)}
        >
          {t.delete}
        </button>
      </div>
    </article>
  );
}

export default function Account() {
  const { user, logout, updateUser, setUser } = useCustomerAuth();
  const { language } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const t = getAccountTranslations(language);

  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [infoForm, setInfoForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [infoNotice, setInfoNotice] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    fullName: "",
    phone: "",
    city: "",
    address: "",
    postalCode: "",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securityNotice, setSecurityNotice] = useState("");

  const addresses = useMemo(
    () => user?.addresses || [],
    [user?.addresses]
  );

  const displayName = useMemo(() => {
    if (!user) {
      return "";
    }

    const composed = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return composed || user.name || t.customerRole;
  }, [user, t.customerRole]);

  const initials = useMemo(() => {
    const first = (user?.firstName || user?.name || "F").trim()[0] || "F";
    const last = (user?.lastName || "").trim()[0] || "";
    return `${first}${last}`.toUpperCase();
  }, [user]);

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) || addresses[0],
    [addresses]
  );

  const stats = useMemo(() => {
    const active = orders.filter(
      (order) => !["delivered", "cancelled"].includes(order.status)
    );
    const spent = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    return {
      orders: orders.length,
      active: active.length,
      spent,
    };
  }, [orders]);

  useEffect(() => {
    setInfoForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [
    user?.id,
    user?.firstName,
    user?.lastName,
    user?.email,
    user?.phone,
  ]);

  const loadOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setOrdersLoading(true);
      }

      setOrdersError("");

      try {
        const payload = await fetchMyOrders();
        setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
      } catch (error) {
        if (!silent) {
          setOrdersError(getAccountError(error.code, t));
        }
      } finally {
        if (!silent) {
          setOrdersLoading(false);
        }
      }
    },
    [t]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const interval = window.setInterval(
      () => loadOrders({ silent: true }),
      60000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [loadOrders]);

  function handleInfoChange(event) {
    const { name, value } = event.target;
    setInfoForm((current) => ({ ...current, [name]: value }));
    setInfoError("");
    setInfoNotice("");
  }

  async function handleInfoSubmit(event) {
    event.preventDefault();

    if (
      !infoForm.firstName.trim() ||
      !infoForm.lastName.trim() ||
      !infoForm.email.trim()
    ) {
      setInfoError(t.requiredFields);
      return;
    }

    setInfoSaving(true);
    setInfoError("");
    setInfoNotice("");

    try {
      await updateUser({
        firstName: infoForm.firstName.trim(),
        lastName: infoForm.lastName.trim(),
        email: infoForm.email.trim(),
        phone: infoForm.phone.trim(),
      });
      setInfoNotice(t.infoSaved);
      addToast({ type: "success", message: t.infoSaved });
    } catch (error) {
      setInfoError(getAccountError(error.code, t));
    } finally {
      setInfoSaving(false);
    }
  }

  function handleAddressChange(event) {
    const { name, value, type, checked } = event.target;
    setAddressForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setAddressError("");
  }

  function openNewAddress() {
    setEditingAddressId(null);
    setAddressForm({
      label: "",
      fullName: displayName,
      phone: user?.phone || "",
      city: user?.city || "",
      address: user?.address || "",
      postalCode: user?.postalCode || "",
      isDefault: addresses.length === 0,
    });
    setAddressError("");
    setShowAddressForm(true);
  }

  function openEditAddress(address) {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label || "",
      fullName: address.fullName || "",
      phone: address.phone || "",
      city: address.city || "",
      address: address.address || "",
      postalCode: address.postalCode || "",
      isDefault: Boolean(address.isDefault),
    });
    setAddressError("");
    setShowAddressForm(true);
  }

  function closeAddressForm() {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressError("");
  }

  function applyAddresses(nextAddresses) {
    setUser((current) =>
      current ? { ...current, addresses: nextAddresses } : current
    );
  }

  async function handleAddressSubmit(event) {
    event.preventDefault();

    if (!addressForm.city.trim() || !addressForm.address.trim()) {
      setAddressError(t.requiredFields);
      return;
    }

    setAddressSaving(true);
    setAddressError("");

    try {
      const payload = editingAddressId
        ? await updateAddressRequest(editingAddressId, addressForm)
        : await createAddressRequest(addressForm);

      applyAddresses(payload?.addresses || []);
      addToast({ type: "success", message: t.addressSaved });
      closeAddressForm();
    } catch (error) {
      setAddressError(getAccountError(error.code, t));
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleDeleteAddress(address) {
    if (!window.confirm(t.addressDeleteConfirm)) {
      return;
    }

    try {
      const payload = await deleteAddressRequest(address.id);
      applyAddresses(payload?.addresses || []);
      addToast({ type: "success", message: t.addressDeleted });
    } catch (error) {
      addToast({ type: "error", message: getAccountError(error.code, t) });
    }
  }

  async function handleSetDefaultAddress(address) {
    try {
      const payload = await updateAddressRequest(address.id, {
        ...address,
        isDefault: true,
      });
      applyAddresses(payload?.addresses || []);
    } catch (error) {
      addToast({ type: "error", message: getAccountError(error.code, t) });
    }
  }

  function handleSecurityChange(event) {
    const { name, value } = event.target;
    setSecurityForm((current) => ({ ...current, [name]: value }));
    setSecurityError("");
    setSecurityNotice("");
  }

  async function handleSecuritySubmit(event) {
    event.preventDefault();

    if (!securityForm.currentPassword || !securityForm.newPassword) {
      setSecurityError(t.requiredFields);
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setSecurityError(t.errNewPassword);
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityError(t.passwordMismatch);
      return;
    }

    setSecuritySaving(true);
    setSecurityError("");
    setSecurityNotice("");

    try {
      await updateUser({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSecurityNotice(t.passwordUpdated);
      addToast({ type: "success", message: t.passwordUpdated });
    } catch (error) {
      setSecurityError(getAccountError(error.code, t));
    } finally {
      setSecuritySaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  function openOrder(orderId) {
    setExpandedOrderId(orderId);
    setActiveTab("orders");
  }

  const navItems = [
    { key: "overview", label: t.overview, icon: "overview" },
    { key: "info", label: t.personalInfo, icon: "info" },
    { key: "addresses", label: t.addresses, icon: "addresses" },
    { key: "orders", label: t.myOrders, icon: "orders" },
    { key: "profile", label: t.profile, icon: "profile" },
  ];

  return (
    <main className="account-page">
      <section className="account-banner">
        <span>FAKHARA</span>
        <h1>{t.account}</h1>
        <p>{t.welcomeSubtitle}</p>
      </section>

      <div className="account-shell">
        <aside className="account-sidebar">
          <div className="account-user-card">
            <div className="account-avatar">{initials}</div>
            <h2>{displayName}</h2>
            <p>{user?.email}</p>
            <span>
              {t.memberSince} {formatAccountDate(user?.createdAt, language)}
            </span>
          </div>

          <nav className="account-nav" aria-label={t.account}>
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={activeTab === item.key ? "is-active" : ""}
                onClick={() => {
                  setActiveTab(item.key);
                  setShowAddressForm(false);
                }}
              >
                <AccountIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}

            <button
              type="button"
              className="account-nav-logout"
              onClick={handleLogout}
            >
              <AccountIcon name="logout" />
              <span>{t.logout}</span>
            </button>
          </nav>
        </aside>

        <div className="account-content">
          {activeTab === "overview" && (
            <section className="account-section">
              <div className="account-welcome">
                <div>
                  <span className="account-eyebrow">FAKHARA</span>
                  <h2>
                    {t.welcome}, {displayName}
                  </h2>
                  <p>{t.welcomeSubtitle}</p>
                </div>
                <div className="account-welcome-seal">F</div>
              </div>

              <div className="account-stats">
                <article>
                  <span>{t.statsOrders}</span>
                  <strong>{stats.orders}</strong>
                </article>
                <article>
                  <span>{t.statsSpent}</span>
                  <strong>
                    {stats.spent} {t.currency}
                  </strong>
                </article>
                <article>
                  <span>{t.statsActive}</span>
                  <strong>{stats.active}</strong>
                </article>
              </div>

              <div className="account-overview-grid">
                <div className="account-panel">
                  <div className="account-panel-head">
                    <h3>{t.recentOrders}</h3>
                    <button
                      type="button"
                      className="account-text-button"
                      onClick={() => setActiveTab("orders")}
                    >
                      {t.viewAllOrders}
                    </button>
                  </div>

                  {ordersLoading ? (
                    <p className="account-muted">{t.loading}</p>
                  ) : orders.length === 0 ? (
                    <div className="account-empty">
                      <p>{t.noOrders}</p>
                      <p className="account-muted">{t.noOrdersHelp}</p>
                      <Link to="/collections" className="account-button">
                        {t.discoverCollections}
                      </Link>
                    </div>
                  ) : (
                    <ul className="account-mini-orders">
                      {orders.slice(0, 3).map((order) => (
                        <li key={order.id}>
                          <button
                            type="button"
                            onClick={() => openOrder(order.id)}
                          >
                            <span>
                              <strong>{order.orderNumber}</strong>
                              <small>
                                {formatAccountDate(
                                  order.createdAt,
                                  language
                                )}
                              </small>
                            </span>
                            <StatusBadge status={order.status} t={t} />
                            <strong>
                              {order.total} {t.currency}
                            </strong>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="account-panel">
                  <div className="account-panel-head">
                    <h3>{t.defaultAddress}</h3>
                    <button
                      type="button"
                      className="account-text-button"
                      onClick={() => {
                        setActiveTab("addresses");
                        if (addresses.length === 0) {
                          openNewAddress();
                        }
                      }}
                    >
                      {t.addresses}
                    </button>
                  </div>

                  {defaultAddress ? (
                    <div className="account-mini-address">
                      <strong>
                        {defaultAddress.label || defaultAddress.city}
                      </strong>
                      <p>{defaultAddress.fullName}</p>
                      <p>{defaultAddress.address}</p>
                      <p>
                        {defaultAddress.city}
                        {defaultAddress.postalCode
                          ? `, ${defaultAddress.postalCode}`
                          : ""}
                      </p>
                      {defaultAddress.phone && (
                        <p>{defaultAddress.phone}</p>
                      )}
                    </div>
                  ) : (
                    <div className="account-empty">
                      <p>{t.noAddress}</p>
                      <button
                        type="button"
                        className="account-button"
                        onClick={() => {
                          setActiveTab("addresses");
                          openNewAddress();
                        }}
                      >
                        {t.addAddress}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === "info" && (
            <section className="account-section">
              <header className="account-section-head">
                <div>
                  <span className="account-eyebrow">FAKHARA</span>
                  <h2>{t.personalInfo}</h2>
                  <p>{t.infoSubtitle}</p>
                </div>
              </header>

              <form className="account-form" onSubmit={handleInfoSubmit}>
                <div className="account-field-row">
                  <label className="account-field">
                    <span>{t.firstName} *</span>
                    <input
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      value={infoForm.firstName}
                      onChange={handleInfoChange}
                      required
                    />
                  </label>
                  <label className="account-field">
                    <span>{t.lastName} *</span>
                    <input
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      value={infoForm.lastName}
                      onChange={handleInfoChange}
                      required
                    />
                  </label>
                </div>

                <div className="account-field-row">
                  <label className="account-field">
                    <span>{t.email} *</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={infoForm.email}
                      onChange={handleInfoChange}
                      required
                    />
                  </label>
                  <label className="account-field">
                    <span>{t.phone}</span>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={infoForm.phone}
                      onChange={handleInfoChange}
                    />
                  </label>
                </div>

                <AccountAlert>{infoError}</AccountAlert>
                <AccountAlert type="success">{infoNotice}</AccountAlert>

                <div className="account-actions">
                  <button
                    type="submit"
                    className="account-button"
                    disabled={infoSaving}
                  >
                    {infoSaving ? t.saving : t.save}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === "addresses" && (
            <section className="account-section">
              <header className="account-section-head">
                <div>
                  <span className="account-eyebrow">FAKHARA</span>
                  <h2>{t.addresses}</h2>
                  <p>{t.addressesSubtitle}</p>
                </div>
                {!showAddressForm && (
                  <button
                    type="button"
                    className="account-button"
                    onClick={openNewAddress}
                  >
                    {t.addAddress}
                  </button>
                )}
              </header>

              {showAddressForm && (
                <form
                  className="account-address-form"
                  onSubmit={handleAddressSubmit}
                >
                  <h3>
                    {editingAddressId ? t.editAddress : t.addAddress}
                  </h3>

                  <div className="account-field-row">
                    <label className="account-field">
                      <span>{t.addressLabel}</span>
                      <input
                        type="text"
                        name="label"
                        value={addressForm.label}
                        onChange={handleAddressChange}
                        placeholder={t.addressLabelPlaceholder}
                      />
                    </label>
                    <label className="account-field">
                      <span>{t.fullName}</span>
                      <input
                        type="text"
                        name="fullName"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                      />
                    </label>
                  </div>

                  <div className="account-field-row">
                    <label className="account-field">
                      <span>{t.phone}</span>
                      <input
                        type="tel"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                      />
                    </label>
                    <label className="account-field">
                      <span>{t.city} *</span>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                      />
                    </label>
                  </div>

                  <label className="account-field">
                    <span>{t.addressLine} *</span>
                    <textarea
                      name="address"
                      rows="3"
                      value={addressForm.address}
                      onChange={handleAddressChange}
                      required
                    />
                  </label>

                  <div className="account-field-row">
                    <label className="account-field">
                      <span>{t.postalCode}</span>
                      <input
                        type="text"
                        name="postalCode"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                      />
                    </label>
                    <label className="account-checkbox">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressChange}
                      />
                      <span>{t.defaultBadge}</span>
                    </label>
                  </div>

                  <AccountAlert>{addressError}</AccountAlert>

                  <div className="account-actions">
                    <button
                      type="submit"
                      className="account-button"
                      disabled={addressSaving}
                    >
                      {addressSaving ? t.saving : t.save}
                    </button>
                    <button
                      type="button"
                      className="account-button account-button--ghost"
                      onClick={closeAddressForm}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <div className="account-empty">
                  <p>{t.emptyAddressBook}</p>
                  <button
                    type="button"
                    className="account-button"
                    onClick={openNewAddress}
                  >
                    {t.addAddress}
                  </button>
                </div>
              ) : (
                <div className="account-address-grid">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      t={t}
                      onEdit={openEditAddress}
                      onDelete={handleDeleteAddress}
                      onSetDefault={handleSetDefaultAddress}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "orders" && (
            <section className="account-section">
              <header className="account-section-head">
                <div>
                  <span className="account-eyebrow">FAKHARA</span>
                  <h2>{t.myOrders}</h2>
                  <p>{t.ordersSubtitle}</p>
                </div>
                <button
                  type="button"
                  className="account-text-button"
                  onClick={() => loadOrders()}
                >
                  {t.refresh}
                </button>
              </header>

              {ordersLoading ? (
                <p className="account-muted">{t.loading}</p>
              ) : ordersError ? (
                <AccountAlert>{ordersError}</AccountAlert>
              ) : orders.length === 0 ? (
                <div className="account-empty">
                  <p>{t.noOrders}</p>
                  <p className="account-muted">{t.noOrdersHelp}</p>
                  <Link to="/collections" className="account-button">
                    {t.discoverCollections}
                  </Link>
                </div>
              ) : (
                <div className="account-orders">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      expanded={expandedOrderId === order.id}
                      onToggle={() =>
                        setExpandedOrderId((current) =>
                          current === order.id ? null : order.id
                        )
                      }
                      t={t}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "profile" && (
            <section className="account-section">
              <header className="account-section-head">
                <div>
                  <span className="account-eyebrow">FAKHARA</span>
                  <h2>{t.profile}</h2>
                  <p>{t.profileSubtitle}</p>
                </div>
              </header>

              <div className="account-profile-grid">
                <form
                  className="account-form account-panel"
                  onSubmit={handleSecuritySubmit}
                >
                  <h3>{t.security}</h3>

                  <label className="account-field">
                    <span>{t.currentPassword} *</span>
                    <input
                      type="password"
                      name="currentPassword"
                      autoComplete="current-password"
                      value={securityForm.currentPassword}
                      onChange={handleSecurityChange}
                      required
                    />
                  </label>

                  <label className="account-field">
                    <span>{t.newPassword} *</span>
                    <input
                      type="password"
                      name="newPassword"
                      autoComplete="new-password"
                      value={securityForm.newPassword}
                      onChange={handleSecurityChange}
                      minLength={8}
                      required
                    />
                  </label>

                  <label className="account-field">
                    <span>{t.confirmNewPassword} *</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={securityForm.confirmPassword}
                      onChange={handleSecurityChange}
                      minLength={8}
                      required
                    />
                  </label>

                  <AccountAlert>{securityError}</AccountAlert>
                  <AccountAlert type="success">
                    {securityNotice}
                  </AccountAlert>

                  <div className="account-actions">
                    <button
                      type="submit"
                      className="account-button"
                      disabled={securitySaving}
                    >
                      {securitySaving ? t.saving : t.changePassword}
                    </button>
                  </div>
                </form>

                <div className="account-panel account-details">
                  <h3>{t.accountDetails}</h3>
                  <dl>
                    <div>
                      <dt>{t.email}</dt>
                      <dd>{user?.email || "—"}</dd>
                    </div>
                    <div>
                      <dt>{t.phone}</dt>
                      <dd>{user?.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt>{t.accountRole}</dt>
                      <dd>{t.customerRole}</dd>
                    </div>
                    <div>
                      <dt>{t.memberSince}</dt>
                      <dd>
                        {formatAccountDate(user?.createdAt, language)}
                      </dd>
                    </div>
                    <div>
                      <dt>{t.lastLogin}</dt>
                      <dd>
                        {formatAccountDate(user?.lastLoginAt, language)}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    className="account-button account-button--ghost"
                    onClick={handleLogout}
                  >
                    {t.logout}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
