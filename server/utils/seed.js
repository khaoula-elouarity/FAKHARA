import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import env from "../config/env.js";
import staticProducts from "../../src/data/products.js";
import { toVariantKey } from "./slug.js";

export const categorySeed = [
  {
    slug: "tagines",
    name: {
      ar: "الطواجن",
      fr: "Les tajines",
      en: "Tagines",
    },
    description: {
      ar: "طواجن فخارية بطابع مغربي أصيل، تجمع بين عراقة الحرفة وذوق المائدة المغربية.",
      fr: "Des tajines en poterie au caractère marocain authentique, alliant savoir-faire traditionnel et art de la table.",
      en: "Moroccan pottery tagines with authentic character, blending traditional craftsmanship with table artistry.",
    },
    image: "/image/collections/Tajines.png",
    order: 1,
  },
  {
    slug: "plates-bowls",
    name: {
      ar: "الصحون والزلايف",
      fr: "Assiettes et Zlayef",
      en: "Plates & Zlayef",
    },
    description: {
      ar: "صحون وزلايف فخارية بألوان متناسقة وتفاصيل أصيلة تليق بمائدتك.",
      fr: "Des assiettes et Zlayef en poterie aux couleurs harmonieuses et aux détails authentiques.",
      en: "Pottery plates and Zlayef in harmonious colors with authentic details for your table.",
    },
    image: "/image/collections/zlayef-tbasel.jpeg",
    order: 2,
  },
  {
    slug: "cups",
    name: {
      ar: "الأكواب",
      fr: "Les tasses",
      en: "Cups",
    },
    description: {
      ar: "أكواب فخارية تضيف دفئاً وجمالاً إلى لحظاتك اليومية، بلمسة حرفية مميزة.",
      fr: "Des tasses en poterie qui apportent chaleur et beauté à vos moments quotidiens.",
      en: "Pottery cups that bring warmth and beauty to your everyday moments.",
    },
    image: "/image/collections/akwab.png",
    order: 3,
  },
  {
    slug: "decor",
    name: {
      ar: "الديكور والمزهريات",
      fr: "Décoration et vases",
      en: "Decor & Vases",
    },
    description: {
      ar: "قطع فنية ومزهريات فخارية تزيّن أركان منزلك وتضفي عليه طابعاً مغربياً دافئاً.",
      fr: "Des pièces artistiques et des vases en poterie pour sublimer votre intérieur d'une touche marocaine.",
      en: "Artistic pottery pieces and vases that bring a warm Moroccan touch to your interiors.",
    },
    image: "/image/collections/decor.png",
    order: 4,
  },
  {
    slug: "pottery-touches",
    name: {
      ar: "لمسات فخارية",
      fr: "Touches en poterie",
      en: "Pottery Touches",
    },
    description: {
      ar: "إبداعات فخارية صغيرة تضيف تفاصيل استثنائية ولمسة فنية إلى يومك.",
      fr: "De petites créations en poterie qui ajoutent une touche artistique et unique à votre quotidien.",
      en: "Small pottery creations that add an exceptional artistic detail to your day.",
    },
    image: "/image/collections/lamasat-fakhariya.jpeg",
    order: 5,
  },
];

function buildVariants(product) {
  const seen = new Set();

  return (product.images || []).map((variant, index) => {
    let key = toVariantKey(variant.image, index);

    while (seen.has(key)) {
      key = `${key}-${index + 1}`;
    }

    seen.add(key);

    return {
      key,
      name: variant.name || {},
      image: variant.image || "",
      color: variant.name?.en || "",
      price: null,
      stock: 50,
    };
  });
}

/**
 * Imports the real FAKHARA categories and products from src/data/products.js.
 *
 * The operation is idempotent: every record is matched on its stable slug or
 * productId. Existing documents are updated only for the fields that are
 * derived from the static catalog (the category reference), while catalog
 * edits made by an administrator are preserved.
 */
export async function seedDatabase() {
  const categoryDocuments = new Map();

  for (const category of categorySeed) {
    // Only create missing categories. Existing categories belong to the
    // administrator: descriptions, images or ordering edits must survive a
    // server restart instead of being overwritten by the static seed.
    const saved =
      (await Category.findOne({ slug: category.slug })) ||
      (await Category.create(category));

    categoryDocuments.set(category.slug, saved);
  }

  const productDocuments = [];

  for (const [index, product] of staticProducts.entries()) {
    const category = categoryDocuments.get(product.category);

    if (!category) {
      console.warn(
        `Skipped product "${product.id}": unknown category "${product.category}".`
      );
      continue;
    }

    const existing = await Product.findOne({ productId: product.id });

    if (existing) {
      // Only the reference is refreshed so admin edits survive a restart.
      await Product.updateOne(
        { productId: product.id },
        { $set: { categoryRef: category._id } }
      );

      productDocuments.push(existing);
      continue;
    }

    const created = await Product.create({
      productId: product.id,
      name: product.name,
      cardTitle: product.cardTitle || {},
      category: product.category,
      categoryRef: category._id,
      price: product.price,
      image: product.image || "",
      images: buildVariants(product),
      description: product.description || {},
      stock: 50,
      isActive: true,
      featured: index < 3,
      sortOrder: index,
    });

    productDocuments.push(created);
  }

  // Keep Category.products in sync with the products it contains.
  for (const slug of categoryDocuments.keys()) {
    const productIds = productDocuments
      .filter((product) => product.category === slug)
      .map((product) => product._id);

    await Category.updateOne(
      { slug },
      { $set: { products: productIds } }
    );
  }

  console.log(
    `Catalog ready: ${categoryDocuments.size} categories, ${productDocuments.length} products.`
  );

  await seedAdminAccount();
}

async function seedAdminAccount() {
  if (!env.adminEmail || !env.adminPassword) {
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      console.warn(
        "No administrator exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then restart the server or run npm run seed:admin."
      );
    }

    return;
  }

  const adminCount = await Admin.countDocuments();

  if (adminCount === 0) {
    if (env.adminPassword.length < 12) {
      console.warn(
        "ADMIN_PASSWORD must contain at least 12 characters. The first administrator was not created."
      );
      return;
    }

    const admin = new Admin({
      name: env.adminName,
      email: env.adminEmail,
      role: "superadmin",
    });

    await admin.setPassword(env.adminPassword);
    await admin.save();
    console.log(`Created administrator account: ${admin.email}`);
  }
}
