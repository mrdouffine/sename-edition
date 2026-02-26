import mongoose from "mongoose";
import BookModel from "./src/models/Book";

const mockBooksRaw = [
    {
        _id: "653e8f1b9a1d4b001a2b3c4d",
        title: "décoloniser le Futur",
        subtitle: "CARNETS DE CONFINEMENT",
        slug: "decoloniser-le-futur",
        description: "« Décoloniser le Futur » est un essai dense et visionnaire. Face aux crises contemporaines, l'auteur nous invite à repenser notre rapport au temps, à la terre et à l'identité.\n\nCe carnet de confinement, rédigé dans l'urgence d'un monde en pause, explore avec acuité les dynamiques de domination qui continuent de façonner notre modernité.\n\nÀ travers des réflexions incisives et une plume poétique, c'est un véritable appel à la réinvention et à la liberté qui est lancé. Une lecture indispensable pour quiconque souhaite comprendre les futurs possibles au-delà des récits hégémoniques.",
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
        description: "« Le Centre de Flammes » est un recueil poétique puissant. Telle une sortie au jour, il éclaire les parts obscures de notre existence et ravive le feu intérieur qui anime la quête de sens.\n\nComposé de vers à la fois brûlants et méditatifs, ce livre interroge la mémoire, la spiritualité et les cicatrices de l'histoire. C'est un retour incantatoire à la source.\n\nEmpreint d'une intense chaleur cosmique, ce recueil se lit comme un voyage d'initiation guidant l'âme vers sa propre lumière incandescente.",
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
        description: "« Fameux coup de fouet d’un magistère ! Qu’on juge par ceci en particulier, que mon cas est bien sérieux. »\n\nRecueil rigoureusement haché d’une anthologie de circonstance, Girations (refusé partout) est une somme poétique sur le mode de l'Odyssée : Une traversée particulière des toutes premières années du millénaire.\n\nL’auteur, immigré en France à 20 ans, restitue pour en vrac : des études en design industriel, histoire de l’art, architecture et anthropologie, avec ses prises de consciences esthétiques et politiques sur fond de désargentement et d’errance de l’exil parisien.",
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
        description: "Cet essai fondateur pose les bases d'une nouvelle discipline : la Cosmo-Architecture. En dépassant le simple cadre bâtisseur, l'auteur relie l'espace humain aux dimensions astrologiques, mythologiques et écologiques.\n\nÀ la croisée des sciences traditionnelles de l'espace et de la physique moderne, cet ouvrage redéfinit notre manière de concevoir l'habitat pour qu'il soit en pleine résonance avec les vibrations de l'univers.\n\nUn manifeste théorique accompagné de schémas inédits, démontrant que construire, c'est avant tout dialoguer avec l'infini spatial.",
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
        description: "« Comprendre l'architecture en Afrique Noire » est une étude approfondie et critique. Bien loin des clichés sur l'habitat traditionnel, l'auteur dissèque les logiques spatiales millénaires et les mutations urbaines modernes.\n\nEn abordant les enjeux symboliques, sociaux et climatiques, ce livre met en exergue l'incroyable résilience et l'ingéniosité de l'espace africain.\n\nIllustré par des cas concrets de villes et de villages à travers le continent, cet essai s'impose comme une référence incontournable pour l'étudiant, l'architecte, ou le passionné d'urbanisme africain.",
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
        description: "« Esthétiques du Féminin dans les arts nègres » explore la place centrale, souvent mystifiée, de la figure féminine dans la sculpture, la danse et la poésie classique africaine.\n\nDu masque de fertilité aux parures royales, cet ouvrage documente la force spirituelle et matricielle que la femme incarne dans la pensée esthétique du continent.\n\nCe livre magnifique offre une grille de lecture érudite, déconstruisant la vision occidentale pour révéler la puissance d'une symbolique féminine profondément sacrée.",
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
        description: "« Rencontres » est un recueil de nouvelles palpitant. Entre destins croisés, exils intérieurs et chocs culturels, ce livre tisse une toile humaine profondément touchante.\n\nChaque nouvelle est une fenêtre ouverte sur des moments de fulgurance verbale, où des personnages du quotidien sont confrontés à l'étrangeté de l'autre et à leurs propres gouffres intérieurs.\n\nÉcrit avec pudeur et justesse, ce recueil interroge la fragilité des liens qui unissent les hommes à la lisière du visible et de l'invisible.",
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
