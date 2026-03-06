/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";

const AfrLogoBadge = ({ size = 16 }: { size?: number }) => (
    <div className="bg-black mt-2 text-white flex flex-wrap items-center justify-center font-bold" style={{ width: size, height: size * 1.3, padding: "1px" }}>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>A</span>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>F</span>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>R</span>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>I</span>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>C</span>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>A</span>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>I</span>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>N</span>
        <span className="w-1/3 text-center" style={{ fontSize: `${size * 0.35}px`, lineHeight: "1" }}>E</span>
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
}

export default function BookCover({
    title,
    subtitle,
    slug,
    authorName = "sename",
    variant = "light",
    className = "",
    titleColor,
}: BookCoverProps) {
    const bgColor = variant === "dark" ? "#e8e8e0" : "#ffffff";

    const imageMap: Record<string, string> = {
        "decoloniser-le-futur": "decoloniser-le-futur.png",
        "le-centre-de-flammes": "le-centre-des-flammes.png",
        "ce-qui-demeure": "ce-qui-demeure.png",
        "a-l-endroit": "a-lendroit.png",
        "cosmo-architecture": "principe-cosmo-architecture.png",
        "comprendre-architecture-afrique": "comprendre-architecture-afrique-noire.png",
        "esthetiques-du-feminin": "esthetique-du-feminin.png",
        "girations": "girations.png",
        "rencontres": "rencontres.png"
    };

    const imageFile = slug ? imageMap[slug] : undefined;

    return (
        <div className={`relative flex flex-col justify-between overflow-hidden bg-transparent ${className}`} style={{ backgroundColor: imageFile ? 'transparent' : bgColor, aspectRatio: "3 / 4", width: "100%", position: "relative" }}>
            {imageFile ? (
                <Image
                    src={`/articles/${imageFile}`}
                    alt={title || "Cover image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                        objectFit: "cover",
                        transform: "scaleX(1.14) scaleY(1.06) translateZ(0)",
                        transformOrigin: "center",
                        imageRendering: "auto",
                        backfaceVisibility: "hidden"
                    }}
                    quality={100}
                    priority
                />
            ) : (
                <div style={{ padding: "16% 8%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                    <div style={{ marginTop: "1rem" }}>
                        <span className="font-semibold text-gray-500" style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>{authorName}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-black" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", lineHeight: "1.1" }}>{title}</h3>
                        {subtitle && <p className="mt-2 text-gray-500" style={{ fontSize: "0.6rem" }}>{subtitle}</p>}
                    </div>
                    <div className="flex flex-col items-center gap-1 pb-2">
                        <AfrLogoBadge size={14} />
                    </div>
                </div>
            )}
        </div>
    );
}
