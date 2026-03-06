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
        description: "« Le Centre de Flammes » est un recueil poétique puissant. Telle une sortie au jour, il éclaire les parts obscures de notre existence et ravive le feu intérieur qui anime la quête de sens.\n\nComposé de vers à la fois brûlants et méditatifs, ce livre interroge la mémoire, la spiritualité et les cicatrices de l'history. C'est un retour incantatoire à la source.\n\nEmpreint d'une intense chaleur cosmique, ce recueil se lit comme un voyage d'initiation guidant l'âme vers sa propre lumière incandescente.",
        price: 25,
        saleType: "direct",
        coverImage: "/images/covers/placeholder.jpg",
        authorName: "sename",
        tags: ["poésie"],
        stock: 100,
        staticReviews: [
            {
                name: "Follashade Ogunde",
                role: "Avis Lecture",
                content: "14 années après avoir finalisé la rédaction de son livre de sortie au jour, Sename décide de le faire découvrir. Pourquoi avoir attendu si longtemps ?\nDans ce livre où il semble s’adresser à la fois à « Neuf mois », sa mère et au lecteur par défaut, on lit les péripéties d’un jeune homme, qui après avoir rêvé à la poésie, de bat dans un monde qui n’est pas le sien, afin de faire accepter son bouquin par des maisons d’éditions. Un jeune homme noir, affamé, dans les rues d’une France qui ne l’a nullement vu naître. Il frappe aux portes des maisons mais aucune ne semble valoriser le tas de papiers qu’il tient en main. Il raconte au lecteur sa rage, avoir subi rejets après rejets sans jamais avoir la chance d’être ne serait-ce que considéré ou lu.\nSename parle à sa mère de ce par quoi il passe dans cette France où il est allé poursuivre ses études et où il a voulu embrasser la vocation de poète. Neuf années depuis son arrivée en France jusqu’à la rédaction de ce livre, il lui est arrivé de repenser à son retour au pays natal, d’aimer , de travailler, d’étudier, …\nRejeté à maintes reprises par les maisons d’édition, aussi bien françaises que « africaines », il décide de devenir lui même « Maison ». Ainsi, ce livre, « Le centre de flammes », vous le lirez sans retouche, sans relecture, sans corrections, sans polissure …\nViendront des parties que vous ne comprendrez peut-être pas, des parties que vous n’accepterez peut-être pas, … il laisse à chaque lecteur le soin d’avoir un avis, de le finir ou pas, de l’aimer ou de le désapprouver, de le recommander ou pas…",
                rating: 5,
                order: 1
            },
            {
                name: "Kodjo Casimir Atoukouvi",
                role: "Lecteur",
                content: "Le Centre de Flammes, c'est une poésie d'une force remarquable. C'est le délire lyrique d'un homme racontant son expérience de l'occident, l'intensité de sa vie intellectuelle et sa bohème.\nJe ne peux vraiment pas décrire ce qui m'est resté comme impression après l'avoir lu. On suit l'auteur dans un voyage très intense et extrêmement dense, et on effectue nous aussi cette navigation à la recherche de \"quelquechose\". On virevolte entre négritude, esthétique, illusions et autres sujets.\nL' écriture? D'une violence inouïe, d'une rapidité et d'une impatience sensationnelles: \"Vite, vite que l'écrive\". Le flux de conscience libre, le trouble mais surtout l'inspiration débordante que l'auteur ne pouvait, apparemment,plus contenir. Il s'agit d'une torture indicible. Il en résulte pourtant une force extraordinaire.\nPlusieurs parties du texte m'on fait penser aux expériences des situationnistes, notamment à Guy Debord. Le projet est bien évidemment la liberté.\nCertains ne peuvent assurément pas supporter cette folie et remarqueront que l'œuvre n'est pas pour eux. Je l'ai justement adorée pour cela... Car elle vient de la profondeur de l'âme du poète.",
                rating: 5,
                order: 2
            }
        ]
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
        description: "« Esthétiques du Féminin dans les arts nègres » explore la place centrale, often mystifiée, de la figure féminine dans la sculpture, la danse et la poésie classique africaine.\n\nDu masque de fertilité aux parures royales, cet ouvrage documente la force spirituelle et matricielle que la femme incarne dans la pensée esthétique du continent.\n\nCe livre magnifique offre une grille de lecture érudite, déconstruisant la vision occidentale pour révéler la puissance d'une symbolique féminine profondément sacrée.",
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
