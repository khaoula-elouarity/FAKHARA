/**
 * AdminDashboard.jsx — Espace d'administration professionnel et sécurisé.
 *
 * Sécurités appliquées :
 *  - Protection côté navigateur : seul un admin authentifié (token présent
 *    ET valide au serveur) peut ouvrir le Dashboard. Les visiteurs normaux
 *    et les clients sont systématiquement redirigés.
 *  - Protection côté serveur : toutes les requêtes API admin sont protégées
 *    par `protectAdmin` (JWT + vérification de l'admin actif, isValid).
 *  - Aucune route publique n'expose la création de compte administrateur.
 *  - Les rôles ne sont jamais modifiables côté client.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardList,
  Compass,
  House,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings2,
  Sparkles,
  Tags,
  UsersRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "../context/Languagecontext.jsx";
import { localizedContent } from "../utils/localizedContent.js";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  adminLogout,
  adminMe,
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminContact,
  deleteAdminOrder,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminContacts,
  fetchAdminCustomer,
  fetchAdminCustomers,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminStats,
  updateAdminCategory,
  updateAdminContactStatus,
  updateAdminOrderStatus,
  updateAdminProduct,
  uploadAdminImage,
} from "../services/api.js";
import AdminDiscoveryPages from "./AdminDiscoveryPages.jsx";
import AdminFeaturedSection from "./AdminFeaturedSection.jsx";
import AdminHomepageContent from "./AdminHomepageContent.jsx";
import AdminWhatsAppSettings from "./AdminWhatsAppSettings.jsx";
import "./AdminDashboard.css";

const ui = {
  ar: {
    title: "لوحة إدارة فخارة",
    subtitle: "إدارة المنتجات والطلبات والعملاء",
    email: "البريد الإلكتروني",
    logout: "تسجيل الخروج",
    overview: "نظرة عامة",
    orders: "الطلبات",
    products: "المنتجات",
    categories: "المجموعات",
    messages: "الرسائل",
    customers: "العملاء",
    homepageContent: "محتوى الصفحة الرئيسية",
    featuredSection: "قطعة تستحق الاكتشاف",
    discoveryPages: "صفحات الاكتشاف",
    settings: "إعدادات واتساب",
    revenue: "المبيعات الإجمالية",
    averageOrderValue: "متوسط قيمة الطلب",
    lowStock: "مخزون منخفض",
    outOfStock: "نفد المخزون",
    totalStock: "إجمالي القطع في المخزون",
    inventory: "إدارة المخزون",
    bestSellers: "المنتجات الأكثر مبيعاً",
    salesReport: "تقرير المبيعات",
    last14Days: "آخر 14 يوماً",
    noSales: "لا توجد مبيعات مسجلة في هذه الفترة.",
    noLowStock: "جميع المنتجات لديها مخزون كافٍ.",
    soldQuantity: "الكمية المباعة",
    salesAmount: "قيمة المبيعات",
    stockFilterAll: "كل المخزون",
    stockFilterLow: "مخزون منخفض",
    stockFilterOut: "نفد المخزون",
    uploadImage: "تحميل صورة",
    uploading: "جار التحميل...",
    imageUploaded: "تم تحميل الصورة.",
    imageTooLarge: "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت).",
    uploadError: "تعذر تحميل الصورة.",
    imagePreview: "معاينة الصورة",
    all: "الكل",
    searchOrders: "بحث برقم الطلب أو العميل...",
    ordersCount: "عدد الطلبات",
    totalSpent: "إجمالي الإنفاق",
    units: "قطعة",
    viewStore: "زيارة المتجر",
    newOrders: "طلبات جديدة",
    pendingOrders: "طلبات قيد الانتظار",
    confirmedOrders: "طلبات مؤكدة",
    deliveredOrders: "طلبات تم تسليمها",
    newMessages: "رسائل جديدة",
    orderHistory: "سجل الطلبات",
    customerDetails: "تفاصيل العميل",
    view: "عرض",
    memberSince: "عميل منذ",
    noOrderHistory: "لا توجد طلبات لهذا العميل.",
    paymentMethod: "طريقة الدفع",
    cashOnDelivery: "الدفع عند التسليم",
    refresh: "تحديث",
    loading: "جار التحميل...",
    empty: "لا توجد بيانات بعد.",
    save: "حفظ",
    cancel: "إلغاء",
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    close: "إغلاق",
    confirmDelete: "هل تريد الحذف نهائياً؟",
    nameAr: "الاسم بالعربية",
    nameFr: "الاسم بالفرنسية",
    nameEn: "الاسم بالإنجليزية",
    cardTitleAr: "عنوان البطاقة بالعربية",
    cardTitleFr: "عنوان البطاقة بالفرنسية",
    cardTitleEn: "عنوان البطاقة بالإنجليزية",
    descriptionAr: "الوصف بالعربية",
    descriptionFr: "الوصف بالفرنسية",
    descriptionEn: "الوصف بالإنجليزية",
    productId: "معرّف المنتج",
    category: "المجموعة",
    price: "السعر",
    productName: "اسم المنتوج",
    productDescription: "الوصف",
    productPrice: "الثمن",
    productInfo: "معلومات المنتوج",
    productInfoHint: "أدخل المعلومات الأساسية للمنتوج فقط.",
    chooseImage: "اختيار الصورة",
    optional: "(اختياري)",
    mainImageHint: "اختر صورة واحدة من جهازك. يمكنك تغييرها أو إزالتها قبل الحفظ.",
    mainImageRequired: "يرجى اختيار الصورة الرئيسية قبل الحفظ.",
    image: "رابط الصورة",
    mainImage: "الصورة الرئيسية",
    additionalImages: "صور إضافية",
    galleryHint:
      "يمكنك إضافة حتى 4 صور إضافية. الخانات الفارغة لن تظهر في المتجر.",
    addImage: "إضافة صورة",
    replaceImage: "استبدال",
    removeImage: "إزالة",
    emptyImageSlot: "خانة فارغة",
    galleryDuplicate: "لا يمكن استخدام الصورة نفسها أكثر من مرة.",
    collectionHasProducts:
      "تحتوي هذه المجموعة على منتجات. اختر مجموعة لنقل المنتجات إليها قبل الحذف.",
    moveProductsTo: "نقل المنتجات إلى",
    reassignAndDelete: "نقل وحذف",
    productCount: "عدد المنتجات",
    invalidReassignCategory: "اختر مجموعة صالحة لنقل المنتجات.",
    stock: "المخزون",
    active: "نشط",
    inactive: "غير نشط",
    featured: "مميز",
    variants: "المتغيرات (JSON)",
    slug: "الرابط المختصر",
    order: "الترتيب",
    customer: "العميل",
    phone: "الهاتف",
    city: "المدينة",
    address: "العنوان",
    total: "المجموع",
    status: "الحالة",
    date: "التاريخ",
    items: "المنتجات",
    subject: "الموضوع",
    message: "الرسالة",
    product: "المنتج",
    noOrders: "لا توجد طلبات.",
    noProducts: "لا توجد منتجات.",
    noCategories: "لا توجد مجموعات.",
    noMessages: "لا توجد رسائل.",
    noCustomers: "لا يوجد عملاء.",
    saveError: "تعذر حفظ البيانات.",
    deleteError: "تعذر حذف العنصر.",
    saved: "تم الحفظ.",
    deleted: "تم الحذف.",
    deliveryConfirmation: "التوصيل يُؤكَّد من العميل فقط بعد استلام الطلب.",
    statuses: {
      pending: "جديد",
      confirmed: "مؤكد",
      preparing: "قيد المعالجة",
      shipped: "تم الشحن",
      out_for_delivery: "قيد التوصيل",
      delivered: "مكتمل",
      cancelled: "ملغى",
      new: "جديد",
      read: "مقروء",
      replied: "تم الرد",
      archived: "مؤرشف",
      processing: "قيد المعالجة",
      completed: "مكتمل",
    },
  },
  fr: {
    title: "Administration FAKHARA",
    subtitle: "Gérez les produits, commandes et clients",
    email: "E-mail",
    logout: "Se déconnecter",
    overview: "Vue d'ensemble",
    orders: "Commandes",
    products: "Produits",
    categories: "Collections",
    messages: "Messages",
    customers: "Clients",
    homepageContent: "Contenu de la page d'accueil",
    featuredSection: "Pièce à découvrir",
    discoveryPages: "Pages de découverte",
    settings: "Paramètres WhatsApp",
    revenue: "Ventes totales",
    averageOrderValue: "Panier moyen",
    lowStock: "Stock faible",
    outOfStock: "Rupture de stock",
    totalStock: "Unités en stock",
    inventory: "Gestion du stock",
    bestSellers: "Meilleures ventes",
    salesReport: "Rapport des ventes",
    last14Days: "14 derniers jours",
    noSales: "Aucune vente enregistrée sur cette période.",
    noLowStock: "Tous les produits ont un stock suffisant.",
    soldQuantity: "Quantité vendue",
    salesAmount: "Montant des ventes",
    stockFilterAll: "Tout le stock",
    stockFilterLow: "Stock faible",
    stockFilterOut: "Rupture",
    uploadImage: "Téléverser une image",
    uploading: "Téléversement...",
    imageUploaded: "Image téléversée.",
    imageTooLarge: "Image trop volumineuse (5 Mo maximum).",
    uploadError: "Impossible de téléverser l'image.",
    imagePreview: "Aperçu de l'image",
    all: "Toutes",
    searchOrders: "Rechercher une commande ou un client...",
    ordersCount: "Commandes",
    totalSpent: "Total dépensé",
    units: "unités",
    viewStore: "Voir la boutique",
    newOrders: "Nouvelles commandes",
    pendingOrders: "Commandes en attente",
    confirmedOrders: "Commandes confirmées",
    deliveredOrders: "Commandes livrées",
    newMessages: "Nouveaux messages",
    orderHistory: "Historique des commandes",
    customerDetails: "Détails du client",
    view: "Voir",
    memberSince: "Client depuis",
    noOrderHistory: "Aucune commande pour ce client.",
    paymentMethod: "Mode de paiement",
    cashOnDelivery: "Paiement à la livraison",
    refresh: "Actualiser",
    loading: "Chargement...",
    empty: "Aucune donnée pour le moment.",
    save: "Enregistrer",
    cancel: "Annuler",
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    close: "Fermer",
    confirmDelete: "Supprimer définitivement ?",
    nameAr: "Nom en arabe",
    nameFr: "Nom en français",
    nameEn: "Nom en anglais",
    cardTitleAr: "Titre de carte en arabe",
    cardTitleFr: "Titre de carte en français",
    cardTitleEn: "Titre de carte en anglais",
    descriptionAr: "Description en arabe",
    descriptionFr: "Description en français",
    descriptionEn: "Description en anglais",
    productId: "Identifiant produit",
    category: "Collection",
    price: "Prix",
    productName: "Nom du produit",
    productDescription: "Description",
    productPrice: "Prix",
    productInfo: "Informations du produit",
    productInfoHint: "Saisissez uniquement les informations essentielles.",
    chooseImage: "Choisir l'image",
    optional: "(facultatif)",
    mainImageHint: "Choisissez une image sur votre appareil. Vous pouvez la remplacer ou la retirer avant l'enregistrement.",
    mainImageRequired: "Veuillez choisir l'image principale avant l'enregistrement.",
    image: "URL de l'image",
    mainImage: "Image principale",
    additionalImages: "Images supplémentaires",
    galleryHint:
      "Ajoutez jusqu'à 4 images. Les emplacements vides ne sont pas affichés en boutique.",
    addImage: "Ajouter une image",
    replaceImage: "Remplacer",
    removeImage: "Retirer",
    emptyImageSlot: "Emplacement vide",
    galleryDuplicate: "Une même image ne peut pas être utilisée deux fois.",
    collectionHasProducts:
      "Cette collection contient des produits. Choisissez une collection de destination avant la suppression.",
    moveProductsTo: "Déplacer les produits vers",
    reassignAndDelete: "Déplacer et supprimer",
    productCount: "Produits",
    invalidReassignCategory: "Choisissez une collection valide.",
    stock: "Stock",
    active: "Actif",
    inactive: "Inactif",
    featured: "Mis en avant",
    variants: "Variantes (JSON)",
    slug: "Slug",
    order: "Ordre",
    customer: "Client",
    phone: "Téléphone",
    city: "Ville",
    address: "Adresse",
    total: "Total",
    status: "Statut",
    date: "Date",
    items: "Produits",
    subject: "Sujet",
    message: "Message",
    product: "Produit",
    noOrders: "Aucune commande.",
    noProducts: "Aucun produit.",
    noCategories: "Aucune collection.",
    noMessages: "Aucun message.",
    noCustomers: "Aucun client.",
    saveError: "Impossible d'enregistrer.",
    deleteError: "Impossible de supprimer.",
    saved: "Enregistré.",
    deleted: "Supprimé.",
    deliveryConfirmation: "La livraison est confirmée uniquement par le client après réception.",
    statuses: {
      pending: "Nouvelle",
      confirmed: "Confirmée",
      preparing: "En traitement",
      shipped: "Expédiée",
      out_for_delivery: "En cours de livraison",
      delivered: "Terminée",
      cancelled: "Annulée",
      new: "Nouveau",
      read: "Lu",
      replied: "Répondu",
      archived: "Archivé",
      processing: "En traitement",
      completed: "Terminé",
    },
  },
  en: {
    title: "FAKHARA Admin",
    subtitle: "Manage products, orders and customers",
    email: "Email",
    logout: "Sign out",
    overview: "Overview",
    orders: "Orders",
    products: "Products",
    categories: "Collections",
    messages: "Messages",
    customers: "Customers",
    homepageContent: "Homepage content",
    featuredSection: "Pieces worth discovering",
    discoveryPages: "Discovery pages",
    settings: "WhatsApp settings",
    revenue: "Total sales",
    averageOrderValue: "Average order value",
    lowStock: "Low stock",
    outOfStock: "Out of stock",
    totalStock: "Units in stock",
    inventory: "Inventory",
    bestSellers: "Best sellers",
    salesReport: "Sales report",
    last14Days: "Last 14 days",
    noSales: "No sales recorded in this period.",
    noLowStock: "All products have sufficient stock.",
    soldQuantity: "Units sold",
    salesAmount: "Sales amount",
    stockFilterAll: "All stock",
    stockFilterLow: "Low stock",
    stockFilterOut: "Out of stock",
    uploadImage: "Upload image",
    uploading: "Uploading...",
    imageUploaded: "Image uploaded.",
    imageTooLarge: "Image is too large (5 MB maximum).",
    uploadError: "Could not upload the image.",
    imagePreview: "Image preview",
    all: "All",
    searchOrders: "Search by order number or customer...",
    ordersCount: "Orders",
    totalSpent: "Total spent",
    units: "units",
    viewStore: "View store",
    newOrders: "New orders",
    pendingOrders: "Pending orders",
    confirmedOrders: "Confirmed orders",
    deliveredOrders: "Delivered orders",
    newMessages: "New messages",
    orderHistory: "Order history",
    customerDetails: "Customer details",
    view: "View",
    memberSince: "Customer since",
    noOrderHistory: "No orders for this customer.",
    paymentMethod: "Payment method",
    cashOnDelivery: "Cash on delivery",
    refresh: "Refresh",
    loading: "Loading...",
    empty: "No data yet.",
    save: "Save",
    cancel: "Cancel",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    confirmDelete: "Delete permanently?",
    nameAr: "Arabic name",
    nameFr: "French name",
    nameEn: "English name",
    cardTitleAr: "Arabic card title",
    cardTitleFr: "French card title",
    cardTitleEn: "English card title",
    descriptionAr: "Arabic description",
    descriptionFr: "French description",
    descriptionEn: "English description",
    productId: "Product ID",
    category: "Collection",
    price: "Price",
    productName: "Product name",
    productDescription: "Description",
    productPrice: "Price",
    productInfo: "Product information",
    productInfoHint: "Enter only the essential product details.",
    chooseImage: "Choose image",
    optional: "(optional)",
    mainImageHint: "Pick one image from your device. You can change or remove it before saving.",
    mainImageRequired: "Please choose a main image before saving.",
    image: "Image URL",
    mainImage: "Main image",
    additionalImages: "Additional images",
    galleryHint:
      "Add up to 4 additional images. Empty slots are not displayed on the storefront.",
    addImage: "Add image",
    replaceImage: "Replace",
    removeImage: "Remove",
    emptyImageSlot: "Empty slot",
    galleryDuplicate: "The same image cannot be used more than once.",
    collectionHasProducts:
      "This collection contains products. Choose another collection to receive them before deleting.",
    moveProductsTo: "Move products to",
    reassignAndDelete: "Move and delete",
    productCount: "Products",
    invalidReassignCategory: "Choose a valid collection.",
    stock: "Stock",
    active: "Active",
    inactive: "Inactive",
    featured: "Featured",
    variants: "Variants (JSON)",
    slug: "Slug",
    order: "Order",
    customer: "Customer",
    phone: "Phone",
    city: "City",
    address: "Address",
    total: "Total",
    status: "Status",
    date: "Date",
    items: "Items",
    subject: "Subject",
    message: "Message",
    product: "Product",
    noOrders: "No orders yet.",
    noProducts: "No products yet.",
    noCategories: "No collections yet.",
    noMessages: "No messages yet.",
    noCustomers: "No customers yet.",
    saveError: "Could not save.",
    deleteError: "Could not delete.",
    saved: "Saved.",
    deleted: "Deleted.",
    deliveryConfirmation: "Delivery is confirmed only by the customer after receipt.",
    statuses: {
      pending: "New",
      confirmed: "Confirmed",
      preparing: "Processing",
      shipped: "Shipped",
      out_for_delivery: "Out for delivery",
      delivered: "Completed",
      cancelled: "Cancelled",
      new: "New",
      read: "Read",
      replied: "Replied",
      archived: "Archived",
      processing: "Processing",
      completed: "Completed",
    },
  },
};

const tabs = [
  "overview",
  "orders",
  "products",
  "categories",
  "messages",
  "customers",
  "homepageContent",
  "featuredSection",
  "discoveryPages",
  "settings",
];

const TAB_ICONS = {
  overview: LayoutDashboard,
  orders: ClipboardList,
  products: Package,
  categories: Tags,
  messages: MessageSquare,
  customers: UsersRound,
  homepageContent: House,
  featuredSection: Sparkles,
  discoveryPages: Compass,
  settings: Settings2,
};

const TAB_PERMISSIONS = {
  overview: "orders:read",
  orders: "orders:read",
  products: "products:read",
  categories: "categories:read",
  messages: "contacts:read",
  customers: "customers:read",
};

const TAB_ROUTES = {
  overview: "/admin",
  orders: "/admin/orders",
  products: "/admin/products",
  categories: "/admin/categories",
  messages: "/admin/messages",
  customers: "/admin/customers",
  homepageContent: "/admin/homepage-content",
  featuredSection: "/admin/featured-section",
  discoveryPages: "/admin/discovery-pages",
  settings: "/admin/settings",
};

const ORDER_STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "cancelled",
];

const LOW_STOCK_THRESHOLD = 5;
const GALLERY_SLOTS = 4;

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

function createProductId() {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `fakhara-${random}`;
}

function tabFromPath(pathname) {
  const entry = Object.entries(TAB_ROUTES).find(
    ([, route]) => route === pathname
  );
  return entry ? entry[0] : null;
}

function routeForTab(tab) {
  return TAB_ROUTES[tab] || TAB_ROUTES.overview;
}

const emptyProduct = {
  isNew: true,
  productId: "",
  category: "",
  price: 0,
  image: "",
  galleryImages: ["", "", "", ""],
  stock: 0,
  sortOrder: 0,
  isActive: true,
  featured: false,
  name: { ar: "", fr: "", en: "" },
  cardTitle: { ar: "", fr: "", en: "" },
  description: { ar: "", fr: "", en: "" },
  variantsText: "[]",
};

const emptyCategory = {
  isNew: true,
  slug: "",
  name: { ar: "", fr: "", en: "" },
  description: { ar: "", fr: "", en: "" },
  image: "",
  order: 0,
  isActive: true,
};

function localized(value, language) {
  return localizedContent(value, language);
}

function normalizeGallerySlots(value) {
  const images = Array.isArray(value) ? value : [];
  return Array.from({ length: GALLERY_SLOTS }, (_, index) =>
    typeof images[index] === "string" ? images[index] : ""
  );
}

function formatDate(value, language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(
    language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-GB",
    { dateStyle: "medium", timeStyle: "short" }
  ).format(date);
}

function formatMoney(value) {
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: 2,
  }).format(amount)} DH`;
}

function orderTotalForCustomer(customer) {
  return (customer?.orders || []).reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );
}

/**
 * Vérifie côté navigateur que la session admin est valide.
 * Une tentative invalide (cookie absent, expiré, ou admin désactivé) redirige
 * l'utilisateur vers la page de connexion admin.
 */
async function validateAdminSession() {
  // The secure httpOnly cookie is the only browser-side session credential.
  try {
    const payload = await adminMe();
    return payload?.admin || null;
  } catch {
    return null;
  }
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { reload, reloadSettings } = useStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const t = ui[language] || ui.en;

  const [admin, setAdmin] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [activeTab, setActiveTab] = useState(
    () => tabFromPath(location.pathname) || "overview"
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const [productForm, setProductForm] = useState(null);
  const [categoryForm, setCategoryForm] = useState(null);
  const [categoryDelete, setCategoryDelete] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const mainImageInputRef = useRef(null);
  const galleryImageInputRefs = useRef([]);

  // 1) Si pas de token, ne rien afficher tant que la vérification n'est pas faite.
  useEffect(() => {
    validateAdminSession().then((admin) => {
      setAdmin(admin);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!authChecked || admin) return;

    navigate("/account/login", {
      replace: true,
      state: { from: location.pathname },
    });
  }, [admin, authChecked, location.pathname, navigate]);

  const can = useCallback(
    (permission) =>
      Boolean(
        admin &&
          (admin.role === "superadmin" ||
            (admin.permissions || []).includes(permission))
      ),
    [admin]
  );

  const canWrite = useCallback(
    (resource) => can(`${resource}:write`),
    [can]
  );

  const allowedTabs = useMemo(
    () =>
      tabs.filter(
        (tab) => !TAB_PERMISSIONS[tab] || can(TAB_PERMISSIONS[tab])
      ),
    [can]
  );

  // The URL is the source of truth for the current section, so every section
  // can be bookmarked, refreshed and shared (/admin/products, /admin/orders…).
  useEffect(() => {
    if (!admin) return;
    const routeTab = tabFromPath(location.pathname);
    if (routeTab && routeTab !== activeTab) {
      setActiveTab(routeTab);
    }
  }, [admin, location.pathname, activeTab]);

  // Keep the active tab within the set this administrator may access. A
  // restricted administrator is redirected to the first route it can read.
  useEffect(() => {
    if (!admin) return;
    if (!allowedTabs.includes(activeTab)) {
      const nextTab = allowedTabs[0] || "overview";
      setActiveTab(nextTab);
      navigate(routeForTab(nextTab), { replace: true });
    }
  }, [admin, activeTab, allowedTabs, navigate]);

  function openTab(tab) {
    setActiveTab(tab);
    navigate(routeForTab(tab));
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      // Only request the resources this administrator is allowed to read, so a
      // restricted account never trips over a forbidden endpoint.
      const jobs = [];

      if (can("orders:read")) {
        jobs.push(
          fetchAdminStats().then((payload) => setStats(payload.stats))
        );
        jobs.push(
          fetchAdminOrders().then((payload) =>
            setOrders(payload.orders || [])
          )
        );
      }

      if (can("products:read")) {
        jobs.push(
          fetchAdminProducts().then((payload) =>
            setProducts(payload.products || [])
          )
        );
      }

      if (can("categories:read")) {
        jobs.push(
          fetchAdminCategories().then((payload) =>
            setCategories(payload.categories || [])
          )
        );
      }

      if (can("contacts:read")) {
        jobs.push(
          fetchAdminContacts().then((payload) =>
            setMessages(payload.messages || [])
          )
        );
      }

      if (can("customers:read")) {
        jobs.push(
          fetchAdminCustomers().then((payload) =>
            setCustomers(payload.customers || [])
          )
        );
      }

      await Promise.all(jobs);
      await Promise.all([reload(), reloadSettings()]);
    } catch (error) {
      if (error.status === 401) {
        setAdmin(null);
        navigate("/account/login", { replace: true });
      } else {
        setLoadError(error.code || "request_failed");
      }
    } finally {
      setLoading(false);
    }
  }, [can, navigate, reload, reloadSettings]);

  // 2) Régénérer les données quand un admin est connecté.
  useEffect(() => {
    if (admin) loadData();
  }, [admin, loadData]);

  const productCategoryOptions = useMemo(
    () => [
      { slug: "featured", label: t.featuredSection },
      ...categories.map((category) => ({
        slug: category.id || category.slug,
        label: localized(category.name, language) || category.id || category.slug,
      })),
    ],
    [categories, language, t.featuredSection]
  );

  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase();

    return orders.filter((order) => {
      if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [
        order.orderNumber,
        order.customer?.fullName,
        order.customer?.phone,
        order.customer?.email,
        order.customer?.city,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    if (stockFilter === "low") {
      return products.filter(
        (product) => Number(product.stock) <= LOW_STOCK_THRESHOLD
      );
    }

    if (stockFilter === "out") {
      return products.filter((product) => Number(product.stock) <= 0);
    }

    return products;
  }, [products, stockFilter]);

  const bestSellers = stats?.bestSellers || [];
  const lowStockProducts =
    stats?.lowStockProducts ||
    products
      .filter((product) => Number(product.stock) <= LOW_STOCK_THRESHOLD)
      .slice(0, 10);
  const salesTrend = stats?.salesTrend || [];
  const maxTrendRevenue = Math.max(
    1,
    ...salesTrend.map((day) => Number(day.revenue) || 0)
  );

  async function logout() {
    try {
      await adminLogout();
    } catch {
      // The local session is cleared regardless of the server response.
    }

    setAdmin(null);
    setActiveTab("overview");
    setCustomerDetail(null);
    setCategoryDelete(null);
    navigate("/account/login", { replace: true });
  }

  function showSaved() {
    addToast({ type: "success", message: t.saved });
  }

  async function openCustomerDetail(customer) {
    setCustomerDetail({ ...customer, orders: customer.orders || [] });
    setCustomerDetailLoading(true);

    try {
      const payload = await fetchAdminCustomer(customer.id);
      setCustomerDetail(payload.customer);
    } catch {
      addToast({ type: "error", message: t.loadError });
    } finally {
      setCustomerDetailLoading(false);
    }
  }

  async function handleDelete(action, success = t.deleted) {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await action();
      addToast({ type: "success", message: success });
      await loadData();
    } catch {
      addToast({ type: "error", message: t.deleteError });
    }
  }

  function openNewProduct() {
    setProductForm({
      ...emptyProduct,
      productId: createProductId(),
      category:
        productCategoryOptions.find(
          (category) => category.slug !== "featured"
        )?.slug || "featured",
      galleryImages: normalizeGallerySlots(),
      name: { ...emptyProduct.name },
      cardTitle: { ...emptyProduct.cardTitle },
      description: { ...emptyProduct.description },
    });
    galleryImageInputRefs.current = [];
  }

  function openProduct(product) {
    setProductForm({
      isNew: false,
      productId: product.id,
      category: product.category || "",
      price: product.price || 0,
      image: product.image || "",
      galleryImages: normalizeGallerySlots(product.galleryImages),
      stock: product.stock || 0,
      sortOrder: product.sortOrder || 0,
      isActive: product.isActive !== false,
      featured: Boolean(product.featured),
      name: { ...emptyProduct.name, ...product.name },
      cardTitle: { ...emptyProduct.cardTitle, ...product.cardTitle },
      description: { ...emptyProduct.description, ...product.description },
      variantsText: JSON.stringify(product.images || [], null, 2),
    });
    galleryImageInputRefs.current = [];
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (productForm.isNew && !productForm.image) {
      addToast({ type: "error", message: t.mainImageRequired });
      return;
    }
    setSaving(true);
    try {
      let variants = [];
      try {
        variants = JSON.parse(productForm.variantsText || "[]");
      } catch {
        throw new Error("invalid_variants");
      }
      if (!Array.isArray(variants)) throw new Error("invalid_variants");
      const payload = {
        productId: productForm.productId,
        category: productForm.category,
        price: Number(productForm.price),
        image: productForm.image,
        galleryImages: normalizeGallerySlots(productForm.galleryImages),
        stock: Number(productForm.stock),
        sortOrder: Number(productForm.sortOrder) || 0,
        isActive: productForm.isActive,
        featured: productForm.featured,
        name: productForm.name,
        cardTitle: productForm.cardTitle,
        description: productForm.description,
        images: variants,
      };
      if (productForm.isNew) {
        await createAdminProduct(payload);
      } else {
        await updateAdminProduct(productForm.productId, payload);
      }
      setProductForm(null);
      showSaved();
      await loadData();
    } catch (error) {
      addToast({
        type: "error",
        message:
          error.message === "invalid_variants"
            ? t.variants
            : error.code === "product_id_already_exists"
              ? error.code
              : error.code === "duplicate_gallery_image"
                ? t.galleryDuplicate
                : error.code?.startsWith("invalid_galleryImages")
                  ? t.galleryHint
                  : t.saveError,
      });
    } finally {
      setSaving(false);
    }
  }

  function openNewCategory() {
    setCategoryForm({
      ...emptyCategory,
      name: { ...emptyCategory.name },
      description: { ...emptyCategory.description },
    });
  }

  function openCategory(category) {
    setCategoryForm({
      isNew: false,
      slug: category.id,
      name: { ...emptyCategory.name, ...category.name },
      description: { ...emptyCategory.description, ...category.description },
      image: category.image || "",
      order: category.order || 0,
      isActive: category.isActive !== false,
    });
  }

  async function saveCategory(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: categoryForm.slug,
        name: categoryForm.name,
        description: categoryForm.description,
        image: categoryForm.image,
        order: Number(categoryForm.order),
        isActive: categoryForm.isActive,
      };
      if (categoryForm.isNew) {
        await createAdminCategory(payload);
      } else {
        await updateAdminCategory(categoryForm.slug, payload);
      }
      setCategoryForm(null);
      showSaved();
      await loadData();
    } catch (error) {
      addToast({
        type: "error",
        message:
          error.code === "category_slug_already_exists"
            ? error.code
            : t.saveError,
      });
    } finally {
      setSaving(false);
    }
  }

  function openCategoryDelete(category) {
    const productCount = Array.isArray(category.products)
      ? category.products.length
      : products.filter((product) => product.category === category.id).length;

    if (productCount === 0) {
      handleDelete(() => deleteAdminCategory(category.id));
      return;
    }

    setCategoryDelete({ category, reassignTo: "" });
  }

  async function confirmCategoryDelete() {
    const target = categoryDelete?.reassignTo;

    if (!target) {
      addToast({ type: "error", message: t.invalidReassignCategory });
      return;
    }

    setSaving(true);

    try {
      await deleteAdminCategory(categoryDelete.category.id, target);
      setCategoryDelete(null);
      showSaved();
      await loadData();
    } catch (error) {
      addToast({
        type: "error",
        message:
          error.code === "category_has_products"
            ? t.collectionHasProducts
            : error.code === "invalid_reassign_category"
              ? t.invalidReassignCategory
              : t.deleteError,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(event, target, slotIndex = 0) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingImage(true);

    try {
      const payload = await uploadAdminImage(file);
      const url = payload?.image?.url;

      if (!url) {
        throw new Error("missing_image_url");
      }

      if (target === "product") {
        setProductForm((current) =>
          current ? { ...current, image: url } : current
        );
      } else if (target === "gallery") {
        setProductForm((current) =>
          current
            ? {
                ...current,
                galleryImages: normalizeGallerySlots(
                  current.galleryImages
                ).map((image, index) => (index === slotIndex ? url : image)),
              }
            : current
        );
      } else {
        setCategoryForm((current) =>
          current ? { ...current, image: url } : current
        );
      }

      addToast({ type: "success", message: t.imageUploaded });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error.code === "image_too_large" ? t.imageTooLarge : t.uploadError,
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function setProductTextField(field, code, value) {
    setProductForm((current) =>
      current
        ? {
            ...current,
            [field]: {
              ...current[field],
              [code]: value,
            },
          }
        : current
    );
  }

  function removeMainImage() {
    setProductForm((current) =>
      current ? { ...current, image: "" } : current
    );
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = "";
    }
  }

  function removeGalleryImage(index) {
    setProductForm((current) =>
      current
        ? {
            ...current,
            galleryImages: normalizeGallerySlots(current.galleryImages).map(
              (image, slot) => (slot === index ? "" : image)
            ),
          }
        : current
    );
    const input = galleryImageInputRefs.current[index];
    if (input) {
      input.value = "";
    }
  }

  async function changeOrderStatus(order, status) {
    try {
      await updateAdminOrderStatus(order.id, status);
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? { ...item, status } : item))
      );
      showSaved();
    } catch {
      addToast({ type: "error", message: t.saveError });
    }
  }

  async function changeMessageStatus(message, status) {
    try {
      await updateAdminContactStatus(message.id, status);
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? { ...item, status } : item))
      );
      showSaved();
    } catch {
      addToast({ type: "error", message: t.saveError });
    }
  }

  if (!authChecked || !admin) {
    return null;
  }

  return (
    <main className="admin-page">
      <header className="admin-heading">
        <div>
          <span>FAKHARA MANAGEMENT</span>
          <h1>{t.title}</h1>
          <p>
            {t.subtitle} · {admin.name}
          </p>
        </div>
        <div className="admin-heading-actions">
          <button type="button" onClick={loadData} disabled={loading}>
            {loading ? t.loading : t.refresh}
          </button>
          <button type="button" onClick={logout}>
            {t.logout}
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label={t.title}>
        {allowedTabs.map((tab) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => openTab(tab)}
          >
            {React.createElement(TAB_ICONS[tab], {
              className: "admin-tab-icon",
              size: 17,
              strokeWidth: 1.7,
              "aria-hidden": true,
            })}
            <span>{t[tab]}</span>
          </button>
        ))}
      </nav>

      {loadError && (
        <p className="admin-error" role="alert">
          {loadError}
        </p>
      )}

      {activeTab === "overview" && can("orders:read") && (
        <>
          <section className="admin-stats">
            <article className="admin-stat-card">
              <p>{t.revenue}</p>
              <strong>{formatMoney(stats?.revenue ?? 0)}</strong>
            </article>
            <article className="admin-stat-card">
              <p>{t.orders}</p>
              <strong>{stats?.orders ?? 0}</strong>
            </article>
            <article className="admin-stat-card">
              <p>{t.products}</p>
              <strong>{stats?.products ?? 0}</strong>
            </article>
            <article className="admin-stat-card">
              <p>{t.customers}</p>
              <strong>{stats?.customers ?? 0}</strong>
            </article>
            <article className="admin-stat-card">
              <p>{t.pendingOrders}</p>
              <strong>{stats?.pendingOrders ?? stats?.newOrders ?? 0}</strong>
            </article>
            <article className="admin-stat-card">
              <p>{t.averageOrderValue}</p>
              <strong>{formatMoney(stats?.averageOrderValue ?? 0)}</strong>
            </article>
            <article className="admin-stat-card">
              <p>{t.lowStock}</p>
              <strong>{stats?.lowStock ?? 0}</strong>
            </article>
            <article className="admin-stat-card">
              <p>{t.outOfStock}</p>
              <strong>{stats?.outOfStock ?? 0}</strong>
            </article>
          </section>

          <section className="admin-section">
            <div className="admin-section-heading">
              <h2>{t.salesReport}</h2>
              <span className="admin-section-meta">{t.last14Days}</span>
            </div>
            {salesTrend.length === 0 ||
            salesTrend.every((day) => !day.revenue) ? (
              <div className="admin-empty">{t.noSales}</div>
            ) : (
              <div className="admin-sales-chart">
                {salesTrend.map((day) => (
                  <div className="admin-sales-column" key={day.date}>
                    <div
                      className="admin-sales-bar-track"
                      title={`${day.date} · ${formatMoney(day.revenue)} · ${day.orders} ${t.ordersCount}`}
                    >
                      <span
                        style={{
                          height: `${Math.max(
                            3,
                            (Number(day.revenue) / maxTrendRevenue) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <small>{day.date.slice(5)}</small>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-section">
            <h2>{t.bestSellers}</h2>
            {bestSellers.length === 0 ? (
              <div className="admin-empty">{t.empty}</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-compact-table">
                  <thead>
                    <tr>
                      <th>{t.product}</th>
                      <th>{t.soldQuantity}</th>
                      <th>{t.salesAmount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSellers.map((item) => (
                      <tr key={item.productId}>
                        <td>
                          <div className="admin-product-cell">
                            {item.image ? (
                              <img
                                className="admin-thumb"
                                src={item.image}
                                alt=""
                                loading="lazy"
                              />
                            ) : null}
                            <div>
                              <strong>{localized(item.name, language)}</strong>
                              <small>{item.productId}</small>
                            </div>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{formatMoney(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-section">
            <h2>{t.lowStock}</h2>
            {lowStockProducts.length === 0 ? (
              <div className="admin-empty">{t.noLowStock}</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-compact-table">
                  <thead>
                    <tr>
                      <th>{t.product}</th>
                      <th>{t.stock}</th>
                      <th>{t.price}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="admin-product-cell">
                            {product.image ? (
                              <img
                                className="admin-thumb"
                                src={product.image}
                                alt=""
                                loading="lazy"
                              />
                            ) : null}
                            <div>
                              <strong>{localized(product.name, language)}</strong>
                              <small>{product.productId}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`admin-stock-chip ${
                              Number(product.stock) <= 0 ? "is-out" : "is-low"
                            }`}
                          >
                            {product.stock} {t.units}
                          </span>
                        </td>
                        <td>{formatMoney(product.price)}</td>
                        <td className="admin-row-actions">
                          {canWrite("products") &&
                          products.some((item) => item.id === product.id) ? (
                            <button
                              type="button"
                              onClick={() => {
                                const fullProduct = products.find(
                                  (item) => item.id === product.id
                                );
                                if (fullProduct) openProduct(fullProduct);
                              }}
                            >
                              {t.edit}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-section">
            <h2>{t.orders}</h2>
            {orders.length === 0 ? (
              <div className="admin-empty">{t.noOrders}</div>
            ) : (
              <div className="admin-orders-list">
                {orders.slice(0, 6).map((order) => (
                  <article className="admin-order-card" key={order.id}>
                    <div className="admin-order-top">
                      <div>
                        <span className="admin-order-label">{t.orders}</span>
                        <h3>#{order.orderNumber}</h3>
                        <span className={`admin-status-badge is-${order.status}`}>
                          {t.statuses[order.status]}
                        </span>
                      </div>
                      <strong className="admin-order-total">
                        {formatMoney(order.total)}
                      </strong>
                    </div>
                    <div className="admin-order-info">
                      <p>
                        <strong>{t.customer}:</strong> {order.customer?.fullName}
                      </p>
                      <p>
                        <strong>{t.phone}:</strong> {order.customer?.phone}
                      </p>
                      <p>
                        <strong>{t.date}:</strong>{" "}
                        {formatDate(order.createdAt, language)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === "orders" && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <h2>{t.orders}</h2>
            <span className="admin-section-meta">
              {filteredOrders.length} / {orders.length}
            </span>
          </div>
          {orders.length === 0 ? (
            <div className="admin-empty">{t.noOrders}</div>
          ) : (
            <>
              <div className="admin-filter-row">
                <input
                  type="search"
                  value={orderSearch}
                  placeholder={t.searchOrders}
                  onChange={(event) => setOrderSearch(event.target.value)}
                />
                <select
                  value={orderStatusFilter}
                  onChange={(event) =>
                    setOrderStatusFilter(event.target.value)
                  }
                >
                  <option value="all">{t.all}</option>
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option value={status} key={status}>
                      {t.statuses[status]}
                    </option>
                  ))}
                </select>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="admin-empty">{t.empty}</div>
              ) : (
                <div className="admin-orders-list">
                  {filteredOrders.map((order) => (
                <article className="admin-order-card" key={order.id}>
                  <div className="admin-order-top">
                    <div>
                      <span className="admin-order-label">{t.orders}</span>
                      <h3>#{order.orderNumber}</h3>
                    </div>
                    <strong className="admin-order-total">
                      {formatMoney(order.total)}
                    </strong>
                  </div>
                  <div className="admin-order-info">
                    <p><strong>{t.customer}:</strong> {order.customer?.fullName}</p>
                    <p><strong>{t.phone}:</strong> {order.customer?.phone}</p>
                    <p><strong>{t.city}:</strong> {order.customer?.city}</p>
                    <p><strong>{t.address}:</strong> {order.customer?.address}</p>
                    <p>
                      <strong>{t.email}:</strong> {order.customer?.email}
                    </p>
                    <p>
                      <strong>{t.paymentMethod}:</strong>{" "}
                      {order.paymentMethod === "cash_on_delivery"
                        ? t.cashOnDelivery
                        : order.paymentMethod || t.cashOnDelivery}
                    </p>
                    <p><strong>{t.date}:</strong> {formatDate(order.createdAt, language)}</p>
                  </div>
                  <div className="admin-order-products">
                    <strong>{t.items}:</strong>
                    {(order.items || []).map((item) => (
                      <p key={`${item.productId}-${item.variant?.key || ""}`}>
                        {localized(item.name, language)} × {item.quantity}
                        {item.variant?.name ? ` · ${localized(item.variant.name, language)}` : ""}
                      </p>
                    ))}
                  </div>
                  <div className="admin-order-financial">
                    <p>
                      {t.total}: {formatMoney(order.total)}
                    </p>
                  </div>
                  <div className="admin-order-status">
                    <label>{t.status}</label>
                    <select
                      value={order.status}
                      disabled={!canWrite("orders")}
                      onChange={(event) =>
                        changeOrderStatus(order, event.target.value)
                      }
                    >
                      {order.status === "delivered" && (
                        <option value="delivered" disabled>
                          {t.statuses.delivered}
                        </option>
                      )}
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option value={status} key={status}>
                          {t.statuses[status]}
                        </option>
                      ))}
                    </select>
                    <small className="admin-order-status-hint">
                      {t.deliveryConfirmation}
                    </small>
                    {canWrite("orders") && (
                      <button
                        type="button"
                        className="admin-danger"
                        onClick={() => handleDelete(() => deleteAdminOrder(order.id))}
                      >
                        {t.delete}
                      </button>
                    )}
                  </div>
                </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {activeTab === "products" && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <h2>{t.products}</h2>
            {canWrite("products") && (
              <button type="button" onClick={openNewProduct}>
                {t.add}
              </button>
            )}
          </div>

          <div className="admin-inventory-summary">
            <article>
              <span>{t.totalStock}</span>
              <strong>
                {stats?.totalStock ??
                  products.reduce(
                    (sum, product) => sum + (Number(product.stock) || 0),
                    0
                  )}
              </strong>
            </article>
            <article>
              <span>{t.lowStock}</span>
              <strong>
                {stats?.lowStock ??
                  products.filter(
                    (product) =>
                      Number(product.stock) <= LOW_STOCK_THRESHOLD
                  ).length}
              </strong>
            </article>
            <article>
              <span>{t.outOfStock}</span>
              <strong>
                {stats?.outOfStock ??
                  products.filter(
                    (product) => Number(product.stock) <= 0
                  ).length}
              </strong>
            </article>
          </div>

          {products.length === 0 ? (
            <div className="admin-empty">{t.noProducts}</div>
          ) : (
            <>
              <div className="admin-filter-row">
                <div className="admin-filter-buttons">
                  {[
                    ["all", t.stockFilterAll],
                    ["low", t.stockFilterLow],
                    ["out", t.stockFilterOut],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      className={
                        stockFilter === value ? "active" : "is-secondary"
                      }
                      onClick={() => setStockFilter(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="admin-section-meta">
                  {filteredProducts.length} / {products.length}
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="admin-empty">{t.empty}</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t.image}</th>
                        <th>{t.productId}</th>
                        <th>{t.nameEn}</th>
                        <th>{t.category}</th>
                        <th>{t.price}</th>
                        <th>{t.stock}</th>
                        <th>{t.status}</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const stock = Number(product.stock) || 0;
                        const stockClass =
                          stock <= 0
                            ? "is-out"
                            : stock <= LOW_STOCK_THRESHOLD
                              ? "is-low"
                              : "";

                        return (
                          <tr key={product.id}>
                            <td>
                              {product.image ? (
                                <img
                                  className="admin-thumb"
                                  src={product.image}
                                  alt=""
                                  loading="lazy"
                                />
                              ) : (
                                <span className="admin-thumb-placeholder" />
                              )}
                            </td>
                            <td>{product.id}</td>
                            <td>{localized(product.name, language)}</td>
                            <td>{product.category}</td>
                            <td>{formatMoney(product.price)}</td>
                            <td>
                              <span
                                className={`admin-stock-chip ${stockClass}`}
                              >
                                {stock} {t.units}
                              </span>
                            </td>
                            <td>
                              {product.isActive === false
                                ? t.inactive
                                : t.active}
                            </td>
                            <td className="admin-row-actions">
                              {canWrite("products") ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openProduct(product)}
                                  >
                                    {t.edit}
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-danger"
                                    onClick={() =>
                                      handleDelete(() =>
                                        deleteAdminProduct(product.id)
                                      )
                                    }
                                  >
                                    {t.delete}
                                  </button>
                                </>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {activeTab === "categories" && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <h2>{t.categories}</h2>
            {canWrite("categories") && (
              <button type="button" onClick={openNewCategory}>
                {t.add}
              </button>
            )}
          </div>
          {categories.length === 0 ? (
            <div className="admin-empty">{t.noCategories}</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t.image}</th>
                    <th>{t.slug}</th>
                    <th>{t.nameEn}</th>
                    <th>{t.order}</th>
                    <th>{t.productCount}</th>
                    <th>{t.status}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        {category.image ? (
                          <img
                            className="admin-thumb"
                            src={category.image}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <span className="admin-thumb-placeholder" />
                        )}
                      </td>
                      <td>{category.id}</td>
                      <td>{localized(category.name, language)}</td>
                      <td>{category.order}</td>
                      <td>
                        {Array.isArray(category.products)
                          ? category.products.length
                          : products.filter(
                              (product) => product.category === category.id
                            ).length}
                      </td>
                      <td>{category.isActive === false ? t.inactive : t.active}</td>
                      <td className="admin-row-actions">
                        {canWrite("categories") ? (
                          <>
                            <button type="button" onClick={() => openCategory(category)}>
                              {t.edit}
                            </button>
                            <button
                              type="button"
                              className="admin-danger"
                              onClick={() => openCategoryDelete(category)}
                            >
                              {t.delete}
                            </button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "messages" && (
        <section className="admin-section">
          <h2>{t.messages}</h2>
          {messages.length === 0 ? (
            <div className="admin-empty">{t.noMessages}</div>
          ) : (
            <div className="admin-card-grid">
              {messages.map((message) => (
                <article className="admin-data-card" key={message.id}>
                  <span>{formatDate(message.createdAt, language)}</span>
                  <h3>{message.subject}</h3>
                  <p><strong>{message.name}</strong> · {message.email}</p>
                  <p>{message.message}</p>
                  <div className="admin-inline-actions">
                    <select
                      value={message.status}
                      disabled={!canWrite("contacts")}
                      onChange={(event) => changeMessageStatus(message, event.target.value)}
                    >
                      {["new", "read", "replied", "archived"].map((status) => (
                        <option value={status} key={status}>
                          {t.statuses[status]}
                        </option>
                      ))}
                    </select>
                    {canWrite("contacts") && (
                      <button
                        type="button"
                        className="admin-danger"
                        onClick={() => handleDelete(() => deleteAdminContact(message.id))}
                      >
                        {t.delete}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "customers" && (
        <section className="admin-section">
          <h2>{t.customers}</h2>
          {customers.length === 0 ? (
            <div className="admin-empty">{t.noCustomers}</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t.customer}</th>
                    <th>{t.phone}</th>
                    <th>{t.email}</th>
                    <th>{t.city}</th>
                    <th>{t.orders}</th>
                    <th>{t.totalSpent}</th>
                    <th>{t.date}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email || "-"}</td>
                      <td>{customer.city || "-"}</td>
                      <td>{(customer.orders || []).length}</td>
                      <td>{formatMoney(orderTotalForCustomer(customer))}</td>
                      <td>{formatDate(customer.createdAt, language)}</td>
                      <td className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => openCustomerDetail(customer)}
                        >
                          {t.view}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "homepageContent" && <AdminHomepageContent />}
      {activeTab === "featuredSection" && <AdminFeaturedSection />}

      {activeTab === "discoveryPages" && <AdminDiscoveryPages />}

      {activeTab === "settings" && <AdminWhatsAppSettings />}

      {customerDetail && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-customer-modal">
            <div className="admin-modal-heading">
              <h2>{t.customerDetails}</h2>
              <button type="button" onClick={() => setCustomerDetail(null)}>
                ×
              </button>
            </div>

            <div className="admin-customer-summary">
              <p><strong>{t.customer}:</strong> {customerDetail.name || "-"}</p>
              <p><strong>{t.email}:</strong> {customerDetail.email || "-"}</p>
              <p><strong>{t.phone}:</strong> {customerDetail.phone || "-"}</p>
              <p><strong>{t.city}:</strong> {customerDetail.city || "-"}</p>
              <p>
                <strong>{t.memberSince}:</strong>{" "}
                {formatDate(customerDetail.createdAt, language)}
              </p>
            </div>

            <h3 className="admin-customer-history-title">{t.orderHistory}</h3>

            {customerDetailLoading ? (
              <div className="admin-empty">{t.loading}</div>
            ) : (customerDetail.orders || []).length === 0 ? (
              <div className="admin-empty">{t.noOrderHistory}</div>
            ) : (
              <ul className="admin-customer-orders">
                {customerDetail.orders.map((order) => (
                  <li key={order.id}>
                    <div>
                      <strong>#{order.orderNumber}</strong>
                      <span className={`admin-status-badge is-${order.status}`}>
                        {t.statuses[order.status]}
                      </span>
                    </div>
                    <span>{order.total} DH</span>
                    <span>{formatDate(order.createdAt, language)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {productForm && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-heading">
              <h2>
                {t.products} · {productForm.productId || t.add}
              </h2>
              <button type="button" onClick={() => setProductForm(null)}>
                ×
              </button>
            </div>
            <form className="admin-form admin-product-form" onSubmit={saveProduct}>
              <div className="admin-form-wide admin-product-section">
                <div className="admin-product-section-heading">
                  <strong>{t.productInfo}</strong>
                  <span>{t.productInfoHint}</span>
                </div>
                <div className="admin-product-fields">
                  {["ar", "fr", "en"].map((code) => (
                    <label key={`product-name-${code}`}>
                      {code === "ar"
                        ? t.nameAr
                        : code === "fr"
                          ? t.nameFr
                          : t.nameEn}
                      <input
                        value={productForm.name[code] || ""}
                        onChange={(event) =>
                          setProductTextField("name", code, event.target.value)
                        }
                        required={code === "ar"}
                      />
                    </label>
                  ))}
                  <label>
                    {t.category}
                    <select
                      value={productForm.category}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">-</option>
                      {productCategoryOptions.map((category) => (
                        <option value={category.slug} key={category.slug}>
                          {category.label}
                        </option>
                      ))}
                      {productForm.category &&
                      !productCategoryOptions.some(
                        (category) => category.slug === productForm.category
                      ) ? (
                        <option value={productForm.category}>
                          {productForm.category}
                        </option>
                      ) : null}
                    </select>
                  </label>
                  <label>
                    {t.productPrice}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    {t.order}
                    <input
                      type="number"
                      min="0"
                      value={productForm.sortOrder}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          sortOrder: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    {t.stock}
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          stock: event.target.value,
                        }))
                      }
                    />
                  </label>
                  {["ar", "fr", "en"].map((code) => (
                    <label
                      className="admin-form-wide"
                      key={`product-description-${code}`}
                    >
                      {code === "ar"
                        ? t.descriptionAr
                        : code === "fr"
                          ? t.descriptionFr
                          : t.descriptionEn}
                      <textarea
                        rows="3"
                        value={productForm.description[code] || ""}
                        onChange={(event) =>
                          setProductTextField(
                            "description",
                            code,
                            event.target.value
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-form-wide admin-product-section">
                <div className="admin-product-section-heading">
                  <strong>{t.mainImage}</strong>
                  <span>{t.mainImageHint}</span>
                </div>
                <div className="admin-main-image">
                  <div className="admin-main-image-preview">
                    {productForm.image ? (
                      <img src={productForm.image} alt={t.imagePreview} />
                    ) : (
                      <span>{t.emptyImageSlot}</span>
                    )}
                  </div>
                  <div className="admin-main-image-actions">
                    <button
                      type="button"
                      className="admin-image-button"
                      disabled={uploadingImage}
                      onClick={() => mainImageInputRef.current?.click()}
                    >
                      {uploadingImage ? t.uploading : t.chooseImage}
                    </button>
                    {productForm.image ? (
                      <button
                        type="button"
                        className="admin-image-remove"
                        onClick={removeMainImage}
                      >
                        {t.removeImage}
                      </button>
                    ) : null}
                    <input
                      ref={mainImageInputRef}
                      className="admin-image-input"
                      type="file"
                      accept={IMAGE_ACCEPT}
                      onChange={(event) => handleImageUpload(event, "product")}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-wide admin-product-section admin-gallery-editor">
                <div className="admin-gallery-heading">
                  <strong>
                    {t.additionalImages}{" "}
                    <span className="admin-optional">{t.optional}</span>
                  </strong>
                  <span>{t.galleryHint}</span>
                </div>
                <div className="admin-gallery-grid">
                  {normalizeGallerySlots(productForm.galleryImages).map(
                    (image, index) => (
                      <div
                        className={`admin-gallery-slot${image ? " has-image" : ""}`}
                        key={`gallery-slot-${index}`}
                      >
                        <div className="admin-gallery-slot-heading">
                          <span>
                            {t.additionalImages} {index + 1}
                          </span>
                          {image ? (
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                            >
                              {t.removeImage}
                            </button>
                          ) : null}
                        </div>
                        <div className="admin-gallery-preview">
                          {image ? (
                            <img src={image} alt={t.imagePreview} />
                          ) : (
                            <span>{t.emptyImageSlot}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="admin-gallery-upload admin-image-button"
                          disabled={uploadingImage}
                          onClick={() =>
                            galleryImageInputRefs.current[index]?.click()
                          }
                        >
                          {uploadingImage
                            ? t.uploading
                            : image
                              ? t.replaceImage
                              : t.addImage}
                        </button>
                        <input
                          ref={(node) => {
                            galleryImageInputRefs.current[index] = node;
                          }}
                          className="admin-image-input"
                          type="file"
                          accept={IMAGE_ACCEPT}
                          onChange={(event) =>
                            handleImageUpload(event, "gallery", index)
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="admin-modal-actions admin-form-wide">
                <button type="button" onClick={() => setProductForm(null)}>
                  {t.cancel}
                </button>
                <button type="submit" disabled={saving || uploadingImage}>
                  {saving ? t.loading : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryForm && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-heading">
              <h2>
                {t.categories} · {categoryForm.slug || t.add}
              </h2>
              <button type="button" onClick={() => setCategoryForm(null)}>
                ×
              </button>
            </div>
            <form className="admin-form" onSubmit={saveCategory}>
              <label>
                {t.slug}
                <input
                  value={categoryForm.slug}
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  disabled={!categoryForm.isNew}
                  required
                />
              </label>
              <label>
                {t.order}
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, order: event.target.value }))
                  }
                />
              </label>
              <label className="admin-form-wide">
                {t.image}
                <input
                  value={categoryForm.image}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      image: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="admin-form-wide admin-upload">
                <label className="admin-upload-button">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    disabled={uploadingImage}
                    onChange={(event) => handleImageUpload(event, "category")}
                  />
                  <span>{uploadingImage ? t.uploading : t.uploadImage}</span>
                </label>
                {categoryForm.image ? (
                  <div className="admin-upload-preview">
                    <img src={categoryForm.image} alt={t.imagePreview} />
                  </div>
                ) : null}
              </div>
              {["ar", "fr", "en"].map((code) => (
                <label key={`category-name-${code}`}>
                  {code === "ar" ? t.nameAr : code === "fr" ? t.nameFr : t.nameEn}
                  <input
                    value={categoryForm.name[code]}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        name: { ...current.name, [code]: event.target.value },
                      }))
                    }
                    required={code === "ar"}
                  />
                </label>
              ))}
              {["ar", "fr", "en"].map((code) => (
                <label key={`category-description-${code}`} className="admin-form-wide">
                  {code === "ar" ? t.descriptionAr : code === "fr" ? t.descriptionFr : t.descriptionEn}
                  <textarea
                    rows="3"
                    value={categoryForm.description[code]}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        description: { ...current.description, [code]: event.target.value },
                      }))
                    }
                  />
                </label>
              ))}
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                {t.active}
              </label>
              <div className="admin-modal-actions admin-form-wide">
                <button type="button" onClick={() => setCategoryForm(null)}>
                  {t.cancel}
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? t.loading : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryDelete && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-delete-modal">
            <div className="admin-modal-heading">
              <h2>
                {t.delete} · {localized(categoryDelete.category.name, language)}
              </h2>
              <button
                type="button"
                onClick={() => setCategoryDelete(null)}
              >
                ×
              </button>
            </div>
            <p>{t.collectionHasProducts}</p>
            <p className="admin-delete-count">
              {t.productCount}:{" "}
              {Array.isArray(categoryDelete.category.products)
                ? categoryDelete.category.products.length
                : products.filter(
                    (product) =>
                      product.category === categoryDelete.category.id
                  ).length}
            </p>
            <label className="admin-form-wide">
              {t.moveProductsTo}
              <select
                value={categoryDelete.reassignTo}
                onChange={(event) =>
                  setCategoryDelete((current) => ({
                    ...current,
                    reassignTo: event.target.value,
                  }))
                }
              >
                <option value="">-</option>
                {categories
                  .filter(
                    (category) => category.id !== categoryDelete.category.id
                  )
                  .map((category) => (
                    <option value={category.id} key={category.id}>
                      {localized(category.name, language)}
                    </option>
                  ))}
              </select>
            </label>
            <div className="admin-modal-actions">
              <button type="button" onClick={() => setCategoryDelete(null)}>
                {t.cancel}
              </button>
              <button
                type="button"
                className="admin-danger"
                onClick={confirmCategoryDelete}
                disabled={saving}
              >
                {saving ? t.loading : t.reassignAndDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
