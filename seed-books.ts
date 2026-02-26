import "dotenv/config";
import mongoose from "mongoose";
import BookModel from "./src/models/Book";

const mockBooksRaw = [
    {
        _id: "653e8f1b9a1d4b001a2b3c4d",
        title: "décoloniser le Futur",
        subtitle: "CARNETS DE CONFINEMENT",
        slug: "decoloniser-le-futur",
        description: "«\u00A0Décoloniser le Futur\u00A0» est un essai dense et visionnaire...",
        price: 35,
        saleType: "preorder",
        coverImage: "/images/covers/placeholder.jpg",
        authorName: "sename",
        tags: ["featured", "essai"],
        stock: 100
    },
    {
        _id: "653e8f1b9a1d4b001a2b3c4e",
        title: "le Centre de Flammes",
        subtitle: "Livre d'une sortie au jour",
        slug: "le-centre-de-flammes",
        description: "«\u00A0Le Centre de Flammes\u00A0» est un recueil poétique puissant...",
        price: 25,
        saleType: "direct",
        coverImage: "/images/covers/placeholder.jpg",
        authorName: "sename",
        tags: ["poésie"],
        stock: 100
    },
    {
        _id: "653e8f1b9a1d4b001a2b3c4f",
        title: "Girations",
        subtitle: "chantiers poétiques",
        slug: "girations",
        description: "«\u00A0Girations\u00A0» rassemble des chantiers poétiques...",
        price: 30,
        saleType: "preorder",
        coverImage: "/images/covers/placeholder.jpg",
        authorName: "sename",
        tags: ["poésie"],
        stock: 100
    },
    {
        _id: "653e8f1b9a1d4b001a2b3c50",
        title: "principes d'une cosmo architecture",
        subtitle: "Architecture et Univers",
        slug: "cosmo-architecture",
        description: "Cet essai fondateur pose les bases d'une nouvelle discipline...",
        price: 45,
        saleType: "crowdfunding",
        coverImage: "/images/covers/placeholder.jpg",
        authorName: "sename",
        tags: ["architecture"],
        stock: 100
    },
    {
        _id: "653e8f1b9a1d4b001a2b3c51",
        title: "comprendre l'architecture en afrique noire",
        subtitle: "Essai sur l'espace africain",
        slug: "comprendre-architecture-afrique",
        description: "«\u00A0Comprendre l'architecture en Afrique Noire\u00A0» est une étude...",
        price: 40,
        saleType: "crowdfunding",
        coverImage: "/images/covers/placeholder.jpg",
        authorName: "sename",
        tags: ["architecture"],
        stock: 100
    },
    {
        _id: "653e8f1b9a1d4b001a2b3c52",
        title: "Esthétiques du Féminin",
        subtitle: "dans les arts nègres",
        slug: "esthetiques-du-feminin",
        description: "«\u00A0Esthétiques du Féminin dans les arts nègres\u00A0» explore...",
        price: 35,
        saleType: "crowdfunding",
        coverImage: "/images/covers/placeholder.jpg",
        authorName: "sename",
        tags: ["arts"],
        stock: 100
    },
    {
        _id: "653e8f1b9a1d4b001a2b3c53",
        title: "Rencontres",
        subtitle: "Nouvelles",
        slug: "rencontres",
        description: "«\u00A0Rencontres\u00A0» est un recueil de nouvelles...",
        price: 20,
        saleType: "crowdfunding",
        coverImage: "/images/covers/placeholder.jpg",
        authorName: "sename",
        tags: ["littérature"],
        stock: 100
    }
];

async function seed() {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/livreo";
    console.log("Connecting to", uri);
    await mongoose.connect(uri);

    for (const book of mockBooksRaw) {
        await BookModel.updateOne(
            { slug: book.slug },
            { $set: book },
            { upsert: true }
        );
        console.log("Seeded:", book.title);
    }

    console.log("Done!");
    await mongoose.disconnect();
}

seed().catch(console.error);
