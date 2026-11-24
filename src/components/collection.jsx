import React from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../context/Languagecontext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import "./collection.css";
import ProductRating from "./ProductRating.jsx";
import WishlistButton from "./wishlistbutton.jsx";

const collectionInfo = {
  tagines: {
    ar: { title: "الطواجن", subtitle: "فن الطهي بلمسة مغربية أصيلة" },
    fr: { title: "Les tajines", subtitle: "L'art de cuisiner à la marocaine" },
    en: { title: "Tagines", subtitle: "The art of authentic Moroccan cooking" },
  },
  "plates-bowls": {
    ar: {
      title: "الصحون و الزلايف",
      subtitle:
        "تشكيلة من الصحون والزلايف الفخارية المغربية، تجمع بين أصالة الصناعة التقليدية وجمال الألوان المتناسقة، لتضفي لمسة من الأناقة والدفء على مائدتك.",
    },
    fr: {
      title: "Assiettes et Zlayef",
      subtitle:
        "Une collection d'assiettes et de Zlayef en poterie marocaine, alliant l'authenticité de l'artisanat traditionnel à l'harmonie des couleurs, pour apporter une touche d'élégance et de chaleur à votre table.",
    },
    en: {
      title: "Plates and Zlayef",
      subtitle:
        "A collection of Moroccan pottery plates and Zlayef, combining the authenticity of traditional craftsmanship with harmonious colors, bringing a touch of elegance and warmth to your table.",
    },
  },
  cups: {
    ar: { title: "الأكواب", subtitle: "لحظاتك اليومية بطابع فخاري" },
    fr: { title: "Les tasses", subtitle: "Vos moments quotidiens en poterie" },
    en: { title: "Cups", subtitle: "Everyday moments with a pottery touch" },
  },
  decor: {
    ar: { title: "الديكور والمزهريات", subtitle: "قطع فنية تضيف الدفء إلى منزلك" },
    fr: { title: "Décoration et vases", subtitle: "Des pièces artistiques pour votre maison" },
    en: { title: "Decor & Vases", subtitle: "Artistic pieces that bring warmth to your home" },
  },
  "pottery-touches": {
    ar: { title: "لمسات فخارية", subtitle: "إبداعات صغيرة بتفاصيل استثنائية" },
    fr: { title: "Touches en poterie", subtitle: "De petites créations aux détails uniques" },
    en: { title: "Pottery Touches", subtitle: "Small creations with exceptional details" },
  },
};

function EmptyProductImage() {
  return (
    <div className="collection-product-image">
      <span className="image-decoration">F</span>
      <span className="image-note">PRODUCT IMAGE</span>
    </div>
  );
}

function localized(value, language) {
  return value?.[language] || value?.en || value?.fr || value?.ar || "";
}

export default function Collection() {
  const { category } = useParams();
  const { language } = useLanguage();
  const { products, categories, loading } = useStore();

  const storedCategory = categories.find((item) => item.id === category);
  const categoryProducts = products.filter(
    (product) => product.category === category
  );

  if (!storedCategory) {
    if (loading) {
      return (
        <main className="collection-empty">
          <h1>FAKHARA</h1>
        </main>
      );
    }

    return (
      <main className="collection-empty">
        <h1>Collection not found</h1>
        <Link to="/">Back to home</Link>
      </main>
    );
  }

  const fallbackInfo = collectionInfo[category]?.[language] || collectionInfo[category]?.en;
  const content = {
    title:
      localized(storedCategory.name, language) ||
      fallbackInfo?.title ||
      category,
    subtitle:
      localized(storedCategory.description, language) ||
      fallbackInfo?.subtitle ||
      "",
  };

  const labels = {
    ar: {
      home: "الرئيسية",
      collections: "مجموعاتنا",
      products: "منتجات المجموعة",
      empty: "ستتم إضافة المنتجات قريباً",
      details: "اكتشف المنتج",
      currency: "درهم",
    },
    fr: {
      home: "Accueil",
      collections: "Collections",
      products: "Produits de la collection",
      empty: "Les produits seront bientôt disponibles",
      details: "Découvrir",
      currency: "DH",
    },
    en: {
      home: "Home",
      collections: "Collections",
      products: "Collection products",
      empty: "Products will be added soon",
      details: "Discover",
      currency: "MAD",
    },
  };

  const t = labels[language] || labels.en;

  return (
    <main className="collection-page">
      <section className="collection-banner">
        <div className="collection-banner-pattern"></div>

        <div className="collection-banner-content">
          <div className="collection-breadcrumb">
            <Link to="/">{t.home}</Link>
            <span>/</span>
            <span>{t.collections}</span>
          </div>

          <span className="collection-eyebrow">FAKHARA COLLECTION</span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
          <div className="collection-gold-line"></div>
        </div>
      </section>

      <section className="collection-showcase">
        <section className="collection-products-section">
          <div className="collection-heading">
          <span className="collection-small-title">FAKHARA</span>
          <h2>{t.products}</h2>
          <span className="collection-count">
            {categoryProducts.length} {language === "ar" ? "منتجات" : "products"}
          </span>
        </div>

        {loading && categoryProducts.length === 0 ? (
          <div className="collection-no-products">
            <div className="empty-pottery-symbol">F</div>
            <p>FAKHARA</p>
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="collection-no-products">
            <div className="empty-pottery-symbol">F</div>
            <p>{t.empty}</p>
          </div>
        ) : (
          <div className="collection-product-grid">
            {categoryProducts.map((product) => (
              <article className="collection-product-card" key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  className="collection-product-link"
                >
                  <div className="collection-image-wrap">
                    <WishlistButton productId={product.id} />
                    {product.image ? (
                      <img src={product.image} alt={product.name[language] || product.name.en} />
                    ) : (
                      <EmptyProductImage />
                    )}
                    <span className="collection-view-icon">↗</span>
                  </div>

                  <div className="collection-product-info">
                    <h3>
                      {product.cardTitle?.[language] ||
                        product.cardTitle?.en ||
                        product.name[language] ||
                        product.name.en}
                    </h3>
                    <p>{product.description[language] || product.description.en}</p>
                    <div className="collection-product-rating">
                      <ProductRating
                        productId={product.id}
                        variant="compact"
                      />
                    </div>
                    <div className="collection-product-bottom">
                      <strong>{product.price} {t.currency}</strong>
                      <span>{t.details} ↗</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
        </section>
      </section>
    </main>
  );
}