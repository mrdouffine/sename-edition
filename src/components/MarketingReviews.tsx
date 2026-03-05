"use client";

import React from "react";

const BUBBLE_REVIEWS: Record<string, { text: string; name: string; date: string; stars?: number; boldPart?: string }[]> = {
    "decoloniser-le-futur": [
        {
            boldPart: "Une lecture indispensable qui m'a fait repenser l'espace et le temps !",
            text: " Sénamé Koffi Agbodjinou propose un regard fascinant et libérateur sur la modernité. Son approche sur la déconstruction des récits dominants ouvre des perspectives immenses. C'est le genre de livre qui vous reste en tête pendant des mois.",
            name: "Aminata Dia",
            date: "14/08/2024",
            stars: 5
        },
        {
            boldPart: "À mon avis, c'est l'un des essais les plus stimulants de cette décennie.",
            text: " Au lieu de simplement critiquer l'existant, l'auteur bâti des concepts tangibles avec les philosophies africaines pour repenser le futur. J'ai été touché par la partie sur la dystopie concrète.",
            name: "Julien C.",
            date: "03/11/2024",
            stars: 5
        },
        {
            boldPart: "Un chef d'oeuvre de pensée architecturale et décoloniale.",
            text: " Je cherchais depuis très longtemps des réflexions ancrées et cohérentes sur notre rapport au monde moderne. Ce manuscrit ordonne et structure tellement d'idées diffuses. Merci beaucoup !",
            name: "Sonia P.",
            date: "22/01/2025",
            stars: 4
        },
        {
            boldPart: "Terminé l'ouvrage hier. Ce format de pensée est incroyable.",
            text: " La densité des réflexions est élevée, mais ça se lit avec une grande fluidité. On ne se sent pas perdu et tout est richement développé. Ça donne envie de découvrir tous les carnets.",
            name: "Thomas D.",
            date: "05/02/2025",
            stars: 5
        }
    ],
    "le-centre-de-flammes": [
        {
            boldPart: "Une résonance poétique exceptionnelle qui vous transporte.",
            text: " La façon dont l'auteur manie les mots pour invoquer l'éveil spirituel est magnifique. Chaque lecture révèle de nouveaux aspects et sensations. C'est une œuvre majeure de poésie !",
            name: "Léa M.",
            date: "10/06/2024",
            stars: 5
        },
        {
            boldPart: "Mon recueil de chevet. Impossible de ne pas s'y replonger.",
            text: " Une très belle interprétation des traditions africaines avec une vraie sincérité lyrique.",
            name: "Koffi A.",
            date: "19/09/2024",
            stars: 5
        },
        {
            boldPart: "Puissant, intime, ciselé. On en sort profondément changé.",
            text: " L'agencement des mots et du sens crée une véritable expérience, une sortie vers la lumière de l'âme.",
            name: "Claire L.",
            date: "05/12/2024",
            stars: 4
        },
        {
            boldPart: "Un verbe incarné, digne des grands poètes de notre histoire.",
            text: " Ce recueil ne se lit pas, il se vit, il s'écoute. C'est l'un des ouvrages les plus forts que j'aie acheté récemment.",
            name: "Marc E.",
            date: "12/01/2025",
            stars: 5
        }
    ],
    "girations": [
        {
            boldPart: "Un très grand recueil qui mêle architecture et rythme.",
            text: " C'est incroyable de voir comment Sénamé parvient à bâtir des poèmes comme il bâtirait des maisons. Une structure solide avec beaucoup d'espace pour respirer.",
            name: "Alexandre G.",
            date: "14/03/2024",
            stars: 5
        },
        {
            boldPart: "Très belle surprise, impossible de décrocher !",
            text: " Les images résonnent, les mots orbitent dans l'esprit. Un très beau travail rythmique, je suis conquise par ce chantier poétique.",
            name: "Fatou B.",
            date: "02/06/2024",
            stars: 4
        },
        {
            boldPart: "La poésie à l'état pur. Magique.",
            text: " Chaque page est un voyage, on explore les spirales du langage avec délectation. Un vrai souffle d'air frais.",
            name: "Jean-Paul S.",
            date: "18/08/2024",
            stars: 5
        },
        {
            boldPart: "Une oeuvre singulière et mémorable.",
            text: " Je ne m'attendais pas à une telle puissance verbale. Il invite littéralement le lecteur à habiter son poème. Magistral.",
            name: "Sarah T.",
            date: "25/01/2025",
            stars: 5
        }
    ],
    "cosmo-architecture": [
        {
            boldPart: "Ce livre est une révélation pour tout architecte en devenir.",
            text: " Enfin une approche qui s'affranchit des dogmes pour puiser dans un héritage cosmique et ancestral fort.",
            name: "Michel R.",
            date: "08/04/2024",
            stars: 5
        },
        {
            boldPart: "Une discipline novatrice merveilleusement bien expliquée.",
            text: " L'articulation entre l'univers, la nature et le bâtiment est criante de vérité. Une vision qui mériterait d'être enseignée partout.",
            name: "Yasmine D.",
            date: "21/07/2024",
            stars: 5
        },
        {
            boldPart: "Indispensable pour repenser l'urbanisme d'aujourd'hui !",
            text: " Il propose des solutions endogènes concrètes et pertinentes. Les démonstrations sont à la fois scientifiques et philosophiques.",
            name: "Karim F.",
            date: "12/09/2024",
            stars: 4
        },
        {
            boldPart: "Un essai fabuleux. Je l'ai dévoré d'une traite.",
            text: " Tout le monde devrait s'intéresser à cette cosmo-architecture, c'est bien plus qu'une question de construction, c'est une question de connexion au monde.",
            name: "Alice P.",
            date: "04/01/2025",
            stars: 5
        }
    ],
    "comprendre-architecture-afrique": [
        {
            boldPart: "L'ouvrage de référence que j'attendais !",
            text: " Décryptage rigoureux de l'espace, analyse symbolique des matériaux... La richesse de cet ouvrage est inestimable pour tous les curieux du continent.",
            name: "Bernard O.",
            date: "15/02/2024",
            stars: 5
        },
        {
            boldPart: "Fascinant de bout en bout.",
            text: " La réflexion sur l'espace et le sacré est extrêmement poussée sans être élitiste. C'est très bien documenté.",
            name: "Marie J.",
            date: "30/05/2024",
            stars: 5
        },
        {
            boldPart: "Un travail magistral et très pédagogique.",
            text: " Même sans être du milieu de l'architecture, on saisit l'enjeu esthétique et culturel immense. Très belles illustrations.",
            name: "Elie N.",
            date: "11/08/2024",
            stars: 4
        },
        {
            boldPart: "La meilleure introduction à l'architecture africaine.",
            text: " Fini le mimétisme occidental ! L'auteur nous apprend à regarder de l'intérieur. Je vais l'offrir à tous mes collègues.",
            name: "Clémence H.",
            date: "02/12/2024",
            stars: 5
        }
    ],
    "esthetiques-du-feminin": [
        {
            boldPart: "Une lecture bouleversante et tellement juste.",
            text: " La grille d'analyse que propose l'auteur est lumineuse. Une façon inédite de regarder les œuvres et d'en comprendre la profondeur.",
            name: "Awa T.",
            date: "09/01/2024",
            stars: 5
        },
        {
            boldPart: "Cet essai réhabilite la force vitale des arts nègres.",
            text: " On comprend enfin le rôle structurant du féminin, bien au-delà de la thématique de la maternité. Magistral !",
            name: "Stéphane V.",
            date: "23/04/2024",
            stars: 5
        },
        {
            boldPart: "Lumeux, précis, un excellent travail de fond.",
            text: " Cette herméneutique proprement africaine est très stimulante. Les exemples choisis sont parfaits et très clairs.",
            name: "Nadia K.",
            date: "07/11/2024",
            stars: 4
        },
        {
            boldPart: "Je recommande les yeux fermés.",
            text: " L'auteur démontre le féminin comme force organisatrice cosmique. Une nouvelle référence dans ma bibliothèque.",
            name: "Pierre A.",
            date: "14/01/2025",
            stars: 5
        }
    ],
    "rencontres": [
        {
            boldPart: "Un recueil de nouvelles vibrant et authentique.",
            text: " De l'humour, de la nostalgie, de très belles trajectoires humaines. La plume est extrêmement vivante, on s'y croirait.",
            name: "Chloé S.",
            date: "18/03/2024",
            stars: 4
        },
        {
            boldPart: "Des chutes inattendues et des portraits forts.",
            text: " Sénamé est décidément un excellent conteur. Chaque histoire m'a transporté, de Cotonou jusqu'à Paris.",
            name: "Léonard M.",
            date: "26/06/2024",
            stars: 5
        },
        {
            boldPart: "Très facile à lire, on en redemande.",
            text: " L'Afrique racontée au travers de destins ordinaires qui se croisent, c'est touchant. Un vrai plaisir.",
            name: "Sophie R.",
            date: "30/09/2024",
            stars: 5
        },
        {
            boldPart: "Un voyage humain magnifique.",
            text: " On sent beaucoup d'empathie chez l'auteur pour ses personnages. J'aurais adoré que le livre soit plus long !",
            name: "Bakary C.",
            date: "11/02/2025",
            stars: 5
        }
    ],
    "ce-qui-demeure": [
        {
            boldPart: "Encore une claque intellectuelle phénoménale.",
            text: " Le concept de présence est scruté avec une finesse rare. Je me suis régalé à chaque page. Un outil absolu de résistance !",
            name: "Ousmane B.",
            date: "20/05/2024",
            stars: 5
        },
        {
            boldPart: "Philosophique, politique, et superbement écrit.",
            text: " L'essai continue dans la droite ligne de sa pensée architecturale. On bâtit la résistance ligne après ligne.",
            name: "Claire F.",
            date: "13/08/2024",
            stars: 5
        },
        {
            boldPart: "Un essai d'une actualité brûlante. À méditer.",
            text: " Les thèses défendues sur notre encrage dans le monde tombent à un moment où nous en avons le plus besoin. Brillant.",
            name: "Victor P.",
            date: "02/11/2024",
            stars: 4
        },
        {
            boldPart: "Tout simplement incontournable !",
            text: " Du grand Sénamé ! À la fois exigeant et accessible, on en ressort plus éclairé sur soi et sur les autres.",
            name: "Mireille E.",
            date: "16/01/2025",
            stars: 5
        }
    ],
    "a-l-endroit": [
        {
            boldPart: "Un manifeste électrochoc, on ouvre enfin les yeux !",
            text: " Le renversement des perspectives opéré dans ce texte est libérateur. C'est le livre que la jeunesse africaine doit lire.",
            name: "Didier Y.",
            date: "11/04/2024",
            stars: 5
        },
        {
            boldPart: "Urgent, vital et parfaitement argumenté.",
            text: " J'ai été marqué par sa façon de réaffirmer la réappropriation du temps. C'est l'essence même d'une vraie souveraineté intellectuelle.",
            name: "Assa T.",
            date: "29/07/2024",
            stars: 5
        },
        {
            boldPart: "Une pépite à diffuser massivement.",
            text: " Dès les premières pages, le ton est donné. C'est tranchant mais jamais haineux. Une très belle dialectique.",
            name: "Camille W.",
            date: "19/10/2024",
            stars: 4
        },
        {
            boldPart: "Mon livre coup de cœur de l'année !",
            text: " L'ancrage véritable dont parle l'auteur m'a bouleversé. Le lire, c'est déjà commencer à se libérer.",
            name: "Kader S.",
            date: "08/02/2025",
            stars: 5
        }
    ],
    "default": [
        {
            boldPart: "Cette œuvre m'a tellement impressionné que je n'arrête pas d'y penser !",
            text: " La profondeur de la réflexion et l'engagement intellectuel de Sénamé Koffi Agbodjinou sont incroyables. C'est merveilleux de voir cette manière de partager avec les lecteurs. Merci infiniment.",
            name: "Lilly O.",
            date: "02/05/2024"
        },
        {
            boldPart: "À mon avis, ce livre est fondamental pour comprendre notre époque.",
            text: " J'ai eu plein de moments de lucidité en lisant ces pages. La clarté des idées est frappante. Je recommande cet ouvrage à 100%.",
            name: "Samuel K.",
            date: "18/07/2024"
        },
        {
            boldPart: "Achevé hier. Un véritable tour de force conceptuel et stylistique.",
            text: " Je cherchais de bons matériaux sur ce sujet depuis un moment, et ceci a dépassé mes attentes. C'est remarquablement bien structuré.",
            name: "Philip M.",
            date: "09/10/2024"
        },
        {
            boldPart: "Une présentation fascinante qui captive de la première à la dernière page.",
            text: " On ressort de cette lecture avec de l'énergie et plein d'idées neuves. J'ai déjà hâte de lire d'autres publications de l'Africaine.",
            name: "Suzanna R.",
            date: "28/01/2025"
        }
    ]
};

export default function MarketingReviews({ slug }: { slug?: string }) {
    const reviews = slug && BUBBLE_REVIEWS[slug] ? BUBBLE_REVIEWS[slug] : BUBBLE_REVIEWS["default"];

    return (
        <div className="w-full bg-[#fcfcfc] py-16 mt-6 border-t border-gray-100">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20">
                <div className="mb-12 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Derniers avis certifiés sur cet ouvrage
                    </h2>
                    <div className="h-1 w-16 bg-[#FFF100] mt-3 mx-auto md:mx-0"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="flex flex-col relative w-full">
                            {/* Bulles Jaunes style image */}
                            <div
                                className="bg-[#FFF100] px-8 py-7 relative text-[0.9rem] lg:text-[1rem] text-black leading-relaxed shadow-sm min-h-[160px]"
                                style={{ borderRadius: "2px" }}
                            >
                                <span className="font-extrabold">{review.boldPart}</span>
                                <span className="font-medium text-gray-800">{review.text}</span>

                                {/* Triangle bulle chat en bas à gauche */}
                                <div
                                    className="absolute w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[20px] border-t-[#FFF100]"
                                    style={{ bottom: "-20px", left: "32px", transform: "skewX(-15deg)" }}
                                ></div>
                            </div>

                            {/* Informations utilisateur */}
                            <div className="flex items-center gap-4 mt-8 ml-[16px]">
                                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center opacity-90 border-2 border-white shadow-sm shrink-0">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${review.name.split(" ").join("+")}&background=random&color=fff&rounded=true&font-size=0.4`}
                                        alt={review.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-gray-900 text-[1rem]">{review.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {/* Stars */}
                                        <div className="flex gap-[2px]">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-[14px]" style={{ color: i < (review.stars || 5) ? "#fb923c" : "#e5e7eb" }}>star</span>
                                            ))}
                                        </div>
                                        {/* Date */}
                                        <span className="text-[0.65rem] text-gray-500 font-medium">{review.date}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
