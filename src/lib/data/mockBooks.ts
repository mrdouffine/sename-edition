import type { BookDocument } from "@/models/Book";

// Cover images are rendered as CSS components via BookCover.tsx
// The coverImage field is kept for the model but not used in the homepage display
export const mockBooks = [
  {
    title: "décoloniser le Futur",
    subtitle: "CARNETS DE CONFINEMENT",
    slug: "decoloniser-le-futur",
    description:
      "«\u00A0Décoloniser le Futur\u00A0» est un essai dense et visionnaire, écrit durant la période de confinement mondial. " +
      "Seydou Koffi Abodjinou y interroge les paradigmes qui façonnent notre rapport au temps, à l'espace et à la modernité. " +
      "À travers deux volets — «\u00A0Restaurer le Réel\u00A0» et «\u00A0Dystopie Concrète\u00A0» — l'auteur déconstruit les récits dominants " +
      "pour proposer une pensée alternative ancrée dans les savoirs africains.\n\n" +
      "Ce livre est une invitation à repenser les futurs possibles depuis l'Afrique, en s'affranchissant des schémas hérités " +
      "de la colonisation intellectuelle. Un texte fondamental pour quiconque s'intéresse à la philosophie, " +
      "à l'architecture et aux alternatives civilisationnelles.\n\n" +
      "Essai · L'Africaine · 51 pages",
    price: 35,
    saleType: "preorder",
    coverImage: "/images/covers/placeholder.jpg",
    galleryImages: [],
    authorName: "sename",
    tags: ["featured", "essai"],
    coverVariant: "light"
  },
  {
    title: "le Centre de Flammes",
    subtitle: "Livre d'une sortie au jour",
    slug: "le-centre-de-flammes",
    description:
      "«\u00A0Le Centre de Flammes\u00A0» est un recueil poétique puissant qui explore les thèmes de l'éveil, de la lumière intérieure " +
      "et de la transformation spirituelle. Inspiré par les traditions initiatiques africaines, Seydou Koffi Abodjinou " +
      "compose un voyage littéraire où chaque poème est une étape vers la connaissance de soi.\n\n" +
      "Le sous-titre «\u00A0Livre d'une sortie au jour\u00A0» fait écho aux textes funéraires égyptiens, " +
      "réinterprétés ici comme un guide pour traverser les obscurités contemporaines et accéder à une nouvelle clarté. " +
      "La langue est ciselée, rythmique, portée par un souffle lyrique qui rappelle les grands poètes de la négritude " +
      "tout en traçant un chemin résolument personnel.\n\n" +
      "Poésie · L'Africaine",
    price: 25,
    saleType: "direct",
    coverImage: "/images/covers/placeholder.jpg",
    galleryImages: [],
    authorName: "sename",
    tags: ["poésie"],
    coverVariant: "light"
  },
  {
    title: "Girations",
    subtitle: "chantiers poétiques",
    slug: "girations",
    description:
      "«\u00A0Girations\u00A0» rassemble des chantiers poétiques en perpétuel mouvement. Ce recueil explore les rotations " +
      "de la pensée, les orbites de l'imaginaire et les spirales du langage. Seydou Koffi Abodjinou y déploie une écriture " +
      "où le geste architectural rencontre la musicalité du vers.\n\n" +
      "Chaque poème est conçu comme un espace habitable : des fondations solides (le rythme), des murs porteurs " +
      "(les images), une toiture ouverte sur le ciel (le sens). L'auteur invite le lecteur à circuler librement " +
      "dans ces constructions verbales, à s'y perdre pour mieux se retrouver.\n\n" +
      "Un ouvrage qui confirme le talent singulier de Sename à la croisée de l'architecture et de la littérature.\n\n" +
      "Poésie · L'Africaine",
    price: 30,
    saleType: "preorder",
    coverImage: "/images/covers/placeholder.jpg",
    galleryImages: [],
    authorName: "sename",
    tags: ["poésie"],
    coverVariant: "light"
  },
  {
    title: "principes d'une cosmo architecture",
    subtitle: "Architecture et Univers",
    slug: "cosmo-architecture",
    description:
      "Cet essai fondateur pose les bases d'une nouvelle discipline : la cosmo-architecture. Seydou Koffi Abodjinou " +
      "y articule les principes d'une architecture qui dialogue avec les forces cosmiques, les rythmes naturels " +
      "et les savoirs ancestraux du continent africain.\n\n" +
      "Loin des modèles occidentaux importés, l'auteur propose une vision où le bâtiment n'est pas un simple abri, " +
      "mais un organisme vivant connecté à son environnement et à l'univers. Il s'appuie sur des exemples concrets " +
      "d'architectures vernaculaires africaines pour démontrer que les solutions aux défis contemporains — " +
      "écologie, urbanisation, identité — se trouvent déjà dans les traditions constructives du continent.\n\n" +
      "Un ouvrage essentiel pour architectes, urbanistes et tous ceux qui rêvent d'un habitat en harmonie " +
      "avec le monde.\n\n" +
      "Essai · L'Africaine d'architecture",
    price: 45,
    saleType: "crowdfunding",
    fundingGoal: 15000,
    fundingRaised: 8500,
    coverImage: "/images/covers/placeholder.jpg",
    galleryImages: [],
    authorName: "sename",
    tags: ["architecture"],
    coverVariant: "dark"
  },
  {
    title: "comprendre l'architecture en afrique noire",
    subtitle: "Essai sur l'espace africain",
    slug: "comprendre-architecture-afrique",
    description:
      "«\u00A0Comprendre l'architecture en Afrique Noire\u00A0» est une étude approfondie des logiques spatiales, " +
      "sociales et symboliques qui sous-tendent les constructions traditionnelles africaines. " +
      "Seydou Koffi Abodjinou décrypte les codes architecturaux du continent avec une rigueur scientifique " +
      "et une sensibilité d'artiste.\n\n" +
      "L'ouvrage aborde successivement : la conception de l'espace dans les sociétés africaines, " +
      "le rôle du sacré dans l'organisation du bâti, les matériaux et techniques endogènes, " +
      "et enfin les perspectives pour une architecture africaine contemporaine libérée de la mimétisme occidental.\n\n" +
      "Richement illustré et documenté, ce livre constitue une référence incontournable " +
      "pour les étudiants et praticiens de l'architecture en Afrique et au-delà.\n\n" +
      "Essai · L'Africaine d'architecture",
    price: 40,
    saleType: "crowdfunding",
    fundingGoal: 12000,
    fundingRaised: 4200,
    coverImage: "/images/covers/placeholder.jpg",
    galleryImages: [],
    authorName: "sename",
    tags: ["architecture"],
    coverVariant: "dark"
  },
  {
    title: "Esthétiques du Féminin",
    subtitle: "dans les arts nègres",
    slug: "esthetiques-du-feminin",
    description:
      "«\u00A0Esthétiques du Féminin dans les arts nègres\u00A0» explore la représentation de la femme " +
      "dans les traditions artistiques africaines, depuis les sculptures classiques jusqu'aux formes contemporaines. " +
      "Seydou Koffi Abodjinou y révèle comment le féminin constitue un principe structurant fondamental " +
      "dans l'art et la pensée du continent.\n\n" +
      "Au-delà de l'analyse esthétique, l'auteur montre que la puissance du féminin dans les arts nègres " +
      "n'est pas une simple thématique mais une force organisatrice : elle détermine les formes, " +
      "les proportions, les rythmes et les significations. C'est une relecture stimulante qui dépasse " +
      "les grilles d'analyse eurocentrées pour proposer une herméneutique proprement africaine.\n\n" +
      "Essai · L'Africaine d'architecture",
    price: 35,
    saleType: "crowdfunding",
    fundingGoal: 10000,
    fundingRaised: 6000,
    coverImage: "/images/covers/placeholder.jpg",
    galleryImages: [],
    authorName: "sename",
    tags: ["arts"],
    coverVariant: "dark"
  },
  {
    title: "Rencontres",
    subtitle: "Nouvelles",
    slug: "rencontres",
    description:
      "«\u00A0Rencontres\u00A0» est un recueil de nouvelles où Seydou Koffi Abodjinou déploie son talent de conteur. " +
      "Chaque récit est un carrefour : des vies se croisent, des destins s'entremêlent, " +
      "des mondes se découvrent dans la surprise de l'inattendu.\n\n" +
      "De Lomé à Paris, de Ouagadougou à Cotonou, les personnages de ces nouvelles portent " +
      "en eux les contradictions et les espoirs d'une Afrique en mouvement. L'écriture est vive, " +
      "les dialogues sonnent juste, et chaque chute révèle une vérité humaine universelle.\n\n" +
      "Un livre qui se lit d'une traite et qui reste longtemps en mémoire, " +
      "porté par la voix singulière d'un auteur qui sait observer, écouter et raconter.\n\n" +
      "Nouvelles · L'Africaine",
    price: 20,
    saleType: "crowdfunding",
    fundingGoal: 5000,
    fundingRaised: 1200,
    coverImage: "/images/covers/placeholder.jpg",
    galleryImages: [],
    authorName: "sename",
    tags: ["littérature"],
    coverVariant: "light"
  }
] as unknown as BookDocument[];
