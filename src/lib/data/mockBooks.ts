import type { BookDocument } from "@/models/Book";

// Base Cloudinary URL for cloud: dw7mr4ob0
const CDN = "https://res.cloudinary.com/dw7mr4ob0/image/upload";

export const mockBooks = [
  {
    title: "décoloniser le Futur",
    subtitle: "CARNETS DE CONFINEMENT",
    slug: "decoloniser-le-futur",
    description: "Un ouvrage majeur sur la décolonisation de la pensée et du futur dans le contexte des carnets de confinement.",
    price: 35,
    saleType: "preorder",
    coverImage: `${CDN}/1_xqp956`,
    galleryImages: [],
    authorName: "sename",
    tags: ["featured", "essai"]
  },
  {
    title: "le Centre de Flammes",
    subtitle: "Livre d'une sortie au jour",
    slug: "le-centre-de-flammes",
    description: "Poésie et réflexion sur l'éveil et la lumière intérieure.",
    price: 25,
    saleType: "direct",
    coverImage: `${CDN}/2_yd4jhw`,
    galleryImages: [],
    authorName: "sename",
    tags: ["poésie"]
  },
  {
    title: "Girations",
    subtitle: "chantiers poétiques",
    slug: "girations",
    description: "Exploration des chantiers poétiques et des mouvements de l'esprit.",
    price: 30,
    saleType: "preorder",
    coverImage: `${CDN}/3_xrtktf`,
    galleryImages: [],
    authorName: "sename",
    tags: ["poésie"]
  },
  {
    title: "principes d'une cosmo architecture",
    subtitle: "Architecture et Univers",
    slug: "cosmo-architecture",
    description: "Fondements d'une nouvelle approche architecturale en harmonie avec le cosmos.",
    price: 45,
    saleType: "crowdfunding",
    fundingGoal: 15000,
    fundingRaised: 8500,
    coverImage: `${CDN}/4_irxhxb`,
    galleryImages: [],
    authorName: "sename",
    tags: ["architecture"]
  },
  {
    title: "comprendre l'architecture en afrique noire",
    subtitle: "Essai sur l'espace africain",
    slug: "comprendre-architecture-afrique",
    description: "Analyse profonde des structures spatiales et sociales de l'architecture en Afrique Noire.",
    price: 40,
    saleType: "crowdfunding",
    fundingGoal: 12000,
    fundingRaised: 4200,
    coverImage: `${CDN}/3_xrtktf`,
    galleryImages: [],
    authorName: "sename",
    tags: ["architecture"]
  },
  {
    title: "Esthétiques du Féminin",
    subtitle: "dans les arts nègres",
    slug: "esthetiques-du-feminin",
    description: "Étude des représentations et de la puissance du féminin dans les arts traditionnels.",
    price: 35,
    saleType: "crowdfunding",
    fundingGoal: 10000,
    fundingRaised: 6000,
    coverImage: `${CDN}/4_irxhxb`,
    galleryImages: [],
    authorName: "sename",
    tags: ["arts"]
  },
  {
    title: "Rencontres",
    subtitle: "Nouvelles",
    slug: "rencontres",
    description: "Recueil de nouvelles explorant les carrefours de la vie et des destins croisés.",
    price: 20,
    saleType: "crowdfunding",
    fundingGoal: 5000,
    fundingRaised: 1200,
    coverImage: `${CDN}/1_xqp956`,
    galleryImages: [],
    authorName: "sename",
    tags: ["littérature"]
  }
] as unknown as BookDocument[];

