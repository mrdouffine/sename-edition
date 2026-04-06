/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";

const AfrLogoBadge = ({ size = 16 }: { size?: number }) => (
    <div className="mt-2 flex items-center justify-center overflow-hidden" style={{ width: size, height: size * 1.3 }}>
        <img src="/images/africaine.jpg" alt="AfrLogo" className="h-full w-full object-contain" />
    </div>
);

interface BookCoverProps {
    title: string;
    subtitle?: string;
    slug?: string;
    authorName?: string;
    variant?: "light" | "dark";
    className?: string;
    titleColor?: string;
    coverImage?: string; // KEEP THIS PROP
}

export default function BookCover({
    title,
    subtitle,
    slug,
    authorName = "sename",
    variant = "light",
    className = "",
    titleColor,
    coverImage, // KEEP THIS PROP
}: BookCoverProps) {
    const bgColor = variant === "dark" ? "#e8e8e0" : "#ffffff";

    const imageMap: Record<string, string> = {
        "decoloniser-le-futur": "decoloniserlefutur.jpg",
        "le-centre-de-flammes": "centredeflammes.jpg",
        "ce-qui-demeure": "cequidemeure.jpg",
        "a-l-endroit": "a-lendroit.png",
        "cosmo-architecture": "principe-dune-cosmos-architecture.jpg",
        "comprendre-architecture-afrique": "comprendre-architecture-en-afrique-noir.jpg",
        "esthetiques-du-feminin": "esthetiquedufeminin.jpg",
        "girations": "girations.jpg",
        "rencontres": "rencntres.jpg",
        "etats-du-lieu": "etatdulieu.jpg"
    };

    // If an uploaded cover image exists, prioritize it, but fall back to imageMap and then SVG
    if (coverImage) {
        return (
            <div className={`relative flex flex-col justify-between overflow-hidden ${className}`} style={{ width: "100%", position: "relative", aspectRatio: "1 / 1.414" }}>
                <img
                    src={coverImage}
                    alt={title || "Couverture de l'ouvrage"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
            </div>
        );
    }

    const imageFile = slug ? imageMap[slug] : undefined;

    if (imageFile) {
        return (
            <div className={`relative flex flex-col justify-between overflow-hidden ${className}`} style={{ width: "100%", position: "relative", aspectRatio: "1 / 1.414" }}>
                <img
                    src={`/article/${imageFile}`}
                    alt={title || "Description"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
            </div>
        );
    }

    return (
        <div className={`relative flex flex-col justify-between overflow-hidden ${className}`} style={{ backgroundColor: bgColor, aspectRatio: "1 / 1.414", width: "100%", position: "relative" }}>
            <div style={{ padding: "12% 8%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", backgroundColor: bgColor }}>
                <div style={{ marginTop: "0.5rem" }}>
                    <span className="text-gray-900/60 lowercase" style={{ fontSize: "0.9rem", letterSpacing: "0.15em", fontWeight: 500 }}>{authorName}</span>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 px-1">
                    <h3 style={{
                        fontSize: title.length > 35 ? "clamp(1.1rem, 2.3vw, 1.35rem)" :
                            title.length > 25 ? "clamp(1.2rem, 2.5vw, 1.6rem)" :
                                "clamp(1.8rem, 3.2vw, 2.6rem)",
                        lineHeight: "0.95",
                        fontWeight: 700,
                        color: titleColor || "#FFEA00", // Restore titleColor support
                        letterSpacing: "-0.03em",
                        wordBreak: "keep-all",
                        overflowWrap: "normal",
                        whiteSpace: "pre-line",
                        textAlign: "center"
                    }}>
                        {title.toLowerCase() === "à l'endroit !" ? (
                            <>à<br />l'endroit !</>
                        ) : title.toLowerCase() === "décoloniser le futur" ? (
                            <>décoloniser<br />le futur</>
                        ) : title.toLowerCase().includes("comprendre l'architecture") ? (
                            <>comprendre<br />l'architecture<br />en afrique<br />noire</>
                        ) : title}
                    </h3>
                    {subtitle && <p className="mt-2 lowercase italic text-gray-800" style={{ fontSize: "0.62rem", letterSpacing: "0.04em", lineHeight: "1.2", fontWeight: 400 }}>{subtitle}</p>}
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-black">
                            {title.toLowerCase().includes("flammes") || title.toLowerCase().includes("girations") ? "POESIE" : title.toLowerCase().includes("rencontres") ? "NOUVELLES" : (title.toLowerCase().includes("architecture") || title.toLowerCase().includes("esthetiques") || title.toLowerCase().includes("esthétiques")) ? "ARTS" : "ESSAI"}
                        </span>
                        <span className="mt-1 text-[0.6rem] font-medium text-black">L'Africaine</span>
                    </div>
                    <div className="w-[1px] h-3 bg-black opacity-10"></div>
                    <AfrLogoBadge size={16} />
                </div>
            </div>
        </div>
    );
}
