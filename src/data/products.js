const products = [
  {
    id: "tagine-1",
    name: {
      ar: "طاجين مغربي",
      fr: "Tajine marocain",
      en: "Moroccan Tagine",
    },
    cardTitle: {
      ar: "الطواجن المغربية",
      fr: "Tajines marocains",
      en: "Moroccan Tagines",
    },
    category: "tagines",
    price: 100,
    image: "/image/tajin/tajin-brown.jpeg",
    images: [
      {
        image: "/image/tajin/tajin-brown.jpeg",
        name: { ar: "بني", fr: "Marron", en: "Brown" },
      },
      {
        image: "/image/tajin/tajin-purbel.jpeg",
        name: { ar: "بنفسجي", fr: "Violet", en: "Purple" },
      },
      {
        image: "/image/tajin/tajin-yellow.jpeg",
        name: { ar: "أصفر", fr: "Jaune", en: "Yellow" },
      },
      {
        image: "/image/tajin/tajine-blue.jpeg",
        name: { ar: "أزرق", fr: "Bleu", en: "Blue" },
      },
    ],
    description: {
      ar: "طاجين فخاري مغربي أصيل بلمسة تقليدية، متوفر بأربعة ألوان متناسقة.",
      fr: "Un tajine en poterie marocaine authentique au style traditionnel, disponible en quatre couleurs harmonieuses.",
      en: "An authentic Moroccan pottery tagine with a traditional touch, available in four harmonious colors.",
    },
  },
  {
    id: "zlayef-blue",
    name: {
      ar: "زلايف مغربية",
      fr: "Zlayef marocaines",
      en: "Moroccan Zlayef",
    },
    category: "plates-bowls",
    price: 250,
    image: "/image/zlayef/Zlayef-blue.jpeg",
    images: [
      {
        image: "/image/zlayef/Zlayef-blue.jpeg",
        name: { ar: "أزرق", fr: "Bleu", en: "Blue" },
      },
      {
        image: "/image/zlayef/Zlayef-green.jpeg",
        name: { ar: "أخضر", fr: "Vert", en: "Green" },
      },
      {
        image: "/image/zlayef/Zlayef-purbel.jpeg",
        name: { ar: "بنفسجي", fr: "Violet", en: "Purple" },
      },
      {
        image: "/image/zlayef/Zlayef-red.jpeg",
        name: { ar: "أحمر", fr: "Rouge", en: "Red" },
      },
    ],
    description: {
      ar: "زلايف فخارية مغربية أصيلة، تجمع بين جمال الصناعة التقليدية وتناسق الألوان.",
      fr: "Zlayef en poterie marocaine authentique, alliant la beauté de l'artisanat traditionnel à l'harmonie des couleurs.",
      en: "Authentic Moroccan pottery Zlayef, combining the beauty of traditional craftsmanship with harmonious colors.",
    },
  },
  {
    id: "sahn-set",
    name: {
      ar: "طقم صحون فخارية",
      fr: "Set d'assiettes en poterie",
      en: "Pottery Plate Set",
    },
    cardTitle: {
      ar: "الصحون الفخارية",
      fr: "Assiettes en poterie",
      en: "Pottery Plates",
    },
    category: "plates-bowls",
    price: 220,
    image: "/image/tbasel/sahn-blue.jpeg",
    images: [
      {
        image: "/image/tbasel/sahn-blue.jpeg",
        name: { ar: "أزرق", fr: "Bleu", en: "Blue" },
      },
      {
        image: "/image/tbasel/sahn-green.jpeg",
        name: { ar: "أخضر", fr: "Vert", en: "Green" },
      },
      {
        image: "/image/tbasel/sahn-pink.jpeg",
        name: { ar: "وردي", fr: "Rose", en: "Pink" },
      },
      {
        image: "/image/tbasel/sahn-yellow.jpeg",
        name: { ar: "أصفر", fr: "Jaune", en: "Yellow" },
      },
    ],
    description: {
      ar: "طقم صحون فخارية مغربية من 5 قطع، بلمسة تقليدية أنيقة، متوفر بأربعة ألوان متناسقة.",
      fr: "Set de 5 assiettes en poterie marocaine, au style traditionnel élégant, disponible en quatre couleurs harmonieuses.",
      en: "A 5-piece Moroccan pottery plate set with an elegant traditional touch, available in four harmonious colors.",
    },
  },
  {
    id: "cups-1",
    name: {
      ar: "أكواب فخارية",
      fr: "Tasses en poterie",
      en: "Pottery Cups",
    },
    category: "cups",
    price: 90,
    image: "",
    description: {
      ar: "أكواب فخارية بتصميم أصيل.",
      fr: "Des tasses au design authentique.",
      en: "Pottery cups with an authentic design.",
    },
  },
  {
    id: "decor-1",
    name: {
      ar: "مزهريات مغربية",
      fr: "Vases marocaines",
      en: "Moroccan Vases",
    },
    category: "decor",
    price: 95,
    image: "/image/vaz-pink.jpeg",
    images: [
      {
        image: "/image/vaz-pink.jpeg",
        name: { ar: "وردي", fr: "Rose", en: "Pink" },
      },
      {
        image: "/image/vaz-purbel.jpeg",
        name: { ar: "بنفسجي", fr: "Violet", en: "Purple" },
      },
      {
        image: "/image/vaz-brown.jpeg",
        name: { ar: "بني", fr: "Marron", en: "Brown" },
      },
      {
        image: "/image/vaz-green.jpeg",
        name: { ar: "أخضر", fr: "Vert", en: "Green" },
      },
    ],
    description: {
      ar: "مزهريات فخارية مغربية أصيلة، تضفي لمسة فنية دافئة على منزلك.",
      fr: "Vases en poterie marocaine authentique, apportant une touche artistique et chaleureuse à votre maison.",
      en: "Authentic Moroccan pottery vases, bringing a warm artistic touch to your home.",
    },
  },
  {
    id: "touches-1",
    name: {
      ar: "حامل شموع فخاري",
      fr: "Bougeoir en poterie",
      en: "Pottery Candle Holder",
    },
    category: "pottery-touches",
    price: 120,
    image: "",
    description: {
      ar: "قطعة فخارية فنية بلمسة مميزة.",
      fr: "Une création artistique en poterie.",
      en: "An artistic pottery creation.",
    },
  },
];

export default products;