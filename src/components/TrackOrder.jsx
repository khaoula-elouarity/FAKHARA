import { useState } from "react";
import { Navigate } from "react-router-dom";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { confirmOrderReceipt, trackOrder } from "../services/api.js";
import { hasOrderTrackingAccess } from "../utils/orderTrackingAccess.js";
import "./TrackOrder.css";

const content = {
  ar: {
    title: "تتبع طلباتي",
    subtitle: "أدخل الاسم الكامل ورقم الهاتف المستخدمين عند تقديم الطلب.",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    submit: "عرض الطلبات",
    loading: "جارٍ البحث...",
    invalid: "أدخل الاسم الكامل ورقم هاتف صحيحًا.",
    noOrders: "لم نعثر على طلبات بهذه المعلومات. تحقق منها وحاول مرة أخرى.",
    network: "الخادم غير متاح حاليًا. حاول مرة أخرى بعد قليل.",
    unavailable: "تعذر تحميل الطلبات. حاول مرة أخرى.",
    rateLimit: "محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.",
    order: "الطلب",
    date: "تاريخ الطلب",
    total: "الإجمالي",
    status: "الحالة الحالية",
    confirmReceipt: "تأكيد استلام الطلب",
    confirmPrompt: "هل استلمت هذا الطلب بالفعل؟",
    receiptSaved: "تم تأكيد استلام الطلب.",
    receiptError: "تعذر تأكيد الاستلام. حاول مرة أخرى.",
    statuses: {
      pending: "تم استلام الطلب",
      confirmed: "تم تأكيد الطلب",
      preparing: "قيد التحضير",
      shipped: "تم الشحن",
      out_for_delivery: "قيد التوصيل",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
    },
  },
  fr: {
    title: "Suivre mes commandes",
    subtitle: "Saisissez le nom complet et le téléphone utilisés lors de la commande.",
    fullName: "Nom complet",
    phone: "Numéro de téléphone",
    submit: "Afficher les commandes",
    loading: "Recherche en cours...",
    invalid: "Saisissez un nom complet et un numéro de téléphone valides.",
    noOrders: "Aucune commande trouvée pour ces informations. Vérifiez-les et réessayez.",
    network: "Le serveur est momentanément indisponible. Réessayez bientôt.",
    unavailable: "Impossible de charger les commandes. Réessayez.",
    rateLimit: "Trop de tentatives. Patientez puis réessayez.",
    order: "Commande",
    date: "Date de commande",
    total: "Total",
    status: "Statut actuel",
    confirmReceipt: "Confirmer la réception",
    confirmPrompt: "Avez-vous bien reçu cette commande ?",
    receiptSaved: "Réception de la commande confirmée.",
    receiptError: "Impossible de confirmer la réception. Réessayez.",
    statuses: {
      pending: "Commande reçue",
      confirmed: "Commande confirmée",
      preparing: "En préparation",
      shipped: "Expédiée",
      out_for_delivery: "En cours de livraison",
      delivered: "Livrée",
      cancelled: "Annulée",
    },
  },
  en: {
    title: "Track my orders",
    subtitle: "Enter the full name and phone number used when placing your order.",
    fullName: "Full name",
    phone: "Phone number",
    submit: "Find orders",
    loading: "Searching...",
    invalid: "Enter a full name and a valid phone number.",
    noOrders: "No orders matched those details. Check them and try again.",
    network: "The server is temporarily unavailable. Please try again shortly.",
    unavailable: "Could not load orders. Please try again.",
    rateLimit: "Too many attempts. Wait a moment and try again.",
    order: "Order",
    date: "Order date",
    total: "Total",
    status: "Current status",
    confirmReceipt: "Confirm receipt",
    confirmPrompt: "Have you received this order?",
    receiptSaved: "Order receipt confirmed.",
    receiptError: "Could not confirm receipt. Please try again.",
    statuses: {
      pending: "Order received",
      confirmed: "Order confirmed",
      preparing: "Preparing",
      shipped: "Shipped",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  },
};

function formatDate(value, language) {
  if (!value) return "";
  const locale = language === "ar" ? "ar-MA" : language === "fr" ? "fr-FR" : "en-GB";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(value)
  );
}

function formatMoney(value, language) {
  const locale = language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-MA";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function TrackOrder() {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const t = content[language] || content.en;
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState("");

  if (!hasOrderTrackingAccess()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const fullName = form.fullName.trim();
    const phone = form.phone.trim();

    if (!fullName || !/^[0-9+\s().-]{8,20}$/.test(phone)) {
      setError(t.invalid);
      return;
    }

    setLoading(true);
    setError("");
    setOrders([]);
    setSearched(false);

    try {
      const payload = await trackOrder({ fullName, phone });
      setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
      setSearched(true);
    } catch (requestError) {
      if (requestError?.code === "invalid_fullName" || requestError?.code === "invalid_phone") {
        setError(t.invalid);
      } else if (requestError?.code === "network_error") {
        setError(t.network);
      } else if (requestError?.code === "rate_limit_exceeded") {
        setError(t.rateLimit);
      } else {
        setError(t.unavailable);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReceipt(orderNumber) {
    if (!window.confirm(t.confirmPrompt)) return;

    setConfirmingOrder(orderNumber);
    setError("");
    try {
      const payload = await confirmOrderReceipt({
        orderNumber,
        phone: form.phone.trim(),
      });
      if (!payload?.success || !payload?.order?.status) {
        throw new Error("incomplete_receipt_response");
      }
      setOrders((current) =>
        current.map((order) =>
          order.orderNumber === orderNumber
            ? { ...order, status: payload.order.status }
            : order
        )
      );
      addToast({ type: "success", message: t.receiptSaved });
    } catch {
      setError(t.receiptError);
    } finally {
      setConfirmingOrder("");
    }
  }

  return (
    <main className="track-page">
      <section className="track-intro">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </section>

      <section className="track-search-card" aria-label={t.title}>
        <form onSubmit={handleSubmit} className="track-form" noValidate>
          <label>
            <span>{t.fullName}</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={(event) => {
                setForm((current) => ({ ...current, fullName: event.target.value }));
                setOrders([]);
                setSearched(false);
                setError("");
              }}
              autoComplete="name"
              maxLength={120}
              required
            />
          </label>
          <label>
            <span>{t.phone}</span>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(event) => {
                setForm((current) => ({ ...current, phone: event.target.value }));
                setOrders([]);
                setSearched(false);
                setError("");
              }}
              autoComplete="tel"
              maxLength={20}
              required
            />
          </label>
          <button type="submit" disabled={loading} className="track-submit">
            {loading ? t.loading : t.submit}
          </button>
        </form>
        {error && <p className="track-error" role="alert">{error}</p>}
      </section>

      {orders.length > 0 && (
        <section className="track-results" aria-live="polite">
          {orders.map((order) => (
            <article className="track-result" key={order.orderNumber}>
              <div>
                <span>{t.order}</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div>
                <span>{t.date}</span>
                <strong>{formatDate(order.createdAt, language)}</strong>
              </div>
              <div>
                <span>{t.total}</span>
                <strong>{formatMoney(order.total, language)}</strong>
              </div>
              <div>
                <span>{t.status}</span>
                <strong className={`track-status track-status--${order.status}`}>
                  {t.statuses[order.status] || order.status}
                </strong>
              </div>
              {order.status === "out_for_delivery" && (
                <button
                  type="button"
                  className="track-confirm-receipt"
                  onClick={() => handleConfirmReceipt(order.orderNumber)}
                  disabled={Boolean(confirmingOrder)}
                >
                  {confirmingOrder === order.orderNumber ? t.loading : t.confirmReceipt}
                </button>
              )}
            </article>
          ))}
        </section>
      )}
      {searched && !loading && !error && orders.length === 0 && (
        <p className="track-empty" aria-live="polite">{t.noOrders}</p>
      )}
    </main>
  );
}
