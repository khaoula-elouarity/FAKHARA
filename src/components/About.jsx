import React from "react";
import { useLanguage } from "../context/Languagecontext.jsx";
import "./About.css";

const content = {
  ar: {
    eyebrow: "حكاية فخار",
    title: "تراث مغربي يُصنع بحب",
    intro: "من الأرض المغربية، ومن بين أيدي الحرفيين، تولد قطع فخارية تحمل روح الأصالة وجمال التفاصيل.",
    storyTitle: "أكثر من مجرد فخار",
    story: "في فخارة، نؤمن أن كل قطعة فخارية تحكي قصة. قصة أرض غنية بالتقاليد، وأيادٍ ماهرة تحافظ على فن توارثته الأجيال. اخترنا أن نجمع بين جمال الصناعة التقليدية واللمسة العصرية، لنقدم لكم قطعاً تضيف الدفء والأناقة إلى بيوتكم.",
    valuesTitle: "ما الذي يميزنا؟",
    values: [
      ["الأصالة المغربية", "نستلهم تصاميمنا من التراث المغربي العريق."],
      ["عناية بالتفاصيل", "نهتم بجمال كل قطعة وجودة تقديمها."],
      ["لمسة فنية", "قطع تجمع بين الحرفة التقليدية والذوق العصري."]
    ],
    ending: "كل قطعة لها حكاية، دعها تصبح جزءاً من حكايتك."
  },
  fr: {
    eyebrow: "L'histoire de Fakhara",
    title: "Un héritage marocain créé avec amour",
    intro: "De la terre marocaine et des mains de nos artisans naissent des pièces en poterie pleines d'authenticité.",
    storyTitle: "Bien plus que de la poterie",
    story: "Chez FAKHARA, chaque pièce raconte une histoire : celle d'un patrimoine riche, d'un savoir-faire transmis de génération en génération et d'un amour pour les beaux détails. Nous réunissons artisanat traditionnel et élégance contemporaine.",
    valuesTitle: "Ce qui nous distingue",
    values: [
      ["Authenticité marocaine", "Des inspirations issues du patrimoine marocain."],
      ["Le souci du détail", "Une attention particulière à chaque création."],
      ["Une touche artistique", "L'alliance de l'artisanat et du style contemporain."]
    ],
    ending: "Chaque pièce a son histoire. Faites-en partie."
  },
  en: {
    eyebrow: "The Fakhara Story",
    title: "Moroccan heritage, made with love",
    intro: "From Moroccan earth and the hands of skilled artisans come pottery pieces filled with authenticity and beauty.",
    storyTitle: "More than just pottery",
    story: "At FAKHARA, we believe every pottery piece tells a story: a story of rich traditions, skilled hands and a craft passed down through generations. We bring together traditional craftsmanship and contemporary elegance to create pieces that add warmth and character to your home.",
    valuesTitle: "What makes us special",
    values: [
      ["Moroccan authenticity", "Inspired by Morocco's rich cultural heritage."],
      ["Attention to detail", "We care about the beauty of every creation."],
      ["Artistic touch", "Traditional craftsmanship meets modern taste."]
    ],
    ending: "Every piece has a story. Let it become part of yours."
  }
};

export default function About() {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="about-eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
        <div className="about-ornament">✦</div>
      </section>

      <section className="about-story">
        <div className="about-story-decoration">FAKHARA</div>
        <div className="about-story-content">
          <span className="about-eyebrow">FAKHARA</span>
          <h2>{t.storyTitle}</h2>
          <p>{t.story}</p>
        </div>
        <div className="about-empty-art">
          <img
            src="/image/homee/tarath-pottery.jpeg"
            alt="Moroccan Craftsmanship"
            className="about-empty-art-image"
          />
          <span>✧</span>
          <small>Moroccan Craftsmanship</small>
        </div>
      </section>

      <section className="about-values">
        <span className="about-eyebrow">FAKHARA</span>
        <h2>{t.valuesTitle}</h2>
        <div className="about-values-grid">
          {t.values.map((value, index) => (
            <article className="about-value-card" key={index}>
              <span className="about-value-number">0{index + 1}</span>
              <h3>{value[0]}</h3>
              <p>{value[1]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-ending">
        <span>✦</span>
        <p>{t.ending}</p>
      </section>
    </main>
  );
}