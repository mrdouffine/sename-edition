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
        // "decoloniser-le-futur": "decoloniser-le-futur.png",
        // "le-centre-de-flammes": "le-centre-des-flammes.png",
        // "ce-qui-demeure": "ce-qui-demeure.png",
        // "a-l-endroit": "a-lendroit.png",
        // "cosmo-architecture": "principe-cosmo-architecture.jpeg",
        // "comprendre-architecture-afrique": "comprendre-architecture-afrique-noire.jpeg",
        // "esthetiques-du-feminin": "esthetique-du-feminin.jpeg",
        // "girations": "girations.png",
        // "rencontres": "rencontres.jpeg"
    };

    const imageFile = slug ? imageMap[slug] : undefined;

    return (
        <div className={`relative flex flex-col justify-between overflow-hidden ${className}`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", position: "relative" }}>
            {imageFile ? (
                <Image
                    src={`/articles/${imageFile}`}
                    alt={title || "Cover image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover contrast-[1.02] brightness-[1.01]"
                    style={{
                        imageRendering: "auto",
                        WebkitBackfaceVisibility: "hidden",
                        backfaceVisibility: "hidden"
                    }}
                    quality={100}
                    priority
                    unoptimized
                />
            ) : (
                <div style={{ padding: "12% 8%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", backgroundColor: bgColor }}>
                    <div style={{ marginTop: "0.5rem" }}>
                        <span className="text-gray-900/60 lowercase" style={{ fontSize: "0.9rem", letterSpacing: "0.15em", fontWeight: 500 }}>{authorName}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <h3 className="lowercase" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", lineHeight: "1", fontWeight: 700, color: "#FFEA00", letterSpacing: "-0.02em" }}>{title}</h3>
                        {subtitle && <p className="mt-3 lowercase italic text-gray-800" style={{ fontSize: "0.65rem", letterSpacing: "0.05em", fontWeight: 400 }}>{subtitle}</p>}
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
            )}
        </div>
    );
}
