import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { localizedContent } from "../utils/localizedContent.js";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import deliveryPrices from "../data/delivery";
import { ApiRequestError, createOrder } from "../services/api.js";
import {
  cartLineKey,
  getFeedback,
} from "../utils/storeFeedback.js";
import { grantOrderTrackingAccess } from "../utils/orderTrackingAccess.js";
import "./checkout.css";

export default function Checkout() {
  const { language } = useLanguage();
  const { products } = useStore();
  const { addToast } = useToast();
  const { user } = useCustomerAuth();
  const feedback = getFeedback(language);

  const [cart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fakhara-cart") || "[]");
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const defaultAddress =
      (user.addresses || []).find((entry) => entry.isDefault) ||
      (user.addresses || [])[0];

    setForm((current) => ({
      fullName:
        current.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.name ||
        "",
      phone: current.phone || defaultAddress?.phone || user.phone || "",
      email: current.email || user.email || "",
      city: current.city || defaultAddress?.city || user.city || "",
      address:
        current.address || defaultAddress?.address || user.address || "",
    }));
  }, [user]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const translations = {
    ar: {
      title: "إتمام الطلب",
      subtitle: "خطوة أخيرة للحصول على قطعك الفخارية",
      information: "معلومات الزبون",
      fullName: "الاسم الكامل",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني (اختياري)",
      city: "المدينة",
      address: "العنوان بالتفصيل",
      summary: "ملخص الطلب",
      subtotal: "مجموع المنتجات",
      delivery: "مصاريف التوصيل",
      total: "المجموع النهائي",
      payment: "طريقة الأداء",
      cod: "الأداء نقداً عند الاستلام",
      confirm: "تأكيد الطلب",
      required: "المرجو ملء جميع الخانات الضرورية بشكل صحيح.",
      empty: "السلة فارغة. اختاري منتجاتك أولاً.",
      saveFailed: "تعذر حفظ الطلب. المرجو المحاولة مرة أخرى.",
      serverUnavailable: "الخادم غير متاح حالياً. المرجو المحاولة بعد قليل.",
      databaseUnavailable:
        "تعذر الاتصال بقاعدة بيانات الطلبات. المرجو المحاولة بعد قليل.",
      invalidOrder:
        "بعض بيانات الطلب غير صحيحة. راجع المعلومات وحاول مجدداً.",
      productUnavailable:
        "أحد المنتجات لم يعد متاحاً. راجع السلة وحاول مجدداً.",
      rateLimited: "طلبات كثيرة جداً. انتظري قليلاً ثم حاولي مجدداً.",
      success: "تم تسجيل طلبك بنجاح!",
      orderNumber: "رقم الطلب",
      thanks:
        "شكراً لاختياركم FAKHARA. ثقتكم مصدر فخرنا، وسنعمل على تجهيز طلبكم بكل عناية.",
      orderedItems: "المنتجات المطلوبة",
      deliveryInfo: "معلومات التوصيل",
      paymentMethod: "طريقة الأداء",
      quantity: "الكمية",
      home: "العودة للرئيسية",
      trackThisOrder: "تتبع هذا الطلب",
      currency: "درهم",
    },
    fr: {
      title: "Finaliser la commande",
      subtitle: "Une dernière étape pour recevoir vos créations",
      information: "Informations du client",
      fullName: "Nom complet",
      phone: "Téléphone",
      email: "E-mail (facultatif)",
      city: "Ville",
      address: "Adresse détaillée",
      summary: "Résumé de la commande",
      subtotal: "Sous-total",
      delivery: "Frais de livraison",
      total: "Total final",
      payment: "Mode de paiement",
      cod: "Paiement à la livraison",
      confirm: "Confirmer la commande",
      required: "Veuillez remplir correctement les champs obligatoires.",
      empty: "Votre panier est vide.",
      saveFailed: "Impossible d'enregistrer la commande. Réessayez.",
      serverUnavailable: "Le serveur est momentanément indisponible. Réessayez dans un instant.",
      databaseUnavailable:
        "Impossible de joindre la base des commandes. Réessayez dans un instant.",
      invalidOrder:
        "Certaines informations de la commande sont incorrectes. Vérifiez-les et réessayez.",
      productUnavailable:
        "Un produit n'est plus disponible. Vérifiez votre panier et réessayez.",
      rateLimited: "Trop de demandes. Patientez un peu puis réessayez.",
      success: "Votre commande a été enregistrée !",
      orderNumber: "Numéro de commande",
      thanks:
        "Merci d'avoir choisi FAKHARA. Votre confiance nous honore. Nous préparerons votre commande avec le plus grand soin.",
      orderedItems: "Produits commandés",
      deliveryInfo: "Informations de livraison",
      paymentMethod: "Mode de paiement",
      quantity: "Quantité",
      home: "Retour à l'accueil",
      trackThisOrder: "Suivre cette commande",
      currency: "DH",
    },
    en: {
      title: "Checkout",
      subtitle: "One last step to receive your pottery pieces",
      information: "Customer information",
      fullName: "Full name",
      phone: "Phone number",
      email: "Email (optional)",
      city: "City",
      address: "Detailed address",
      summary: "Order summary",
      subtotal: "Subtotal",
      delivery: "Delivery fee",
      total: "Final total",
      payment: "Payment method",
      cod: "Cash on delivery",
      confirm: "Confirm order",
      required: "Please complete all required fields correctly.",
      empty: "Your cart is empty.",
      saveFailed: "Could not save the order. Please try again.",
      serverUnavailable: "The server is temporarily unavailable. Please try again shortly.",
      databaseUnavailable:
        "Could not reach the order database. Please try again shortly.",
      invalidOrder:
        "Some order details are incorrect. Review them and try again.",
      productUnavailable:
        "A product is no longer available. Review your cart and try again.",
      rateLimited: "Too many requests. Wait a moment and try again.",
      success: "Your order has been recorded!",
      orderNumber: "Order number",
      thanks:
        "Thank you for choosing FAKHARA. Your trust means a lot to us. We will prepare your order with the utmost care.",
      orderedItems: "Ordered products",
      deliveryInfo: "Delivery information",
      paymentMethod: "Payment method",
      quantity: "Quantity",
      home: "Back to home",
      trackThisOrder: "Track this order",
      currency: "MAD",
    },
  };

  const t = translations[language] || translations.en;

  const orderItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);

      if (!product) {
        return null;
      }

      const variant = (product.images || []).find(
        (entry) => entry.key === item.variantKey
      );

      return {
        ...product,
        quantity: item.quantity,
        variantKey: item.variantKey || "",
        lineKey: cartLineKey(item),
        displayName: variant
          ? `${localizedContent(product.name, language)} - ${localizedContent(
              variant.name,
              language
            )}`
          : localizedContent(product.name, language),
        unitPrice:
          variant?.price !== null && variant?.price !== undefined
            ? variant.price
            : product.price,
      };
    })
    .filter(Boolean);

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const normalizedCity = form.city.trim().toLowerCase();

  const deliveryEntry = Object.entries(deliveryPrices).find(
    ([city]) => city.trim().toLowerCase() === normalizedCity
  );

  const deliveryFee = deliveryEntry ? deliveryEntry[1] : 50;
  const finalTotal = subtotal + deliveryFee;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.fullName.trim() ||
      !/^[0-9+\s()-]{8,20}$/.test(form.phone.trim()) ||
      !form.city.trim() ||
      !form.address.trim()
    ) {
      setError(t.required);
      return;
    }

    if (orderItems.length === 0) {
      setError(t.empty);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = await createOrder({
        customer: form,
        items: cart.map((item) => ({
          productId: item.id,
          variantKey: item.variantKey || "",
          quantity: item.quantity,
        })),
      });
      const order = payload?.order;

      if (!payload?.success || !order?.orderNumber) {
        throw new ApiRequestError("incomplete_order_response");
      }

      grantOrderTrackingAccess();
      localStorage.removeItem("fakhara-cart");
      setConfirmedOrder(order);
      addToast({ type: "success", message: feedback.orderSaved });
    } catch (orderError) {
      const code = orderError?.code;

      if (code === "network_error") {
        setError(t.serverUnavailable);
      } else if (code === "database_unavailable") {
        setError(t.databaseUnavailable);
      } else if (code === "rate_limit_exceeded") {
        setError(t.rateLimited);
      } else if (
        code === "product_not_available" ||
        code === "variant_not_available"
      ) {
        setError(t.productUnavailable);
      } else if (
        code?.startsWith("invalid_") ||
        code === "validation_error" ||
        code === "order_items_required" ||
        code === "quantity_too_large"
      ) {
        setError(t.invalidOrder);
      } else {
        setError(t.saveFailed);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedOrder) {
    return (
      <main className="checkout-page">
        <section className="checkout-success">
          <div className="checkout-success-icon">✓</div>
          <span>FAKHARA</span>
          <h1>{t.success}</h1>
          <p className="checkout-success-thanks">{t.thanks}</p>

          <div className="checkout-order-number">
            {t.orderNumber}
            <strong>{confirmedOrder.orderNumber}</strong>
          </div>

          <div className="checkout-success-details">
            <section className="checkout-success-card">
              <h2>{t.orderedItems}</h2>
              <ul>
                {confirmedOrder.items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variant?.key || ""}`}
                  >
                    <div>
                      <span className="checkout-success-card__name">
                        {localizedContent(item.name, language)}
                        {localizedContent(item.variant?.name, language)
                          ? ` - ${localizedContent(item.variant.name, language)}`
                          : ""}
                      </span>
                      <span className="checkout-success-card__meta">
                        {t.quantity}: {item.quantity} · {item.price} {t.currency}
                      </span>
                    </div>
                    <strong>
                      {item.price * item.quantity} {t.currency}
                    </strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="checkout-success-card">
              <h2>{t.deliveryInfo}</h2>
              <p>{confirmedOrder.customer.fullName}</p>
              <p>{confirmedOrder.customer.phone}</p>
              {confirmedOrder.customer.email && (
                <p>{confirmedOrder.customer.email}</p>
              )}
              <p>
                {confirmedOrder.customer.address},{" "}
                {confirmedOrder.customer.city}
              </p>

              <h2 className="checkout-success-card__subheading">
                {t.paymentMethod}
              </h2>
              <p>
                {confirmedOrder.paymentMethod === "cash_on_delivery"
                  ? t.cod
                  : confirmedOrder.paymentMethod}
              </p>
            </section>
          </div>

          <div className="checkout-success-total">
            <span>{t.total}</span>
            <strong>
              {confirmedOrder.total} {t.currency}
            </strong>
          </div>

          <div className="checkout-success-actions">
            <Link to="/track-order" className="checkout-submit">
              {t.trackThisOrder}
            </Link>
            <Link to="/" className="checkout-secondary-link">
              {t.home}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (orderItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>{t.empty}</h1>
          <Link to="/" className="checkout-submit">
            {t.home}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-banner">
        <span>FAKHARA</span>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </section>

      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-information">
            <h2>{t.information}</h2>

            <label>
              {t.fullName} *
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder={t.fullName}
                required
              />
            </label>

            <label>
              {t.phone} *
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+212 6..."
                required
              />
            </label>

            <label>
              {t.email}
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
              />
            </label>

            <label>
              {t.city} *
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder={t.city}
                required
              />
            </label>

            <label className="checkout-full-width">
              {t.address} *
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder={t.address}
                rows="4"
                required
              />
            </label>

          </section>

          <section className="checkout-payment">
            <h2>{t.payment}</h2>
            <label className="checkout-payment-option">
              <input type="radio" checked readOnly />
              <span>{t.cod}</span>
            </label>
          </section>

          {error && <p className="checkout-error">{error}</p>}

          <button
            type="submit"
            className="checkout-submit"
            disabled={submitting}
          >
            {submitting ? "..." : t.confirm}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>{t.summary}</h2>

          {orderItems.map((item) => (
            <div
              className="checkout-summary-product"
              key={item.lineKey}
            >
              <span>
                {item.displayName} × {item.quantity}
              </span>
              <strong>
                {item.unitPrice * item.quantity} {t.currency}
              </strong>
            </div>
          ))}

          <div className="checkout-summary-row">
            <span>{t.subtotal}</span>
            <strong>
              {subtotal} {t.currency}
            </strong>
          </div>

          <div className="checkout-summary-row">
            <span>{t.delivery}</span>
            <strong>
              {deliveryFee} {t.currency}
            </strong>
          </div>

          <div className="checkout-summary-total">
            <span>{t.total}</span>
            <strong>
              {finalTotal} {t.currency}
            </strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
