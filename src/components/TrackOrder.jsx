import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useLanguage } from "../context/Languagecontext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { confirmOrderReceipt, trackOrder } from "../services/api.js";
import "./TrackOrder.css";

const TRACKING_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const content = {
  ar: {
    eyebrow: "خدمة العملاء",
    title: "تتبع طلبي",
    subtitle:
      "أدخلي رقم الطلب ورقم الهاتف المستخدم عند تقديم الطلب لمعرفة حالته الآن.",
    orderNumber: "رقم الطلب",
    phone: "رقم الهاتف",
    trackButton: "تتبع الطلب",
    tracking: "جارٍ التحقق من الطلب...",
    notYet: "بانتظار التحديث",
    resultTitle: "حالة الطلب",
    orderDate: "تاريخ الطلب",
    orderStatus: "الحالة الحالية",
    customer: "العميل",
    payment: "طريقة الدفع",
    cashOnDelivery: "الدفع عند الاستلام",
    items: "المنتجات",
    quantity: "الكمية",
    subtotal: "المجموع الفرعي",
    deliveryFee: "رسوم التوصيل",
    total: "الإجمالي",
    timelineTitle: "مراحل الطلب",
    receivedTitle: "هل استلمتِ طلبك فعلاً؟",
    receivedMessage:
      "لا تؤكدي الاستلام إلا بعد استلام المنتج بين يديكِ. سيتم تحديث حالة الطلب إلى «تم التوصيل» بعد تأكيدكِ فقط.",
    confirmReceipt: "تأكيد الاستلام",
    yesReceived: "نعم، استلمت الطلب",
    cancel: "إلغاء",
    confirming: "جارٍ تأكيد الاستلام...",
    confirmed: "تم تأكيد الاستلام. شكراً لكِ!",
    cancelledTitle: "تم إلغاء هذا الطلب",
    cancelledMessage: "إذا كان لديكِ أي استفسار، تواصلي معنا عبر صفحة اتصل بنا.",
    trackAgain: "تتبع طلب آخر",
    home: "العودة للرئيسية",
    errorInvalid: "أدخلي رقم طلب ورقم هاتف صحيحين.",
    errorNotFound:
      "رقم الطلب ورقم الهاتف غير متطابقين. تأكدي من البيانات وحاولي مجدداً.",
    errorNetwork: "الخادم غير متاح حالياً. حاولي بعد قليل.",
    errorDatabase: "تعذر الوصول إلى بيانات الطلبات. حاولي بعد قليل.",
    errorRateLimit: "محاولات كثيرة جداً. انتظري قليلاً ثم حاولي مجدداً.",
    errorDeliveryNotReady:
      "يمكن تأكيد الاستلام عندما يكون الطلب قيد التوصيل فقط.",
    errorGeneric: "تعذر تحميل حالة الطلب. حاولي مجدداً.",
    stages: {
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
    eyebrow: "Service client",
    title: "Suivre ma commande",
    subtitle:
      "Saisissez le numéro de commande et le téléphone utilisés lors de la commande pour connaître son état en direct.",
    orderNumber: "Numéro de commande",
    phone: "Numéro de téléphone",
    trackButton: "Suivre la commande",
    tracking: "Vérification de la commande...",
    notYet: "En attente",
    resultTitle: "État de la commande",
    orderDate: "Date de commande",
    orderStatus: "Statut actuel",
    customer: "Cliente",
    payment: "Paiement",
    cashOnDelivery: "Paiement à la livraison",
    items: "Produits",
    quantity: "Quantité",
    subtotal: "Sous-total",
    deliveryFee: "Frais de livraison",
    total: "Total",
    timelineTitle: "Étapes de la commande",
    receivedTitle: "Have you actually received your order?",
    receivedMessage:
      "Ne confirmez la réception qu'après avoir reçu le produit. La commande passera au statut « Livrée » uniquement après votre confirmation.",
    confirmReceipt: "Confirmer la réception",
    yesReceived: "Oui, j'ai reçu ma commande",
    cancel: "Annuler",
    confirming: "Confirmation de la réception...",
    confirmed: "Réception confirmée. Merci !",
    cancelledTitle: "Cette commande a été annulée",
    cancelledMessage:
      "Pour toute question, contactez-nous via la page Contact.",
    trackAgain: "Suivre une autre commande",
    home: "Retour à l'accueil",
    errorInvalid: "Saisissez un numéro de commande et un téléphone valides.",
    errorNotFound:
      "Le numéro de commande et le téléphone ne correspondent pas. Vérifiez vos informations.",
    errorNetwork:
      "Le serveur est momentanément indisponible. Réessayez.",
    errorDatabase: "Impossible d'accéder aux commandes. Réessayez.",
    errorRateLimit: "Trop de tentatives. Patientez puis réessayez.",
    errorDeliveryNotReady:
      "La réception ne peut être confirmée que lorsque la commande est en cours de livraison.",
    errorGeneric: "Impossible de charger l'état de la commande. Réessayez.",
    stages: {
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
    eyebrow: "Customer care",
    title: "Track My Order",
    subtitle:
      "Enter your order number and the phone number used when placing the order to see its live status.",
    orderNumber: "Order number",
    phone: "Phone number",
    trackButton: "Track order",
    tracking: "Checking your order...",
    notYet: "Awaiting update",
    resultTitle: "Order status",
    orderDate: "Order date",
    orderStatus: "Current status",
    customer: "Customer",
    payment: "Payment",
    cashOnDelivery: "Cash on delivery",
    items: "Items",
    quantity: "Quantity",
    subtotal: "Subtotal",
    deliveryFee: "Delivery fee",
    total: "Total",
    timelineTitle: "Order progress",
    receivedTitle: "Have you actually received your order?",
    receivedMessage:
      "Only confirm receipt once you have the product in hand. Your order will change to Delivered only after you explicitly confirm.",
    confirmReceipt: "Confirm Receipt",
    yesReceived: "Yes, I received it",
    cancel: "Cancel",
    confirming: "Confirming receipt...",
    confirmed: "Receipt confirmed. Thank you!",
    cancelledTitle: "This order was cancelled",
    cancelledMessage:
      "If you have any questions, contact us through the Contact page.",
    trackAgain: "Track another order",
    home: "Back to home",
    errorInvalid: "Enter a valid order number and phone number.",
    errorNotFound:
      "The order number and phone number do not match. Check your details and try again.",
    errorNetwork:
      "The server is temporarily unavailable. Please try again shortly.",
    errorDatabase:
      "Could not reach the order database. Please try again shortly.",
    errorRateLimit: "Too many attempts. Wait a moment and try again.",
    errorDeliveryNotReady:
      "Receipt can only be confirmed when the order is out for delivery.",
    errorGeneric: "Could not load the order status. Please try again.",
    stages: {
      pending: "Order Received",
      confirmed: "Order Confirmed",
      preparing: "Preparing",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  },
};

function localized(value, language) {
  if (!value || typeof value !== "object") {
    return "";
  }

  return value[language] || value.en || value.fr || value.ar || "";
}

function formatDate(value, language) {
  if (!value) {
    return "";
  }

  const locale =
    language === "ar" ? "ar-MA" : language === "fr" ? "fr-FR" : "en-GB";

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleString();
  }
}

function formatMoney(value, language) {
  return new Intl.NumberFormat(language === "fr" ? "fr-MA" : "en-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function buildTimeline(order, t, language) {
  const history = [...(order.statusHistory || [])]
    .filter((entry) => TRACKING_FLOW.includes(entry.status))
    .sort((a, b) => new Date(a.at) - new Date(b.at));
  const cancelled = order.status === "cancelled";
  const currentIndex = TRACKING_FLOW.indexOf(order.status);
  const reachedStatuses = new Set(history.map((entry) => entry.status));

  return TRACKING_FLOW.map((status, index) => {
    const entry = history.find((item) => item.status === status);
    const isCurrent =
      !cancelled && order.status !== "delivered" && index === currentIndex;
    const isComplete = Boolean(entry) && !isCurrent;

    return {
      status,
      label: t.stages[status],
      state: isCurrent ? "current" : isComplete ? "complete" : "pending",
      at: entry?.at ? formatDate(entry.at, language) : "",
      source: reachedStatuses.has(status) ? entry?.source || "system" : "",
    };
  });
}

export default function TrackOrder() {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const t = content[language] || content.en;

  const [form, setForm] = useState({
    orderNumber: (searchParams.get("order") || "").toUpperCase(),
    phone: "",
  });
  const [credentials, setCredentials] = useState(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const timeline = order ? buildTimeline(order, t, language) : [];

  function errorMessage(code) {
    if (code === "invalid_orderNumber" || code === "invalid_phone") {
      return t.errorInvalid;
    }
    if (code === "verification_failed" || code === "order_not_found") {
      return t.errorNotFound;
    }
    if (code === "network_error") {
      return t.errorNetwork;
    }
    if (code === "database_unavailable") {
      return t.errorDatabase;
    }
    if (code === "rate_limit_exceeded") {
      return t.errorRateLimit;
    }
    if (code === "delivery_not_ready") {
      return t.errorDeliveryNotReady;
    }
    return t.errorGeneric;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const orderNumber = form.orderNumber.trim().toUpperCase();
    const phone = form.phone.trim();

    if (!orderNumber || !phone) {
      setError(t.errorInvalid);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await trackOrder({ orderNumber, phone });
      const nextOrder = payload?.order;

      if (!payload?.success || !nextOrder?.orderNumber) {
        throw new Error("incomplete_tracking_response");
      }

      setCredentials({ orderNumber, phone });
      setOrder(nextOrder);
      setShowConfirm(false);
    } catch (requestError) {
      setError(errorMessage(requestError?.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReceipt() {
    if (!credentials) {
      return;
    }

    setConfirming(true);
    setError("");

    try {
      const payload = await confirmOrderReceipt(credentials);
      const nextOrder = payload?.order;

      if (!payload?.success || !nextOrder?.orderNumber) {
        throw new Error("incomplete_confirmation_response");
      }

      setOrder(nextOrder);
      setShowConfirm(false);
      addToast({ type: "success", message: t.confirmed });
    } catch (requestError) {
      setError(errorMessage(requestError?.code));
    } finally {
      setConfirming(false);
    }
  }

  function resetTracking() {
    setOrder(null);
    setCredentials(null);
    setForm({ orderNumber: "", phone: "" });
    setShowConfirm(false);
    setError("");
  }

  return (
    <main className="track-page">
      <section className="track-intro">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </section>

      <section className="track-search-card" aria-label={t.title}>
        <form onSubmit={handleSubmit} className="track-form">
          <label>
            <span>{t.orderNumber}</span>
            <input
              name="orderNumber"
              value={form.orderNumber}
              onChange={updateField}
              placeholder="FK-000000"
              autoComplete="off"
              required
            />
          </label>

          <label>
            <span>{t.phone}</span>
            <input
              name="phone"
              value={form.phone}
              onChange={updateField}
              type="tel"
              autoComplete="tel"
              required
            />
          </label>

          <button type="submit" disabled={loading} className="track-submit">
            {loading ? t.tracking : t.trackButton}
          </button>
        </form>

        {error && <p className="track-error">{error}</p>}
      </section>

      {order && (
        <section className="track-result" aria-live="polite">
          <div className="track-result-header">
            <div>
              <p className="eyebrow">{t.resultTitle}</p>
              <h2>{order.orderNumber}</h2>
            </div>
            <span className={`track-status track-status--${order.status}`}>
              {t.stages[order.status] || order.status}
            </span>
          </div>

          <div className="track-meta">
            <div>
              <span>{t.orderDate}</span>
              <strong>{formatDate(order.createdAt, language)}</strong>
            </div>
            <div>
              <span>{t.customer}</span>
              <strong>{order.customer.fullName}</strong>
            </div>
            <div>
              <span>{t.phone}</span>
              <strong dir="ltr">{order.customer.phone}</strong>
            </div>
            <div>
              <span>{t.payment}</span>
              <strong>{t.cashOnDelivery}</strong>
            </div>
          </div>

          <div className="track-columns">
            <div className="track-panel">
              <h3>{t.timelineTitle}</h3>

              {order.status === "cancelled" && (
                <div className="track-cancelled">
                  <strong>{t.cancelledTitle}</strong>
                  <p>{t.cancelledMessage}</p>
                </div>
              )}

              <ol className="track-timeline">
                {timeline.map((step, index) => (
                  <li className={`is-${step.state}`} key={step.status}>
                    <span className="track-dot" aria-hidden="true">
                      {step.state === "complete" ? "✓" : index + 1}
                    </span>
                    <div className="track-step-body">
                      <strong>{step.label}</strong>
                      <span>
                        {step.at ? `${t.orderDate}: ${step.at}` : t.notYet}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="track-panel">
              <h3>{t.items}</h3>
              <div className="track-items">
                {order.items.map((item) => (
                  <div
                    className="track-item"
                    key={`${item.productId}-${item.variant?.key || ""}`}
                  >
                    <div>
                      <strong>
                        {localized(item.name, language) || item.productId}
                      </strong>
                      {item.variant?.name && (
                        <span>{localized(item.variant.name, language)}</span>
                      )}
                      <small>
                        {t.quantity}: {item.quantity}
                      </small>
                    </div>
                    <strong>
                      {formatMoney(item.price * item.quantity, language)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="track-totals">
                <div>
                  <span>{t.subtotal}</span>
                  <strong>{formatMoney(order.subtotal, language)}</strong>
                </div>
                <div>
                  <span>{t.deliveryFee}</span>
                  <strong>{formatMoney(order.deliveryFee, language)}</strong>
                </div>
                <div className="is-total">
                  <span>{t.total}</span>
                  <strong>{formatMoney(order.total, language)}</strong>
                </div>
              </div>
            </div>
          </div>

          {order.status === "out_for_delivery" && (
            <div className="track-confirmation">
              <h3>{t.receivedTitle}</h3>
              <p>{t.receivedMessage}</p>

              {!showConfirm ? (
                <button type="button" onClick={() => setShowConfirm(true)}>
                  {t.confirmReceipt}
                </button>
              ) : (
                <div className="track-confirmation-actions">
                  <button
                    type="button"
                    className="is-primary"
                    onClick={handleConfirmReceipt}
                    disabled={confirming}
                  >
                    {confirming ? t.confirming : t.yesReceived}
                  </button>
                  <button
                    type="button"
                    className="is-secondary"
                    onClick={() => setShowConfirm(false)}
                    disabled={confirming}
                  >
                    {t.cancel}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="track-actions">
            <button type="button" onClick={resetTracking}>
              {t.trackAgain}
            </button>
            <Link to="/">{t.home}</Link>
          </div>
        </section>
      )}
    </main>
  );
}
