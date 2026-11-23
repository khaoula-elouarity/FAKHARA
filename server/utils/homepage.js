import ApiError from "./ApiError.js";
import { readString } from "./validation.js";

export const DEFAULT_HOMEPAGE = {
  ar: {
    heroLabel: "فن الفخار المغربي الأصيل",
    heroTitle: "حكاية من طين،",
    heroTitleAccent: "وفن يسكن التفاصيل",
    heroDescription:
      "اكتشفي قطعاً فخارية تجمع بين أصالة الحرفة المغربية وجمال التصميم، صُنعت لتضيف لمسة دافئة ومميزة إلى منزلك.",
    explore: "اكتشفي مجموعتنا",
    discover: "اكتشفي عالم فخارة",
    scroll: "اكتشفي المزيد",
    promise: [
      ["01", "صناعة مغربية", "اعتزاز بالحرفة والتراث"],
      ["02", "لمسة فنية", "تفاصيل تحمل روح الإبداع"],
      ["03", "أناقة أصيلة", "جمال يليق بكل منزل"],
    ],
    categoriesLabel: "اكتشفي اختياراتنا",
    categoriesTitle: "عالم من الإبداع الفخاري",
    categoriesDescription:
      "تصفحي مجموعاتنا واكتشفي قطعاً تجمع بين الجمال والاستعمال اليومي.",
    viewAll: "اكتشفي جميع المجموعات",
    featuredLabel: "اختيارات فخارة",
    featuredTitle: "قطع تستحق الاكتشاف",
    featuredDescription:
      "مجموعة مختارة من إبداعاتنا الفخارية، حيث يلتقي تراث الصناعة اليدوية بجمال التفاصيل اليومية.",
    productButton: "اكتشفي المنتج",
    storyLabel: "حكاية فخارة",
    storyTitle: "من روح التراث، إلى جمال تفاصيل منزلك",
    storyDescription:
      "في فخارة، نحتفي بجمال الفخار المغربي وبالحرفية التي تنتقل عبر الأجيال. نؤمن أن كل قطعة تحمل حكاية، وأن التفاصيل البسيطة قادرة على صنع فرق كبير.",
    storyButton: "اكتشفي قصتنا",
    trackLabel: "طلبك في طريقك",
    trackTitle: "تتبع طلبي",
    trackDescription:
      "أدخلي رقم الطلب ورقم الهاتف لمعرفة مرحلة طلبك وآخر حالة توصيل في الوقت الفعلي.",
    trackButton: "تتبع الطلب الآن",
    visitLabel: "يسعدنا لقاؤكم",
    visitTitle: "زوروا متجرنا",
    visitDescription:
      "اكتشفوا عالم فخارة عن قرب، واستمتعوا بمشاهدة مجموعاتنا الفخارية.",
    address: "عنوان المتجر سيضاف هنا",
    map: "مساحة مخصصة لخريطة المتجر",
    mapTitle: "خريطة متجر فخارة",
    mapLabel: "خريطة المتجر",
    mapNote: "سيتم عرض الموقع الدقيق للمتجر هنا بمجرد إضافته.",
    zoomLabel: "تكبير الخريطة وتصغيرها",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    directions: "الحصول على الاتجاهات",
    visitButton: "معلومات التواصل",
  },
  fr: {
    heroLabel: "L'art authentique de la poterie marocaine",
    heroTitle: "Une histoire d'argile,",
    heroTitleAccent: "un art dans chaque détail",
    heroDescription:
      "Découvrez des pièces en poterie qui réunissent l'authenticité de l'artisanat marocain et la beauté du design.",
    explore: "Découvrir nos collections",
    discover: "Découvrir l'univers Fakhara",
    scroll: "Explorer davantage",
    promise: [
      ["01", "Artisanat marocain", "Un héritage précieux"],
      ["02", "Touche artistique", "Des détails créatifs"],
      ["03", "Élégance authentique", "La beauté au quotidien"],
    ],
    categoriesLabel: "Explorez nos choix",
    categoriesTitle: "Un univers de créativité",
    categoriesDescription:
      "Découvrez nos collections et des pièces pensées pour embellir votre quotidien.",
    viewAll: "Voir toutes les collections",
    featuredLabel: "La sélection Fakhara",
    featuredTitle: "Des pièces à découvrir",
    featuredDescription:
      "Une sélection de créations en poterie, où le savoir-faire traditionnel rencontre la beauté des détails du quotidien.",
    productButton: "Découvrir le produit",
    storyLabel: "L'histoire de Fakhara",
    storyTitle: "L'esprit du patrimoine, la beauté de votre intérieur",
    storyDescription:
      "Chez Fakhara, nous célébrons la beauté de la poterie marocaine et le savoir-faire transmis de génération en génération. Chaque pièce raconte une histoire.",
    storyButton: "Découvrir notre histoire",
    trackLabel: "Votre commande en route",
    trackTitle: "Suivre ma commande",
    trackDescription:
      "Saisissez le numéro de commande et le téléphone utilisé pour connaître l'étape actuelle et les mises à jour de livraison en direct.",
    trackButton: "Suivre ma commande",
    visitLabel: "Nous serions ravis de vous accueillir",
    visitTitle: "Visitez notre boutique",
    visitDescription:
      "Découvrez l'univers Fakhara et nos collections de poterie de plus près.",
    address: "L'adresse de la boutique sera ajoutée ici",
    map: "Espace réservé à la carte de la boutique",
    mapTitle: "Carte de la boutique Fakhara",
    mapLabel: "Carte de la boutique",
    mapNote:
      "L'emplacement exact de la boutique sera affiché ici dès qu'il sera disponible.",
    zoomLabel: "Zoom de la carte",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    directions: "Itinéraire",
    visitButton: "Nos coordonnées",
  },
  en: {
    heroLabel: "The art of authentic Moroccan pottery",
    heroTitle: "A story shaped in clay,",
    heroTitleAccent: "art in every detail",
    heroDescription:
      "Discover pottery pieces that bring together the heritage of Moroccan craftsmanship and the beauty of thoughtful design.",
    explore: "Explore our collections",
    discover: "Discover the world of Fakhara",
    scroll: "Discover more",
    promise: [
      ["01", "Moroccan craft", "A heritage to celebrate"],
      ["02", "Artistic touch", "Creative details"],
      ["03", "Timeless elegance", "Beauty for every home"],
    ],
    categoriesLabel: "Explore our selection",
    categoriesTitle: "A world of pottery artistry",
    categoriesDescription:
      "Explore our collections and discover pieces made to enrich everyday moments.",
    viewAll: "Explore all collections",
    featuredLabel: "The Fakhara selection",
    featuredTitle: "Pieces worth discovering",
    featuredDescription:
      "A selection of our pottery creations, where traditional craftsmanship meets the beauty of everyday details.",
    productButton: "Discover product",
    storyLabel: "The Fakhara story",
    storyTitle: "The spirit of heritage, the beauty of your home",
    storyDescription:
      "At Fakhara, we celebrate the beauty of Moroccan pottery and craftsmanship passed down through generations. We believe every piece carries a story.",
    storyButton: "Discover our story",
    trackLabel: "Your order on its way",
    trackTitle: "Track My Order",
    trackDescription:
      "Enter your order number and the phone number used at checkout to see the current stage and live delivery updates.",
    trackButton: "Track my order",
    visitLabel: "We would love to welcome you",
    visitTitle: "Visit our store",
    visitDescription:
      "Discover the world of Fakhara and explore our pottery collections in person.",
    address: "The store address will be added here",
    map: "Reserved space for the store map",
    mapTitle: "FAKHARA store map",
    mapLabel: "Store map",
    mapNote:
      "The exact store location will be displayed here once it is available.",
    zoomLabel: "Map zoom controls",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    directions: "Get Directions",
    visitButton: "Contact information",
  },
};

const TEXT_FIELDS = Object.keys(DEFAULT_HOMEPAGE.en).filter(
  (field) => field !== "promise"
);

function normalizeLanguage(value, field) {
  const source = value && typeof value === "object" ? value : {};
  const result = {};

  for (const key of TEXT_FIELDS) {
    result[key] = readString(source[key], `${field}.${key}`, {
      required: false,
      max: 20000,
    });
  }

  result.promise = (
    Array.isArray(source.promise) ? source.promise : []
  )
    .slice(0, 6)
    .map((item, index) => {
      const entry = Array.isArray(item)
        ? { number: item[0], title: item[1], description: item[2] }
        : item || {};

      return {
        number: readString(entry.number, `${field}.promise.${index}.number`, {
          required: false,
          max: 40,
        }),
        title: readString(entry.title, `${field}.promise.${index}.title`, {
          required: false,
          max: 500,
        }),
        description: readString(
          entry.description,
          `${field}.promise.${index}.description`,
          { required: false, max: 2000 }
        ),
      };
    });

  return result;
}

export function normalizeHomepage(body) {
  const source = body?.homepage ?? body;

  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw ApiError.badRequest("invalid_homepage", {
      field: "homepage",
      message: "homepage must be an object.",
    });
  }

  return {
    ar: normalizeLanguage(source.ar, "homepage.ar"),
    fr: normalizeLanguage(source.fr, "homepage.fr"),
    en: normalizeLanguage(source.en, "homepage.en"),
  };
}

function serializePromise(items, fallback) {
  const source = Array.isArray(items) && items.length ? items : fallback;

  return source.map((item) =>
    Array.isArray(item)
      ? { number: item[0] || "", title: item[1] || "", description: item[2] || "" }
      : {
          number: item?.number || "",
          title: item?.title || "",
          description: item?.description || "",
        }
  );
}

export function serializeHomepage(value) {
  const source = value && typeof value === "object" ? value : {};
  const ar = { ...DEFAULT_HOMEPAGE.ar, ...(source.ar || {}) };
  const fr = { ...DEFAULT_HOMEPAGE.fr, ...(source.fr || {}) };
  const en = { ...DEFAULT_HOMEPAGE.en, ...(source.en || {}) };

  ar.promise = serializePromise(source.ar?.promise, DEFAULT_HOMEPAGE.ar.promise);
  fr.promise = serializePromise(source.fr?.promise, DEFAULT_HOMEPAGE.fr.promise);
  en.promise = serializePromise(source.en?.promise, DEFAULT_HOMEPAGE.en.promise);

  return { ar, fr, en };
}
