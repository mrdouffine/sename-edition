import type { BookDocument } from "@/models/Book";

export const mockBooks = [
  {
    title: "Le Centre de Flammes",
    subtitle: "Maison d'édition Africaine",
    slug: "le-centre-de-flammes",
    description:
      "Un ouvrage manifeste sur la puissance des mythes africains et les trajectoires de création.",
    price: 35,
    saleType: "direct",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDYSbJ3_4m9L3kbj_5gsGyulcSyFAERw49O0CTVzOTBHv5DheevkPS2EebCPanU1Y2kL2Cwry8dPvFhY__D0kjx3Xk-bniakLhn70VjywgkVrXxYt61hn-5aABS8G0kIKHcCIVQsUUAXPBFqwL71kLHs6j6UerPJZkciE8EsiV-7riatlRkujA-A70YG377gAf4OVRHIaERL3XfWAdQmaCargEnU7W9NVciWs635yqrk0ilG_YrcbYOhrUtI5fvj_f17Zy6fsdtdIc",
    galleryImages: [],
    stock: 12,
    authorName: "Seydou Koffi Abodjinou",
    tags: ["essai", "histoire"]
  },
  {
    title: "Grations",
    subtitle: "Poésie contemporaine",
    slug: "grations",
    description:
      "GIRATIONS est le premier opus d'une collection dédiée à la création contemporaine.",
    price: 40,
    saleType: "preorder",
    releaseDate: new Date("2022-04-01"),
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAD2uVu4d-IKDbc0coZFFV4ZJmiVGzQh2-va4GruvfEcAYzkXV2WxIWOSlxqr7ei7fvGtT6lbxPCf8h0Moe55Q3VJHs1d6g8jH6XiDi_XZgqy_GunqjuMlpXkmqasUVpWqNvlEhfaq1ndVOs4CCOovForAj9HT913xqvUXt5zIJ0dKlZc1sstepnMhfCAroJQMa4NdjDJ6QhV8igntWFoDNPIPD50e02-c1dBkg2EYDqe0E218T2ZA90YpirZmsAWneOZeo6rYCJB0",
    galleryImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFofOUnbDM3-UeGhAPg1O0zo0B5KZi0qPk-PP5g-GlDvUmkhftD3XHeLIXNkSV1nNbU3rCWxBycsX093mJWN3AY13q6wcJTh4UwGFsX8LBsecw1O69Q1_7U7OnELzWhyOxLL5nJ3EO6jAYqiF7Bo6W17kw6g0cLTp4xINDoqB6mvVu26khFlSR4LnHNHnmVhvVXQ8MpF1PHZoXsZJLIPLJkPWT7bu_3f8lr4zQvCLCcXwMuPKXb3i-1GClI6AO1IZSOo3ZBFHUpHQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZsamJZEpcYaTLJqa4KPG2JdyRrjCMtMoEXqRaIfSXXVRLqKcdWmvNE6LhpODVTzlA4DAstRdw7dL267kfFx5p7P0aXEdiiG2ivkcNZHqfFkoAvGqa9CjIO3eUbyA6BRl6N4opsWRuqRNL2aZQD6bwV4ZPFC9k3Mgq5mC67k5gFSlGbiB_axIyh3b2W0JINMPlGvQ3QCghPtcbZC_vIrCegc7M-yrdW_3wW4a32QPCLDeGdWu7a4pvK_qf--8Y5hm6Xu7HidTIFU0"
    ],
    isbn: "978-2-491229-06-1",
    pages: 192,
    stock: 10,
    authorName: "Collectif",
    tags: ["poésie", "contemporain"]
  },
  {
    title: "Cosmo Architecture",
    subtitle: "Urbanisme et futur",
    slug: "cosmo-architecture",
    description:
      "Projet éditorial sur l'architecture cosmique et les villes de demain.",
    price: 0,
    saleType: "crowdfunding",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClE2mEVNHYX31yi9InBFZkthQMF_8QZbR22NVA4WZ-9xiJx2dOkbEMqsHwxO6GgOLI8xqeDJ24LUNJ6OY6jE4KNjY7Fz_Dq86Fh_clTtyGM76aMpzHF2yRdmVqhxs_62MsCCbqA2BHfvWXKf5IIqed6FOw8bSCUDTnWjSvUL9KcF98PIZSuywVHhq-mA2FmFaWli6AIbsu8zLxnazcnvd2y3byLHhd3zsoHGZFjwk604K9rqgDEkPJwvQ5gJW3kYtaqpnq79f-k-U",
    galleryImages: [],
    fundingGoal: 12000,
    fundingRaised: 7800,
    authorName: "Collectif",
    tags: ["architecture", "prospective"]
  }
] as unknown as BookDocument[];
