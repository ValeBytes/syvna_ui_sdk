// The website templates: two sites built only from the Website kit.
// Northwind, a payments product (landing and pricing), and Casa Verde's
// shop front (store, product, cart, checkout). Plain data, so server pages
// read it too; the cart is in data.tsx.


export const base = "/sites";

export const pages = [
  { value: "landing", label: "Landing page", site: "northwind" },
  { value: "pricing", label: "Pricing page", site: "northwind" },
  { value: "shop", label: "Shop: store front", site: "shop" },
  { value: "shop/product/hand-thrown-mug", label: "Shop: product", site: "shop" },
  { value: "shop/cart", label: "Shop: cart", site: "shop" },
  { value: "shop/checkout", label: "Shop: checkout", site: "shop" },
] as const;

const photo = (id: string, w = 800, h = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;
export const heroPhoto = photo("photo-1586023492125-27b2c045efd7", 1400, 900);
export const dashboardShot = photo("photo-1460925895917-afdab827c52f", 1400, 880);

export type Product = {
  slug: string;
  name: string;
  category: "Kitchen" | "Living" | "Decor";
  price: number;
  compareAt?: number;
  photos: string[];
  rating: number;
  reviews: number;
  colours: string[];
  stock: number;
  badge?: string;
  description: string;
};

export const products: Product[] = [
  {
    slug: "hand-thrown-mug",
    name: "Hand-thrown mug",
    category: "Kitchen",
    price: 24,
    compareAt: 30,
    photos: [photo("photo-1514228742587-6b1558fcca3d"), photo("photo-1610701596007-11502861dcfa")],
    rating: 4.5,
    reviews: 128,
    colours: ["Sage", "Sand", "Charcoal"],
    stock: 12,
    description: "Thrown on the wheel in Lisbon and glazed by hand, so no two are alike. Holds 350 ml; safe in the dishwasher and microwave.",
  },
  {
    slug: "stacking-bowls",
    name: "Stacking bowls, set of 3",
    category: "Kitchen",
    price: 58,
    photos: [photo("photo-1610701596007-11502861dcfa"), photo("photo-1514228742587-6b1558fcca3d")],
    rating: 4,
    reviews: 42,
    colours: ["Sand", "Sage"],
    stock: 3,
    badge: "New",
    description: "Three sizes that nest into one: for soup, salad and serving. Stoneware with a satin glaze.",
  },
  {
    slug: "glazed-vase",
    name: "Glazed vase",
    category: "Decor",
    price: 72,
    compareAt: 90,
    photos: [photo("photo-1578749556568-bc2c40e68b61")],
    rating: 5,
    reviews: 9,
    colours: ["Ocean"],
    stock: 0,
    description: "A tall vase with a deep blue glaze that pools at the base. 28 cm high.",
  },
  {
    slug: "oak-stool",
    name: "Oak stool",
    category: "Living",
    price: 140,
    photos: [photo("photo-1503602642458-232111445657")],
    rating: 4.5,
    reviews: 31,
    colours: ["Natural oak"],
    stock: 6,
    description: "Solid oak, joined without screws and finished with oil. Seat, side table or plant stand.",
  },
  {
    slug: "lounge-chair",
    name: "Lounge chair",
    category: "Living",
    price: 420,
    photos: [photo("photo-1567538096630-e0c55bd6374c")],
    rating: 4.5,
    reviews: 18,
    colours: ["Oat", "Moss"],
    stock: 4,
    description: "A low, deep chair with a linen cover that comes off for washing.",
  },
  {
    slug: "wire-chair",
    name: "Wire dining chair",
    category: "Living",
    price: 160,
    photos: [photo("photo-1592078615290-033ee584e267")],
    rating: 4,
    reviews: 57,
    colours: ["White", "Black"],
    stock: 20,
    description: "Powder-coated steel, light enough to move with one hand, sturdy enough for every day.",
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
