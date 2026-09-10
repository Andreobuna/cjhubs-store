import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Gift Ideas", slug: "gift-ideas", description: "Curated gifts for birthdays, anniversaries, and every special moment." },
  { name: "Products & Accessories", slug: "products-accessories", description: "Everyday essentials and accessories built for quality and style." },
];

const BRANDS = ["CJ Signature", "Everly", "Northline", "Aurum & Co.", "Basecamp"];

function specs(pairs: [string, string][]) {
  return pairs.map(([label, value], position) => ({ label, value, position }));
}

async function main() {
  console.log("Seeding CJ Hubs database…");

  // --- Admin + demo customer ---
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  await prisma.user.upsert({
    where: { email: "admin@cjhubs.com" },
    update: { passwordHash: adminPasswordHash, role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "CJ Hubs Admin",
      email: "admin@cjhubs.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const customerPasswordHash = await bcrypt.hash("Customer@12345", 12);
  await prisma.user.upsert({
    where: { email: "demo@cjhubs.com" },
    update: { passwordHash: customerPasswordHash, role: "CUSTOMER", status: "ACTIVE" },
    create: {
      name: "Demo Customer",
      email: "demo@cjhubs.com",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  // --- Categories ---
  const categoryMap: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryMap[c.slug] = cat.id;
  }

  // --- Brands ---
  const brandMap: Record<string, string> = {};
  for (const name of BRANDS) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const brand = await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    brandMap[name] = brand.id;
  }

  const img = (seed: string) =>
    `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

  const products = [
    // --- Gift Ideas ---
    {
      name: "Aurum & Co. Curated Gift Hamper",
      sku: "CJH-GFT-HAMP1",
      category: "gift-ideas",
      brand: "Aurum & Co.",
      price: 42000,
      salePrice: 36500,
      stockQuantity: 34,
      shortDescription: "A hand-packed hamper of artisan snacks, a scented candle, and a keepsake card.",
      description:
        "Our best-selling gift hamper — a wicker box hand-packed with artisan snacks, a soy-wax candle, a mini journal, and a personalized keepsake card. Ready to ship straight to the recipient, gift-wrapped, with no assembly needed on your end.",
      specs: specs([
        ["Includes", "Candle, snacks, journal, keepsake card"],
        ["Packaging", "Reusable wicker gift box"],
        ["Personalization", "Free gift note on request"],
        ["Best for", "Birthdays, thank-yous, housewarmings"],
      ]),
      warranty: "14-day return on unopened items",
      isFeatured: true,
      images: [img("photo-1549465220-1a8b9238cd48"), img("photo-1513885535751-8b9238bd345c")],
    },
    {
      name: "Everly Personalized Engraved Watch",
      sku: "CJH-GFT-WATCH1",
      category: "gift-ideas",
      brand: "Everly",
      price: 68000,
      stockQuantity: 21,
      shortDescription: "A minimalist stainless-steel watch with a free custom engraving on the case back.",
      description:
        "A timeless minimalist watch — stainless-steel case, genuine leather strap, and a scratch-resistant sapphire-coated face. Every order includes a free custom engraving on the case back, making it a gift that feels made for one person.",
      specs: specs([
        ["Case", "Stainless steel, 40mm"],
        ["Strap", "Genuine leather"],
        ["Water resistance", "3 ATM"],
        ["Engraving", "Free, up to 20 characters"],
        ["Warranty", "2 years"],
      ]),
      warranty: "2-year warranty",
      isFeatured: true,
      images: [img("photo-1524805444758-089113d48a6d"), img("photo-1533139502658-0198f920d8e8")],
    },
    {
      name: "CJ Signature Handmade Jewelry Box",
      sku: "CJH-GFT-JBOX1",
      category: "gift-ideas",
      brand: "CJ Signature",
      price: 29500,
      salePrice: 25900,
      stockQuantity: 40,
      shortDescription: "A velvet-lined wooden jewelry box with a mirror and three tiers of storage.",
      description:
        "Solid wood construction with a hand-finished lacquer coat, soft velvet lining, a fold-out mirror, and three tiers of ring, necklace and bracelet storage. A gift that keeps being useful long after the occasion.",
      specs: specs([
        ["Material", "Solid wood, velvet lining"],
        ["Dimensions", "24 × 18 × 12 cm"],
        ["Tiers", "3, plus fold-out mirror"],
        ["Best for", "Anniversaries, graduations, Mother's Day"],
      ]),
      dimensions: "24 × 18 × 12 cm",
      isFeatured: true,
      images: [img("photo-1611591437281-460bfbe1220a"), img("photo-1611652022419-a9419f74343d")],
    },
    {
      name: "Northline Scented Candle Trio",
      sku: "CJH-GFT-CNDL1",
      category: "gift-ideas",
      brand: "Northline",
      price: 18500,
      stockQuantity: 60,
      shortDescription: "Three hand-poured soy candles in a gift-ready presentation box.",
      description:
        "A set of three hand-poured soy-wax candles — cedarwood & amber, fresh linen, and vanilla bean — each with a 40+ hour burn time. Arrives in a ribboned presentation box, ready to give as-is.",
      specs: specs([
        ["Wax", "100% soy"],
        ["Burn time", "40+ hours each"],
        ["Scents", "Cedarwood & amber, fresh linen, vanilla bean"],
        ["Packaging", "Ribboned gift box"],
      ]),
      images: [img("photo-1602874801007-a259e8f6b1a9")],
    },
    // --- Products & Accessories ---
    {
      name: "Northline Wireless Noise-Cancelling Earbuds",
      sku: "CJH-PRD-EARBD1",
      category: "products-accessories",
      brand: "Northline",
      price: 54000,
      salePrice: 47500,
      stockQuantity: 58,
      shortDescription: "True-wireless earbuds with active noise cancellation and 30-hour battery life.",
      description:
        "Compact true-wireless earbuds with active noise cancellation, a secure in-ear fit, and up to 30 hours of playback with the charging case. Bluetooth 5.3 pairing and touch controls on both earbuds.",
      specs: specs([
        ["Connectivity", "Bluetooth 5.3"],
        ["Battery life", "8h (earbuds) / 30h (with case)"],
        ["Noise cancellation", "Active, dual-mic"],
        ["Water resistance", "IPX5"],
        ["Warranty", "1 year"],
      ]),
      warranty: "1-year warranty",
      isFeatured: true,
      images: [img("photo-1590658268037-6bf12165a8df"), img("photo-1590658165737-15a047b8b0c9")],
    },
    {
      name: "Basecamp Everyday Leather Backpack",
      sku: "CJH-PRD-BKPK1",
      category: "products-accessories",
      brand: "Basecamp",
      price: 61000,
      stockQuantity: 27,
      shortDescription: "A full-grain leather backpack with a padded 15\" laptop sleeve.",
      description:
        "Full-grain leather backpack built for daily commuting — a padded 15-inch laptop sleeve, a water-resistant lining, and enough structure to hold its shape for years. Ages beautifully with use.",
      specs: specs([
        ["Material", "Full-grain leather"],
        ["Laptop sleeve", "Fits up to 15\""],
        ["Capacity", "22L"],
        ["Warranty", "2 years"],
      ]),
      warranty: "2-year warranty",
      isFeatured: true,
      images: [img("photo-1553062407-98eeb64c6a62"), img("photo-1547949003-9792a18a2601")],
    },
    {
      name: "CJ Signature Smart Fitness Watch",
      sku: "CJH-PRD-SMWTC1",
      category: "products-accessories",
      brand: "CJ Signature",
      price: 72000,
      salePrice: 64900,
      stockQuantity: 33,
      shortDescription: "A slim fitness watch with heart-rate, sleep tracking, and a 10-day battery.",
      description:
        "Track workouts, sleep and heart rate from a lightweight AMOLED display that lasts up to 10 days on a charge. Notification mirroring, 5 ATM water resistance, and over 100 sport modes.",
      specs: specs([
        ["Display", "1.43\" AMOLED"],
        ["Battery life", "Up to 10 days"],
        ["Water resistance", "5 ATM"],
        ["Tracking", "Heart rate, SpO2, sleep, 100+ sports"],
        ["Warranty", "1 year"],
      ]),
      warranty: "1-year warranty",
      isFeatured: true,
      images: [img("photo-1523275335684-37898b6baf30"), img("photo-1544117519-31a4b719223d")],
    },
    {
      name: "Everly Polarized Sunglasses",
      sku: "CJH-PRD-SUNGL1",
      category: "products-accessories",
      brand: "Everly",
      price: 23500,
      stockQuantity: 75,
      shortDescription: "Lightweight polarized sunglasses with UV400 protection and a hard case.",
      description:
        "A classic frame in lightweight acetate with polarized, UV400-rated lenses that cut glare without distorting color. Includes a hard clamshell case and a microfiber cleaning pouch.",
      specs: specs([
        ["Lens", "Polarized, UV400"],
        ["Frame", "Lightweight acetate"],
        ["Includes", "Hard case, cleaning pouch"],
      ]),
      images: [img("photo-1572635196237-14b3f281503f")],
    },
  ];

  for (const p of products) {
    const { category, brand, specs: specList, images, ...rest } = p;
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...rest,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        status: "PUBLISHED",
        categoryId: categoryMap[category],
        brandId: brandMap[brand],
        images: {
          create: images.map((url, i) => ({ url, isPrimary: i === 0, position: i })),
        },
        specifications: { create: specList },
      },
    });
  }

  console.log(`Seed complete. Admin login: admin@cjhubs.com / Admin@12345`);
  console.log(`Demo customer login: demo@cjhubs.com / Customer@12345`);
  console.log(`These are demo/seed products, not yet connected to a live supplier API.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
