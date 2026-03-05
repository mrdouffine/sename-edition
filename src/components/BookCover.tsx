/* eslint-disable react/no-unescaped-entities */

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
    const baseTextColor = "#1a1a1a";
    const textColor = titleColor || baseTextColor;

    // Custom layouts based on slug to match images exactly
    if (slug === "decoloniser-le-futur") {
        return (
            <div className={`relative flex flex-col justify-between overflow-hidden bg-white border-4 border-[#e9e9e9] shadow-sm ${className}`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", padding: "12% 8%" }}>
                <div style={{ textAlign: "center", paddingLeft: "25%", marginTop: "1rem" }}>
                    <span className="font-black text-gray-500" style={{ fontSize: "0.85rem", letterSpacing: "0.05em" }}>sename</span>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center text-center mt-4">
                    <h3 className="font-bold tracking-tight" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", color: "#FFF100", lineHeight: "1.1", marginBottom: "-0.2rem" }}>décoloniser</h3>
                    <h3 className="font-normal" style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#FFF100", lineHeight: "1.1" }}>le Futur</h3>
                    <p className="uppercase mt-2 font-bold" style={{ fontSize: "0.6rem", color: "#FFF100", letterSpacing: "0.05em" }}>
                        CARNETS DE CONFINEMENT
                    </p>
                </div>
                <div className="flex flex-col items-center gap-1 pb-4">
                    <span className="uppercase font-extrabold" style={{ fontSize: "0.45rem", color: "#000", letterSpacing: "0.2em" }}>essai</span>
                    <span className="font-bold" style={{ fontSize: "0.4rem", color: "#000", letterSpacing: "0.05em" }}>L'Africaine</span>
                    <AfrLogoBadge size={14} />
                </div>
            </div>
        );
    }

    if (slug === "le-centre-de-flammes") {
        return (
            <div className={`relative flex flex-col justify-between overflow-hidden bg-white border-2 border-gray-150 shadow-sm ${className}`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", padding: "16% 8%", position: "relative" }}>
                <div style={{ zIndex: 10, display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <span className="font-semibold text-gray-500" style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>sename</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center mt-4">
                        <h3 className="font-bold" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", color: textColor, lineHeight: "1.2" }}>le Centre</h3>
                        <h3 className="font-bold" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", color: textColor, lineHeight: "1.2", marginTop: "-0.2rem" }}>de Flammes</h3>
                        <p className="mt-3 font-semibold" style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "0.02em" }}>
                            Livre d'une sortie au jour
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1 pb-2">
                        <span className="uppercase font-bold" style={{ fontSize: "0.5rem", color: "#888", letterSpacing: "0.15em" }}>poésie</span>
                        <span className="font-medium" style={{ fontSize: "0.45rem", color: "#888", letterSpacing: "0.05em" }}>L'Africaine</span>
                        <div className="grid grid-cols-3 gap-[2px] mt-2" style={{ width: 14 }}>
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="aspect-square bg-black" style={{ width: 3, height: 3, opacity: [0, 2, 4].includes(i) ? 0 : 1 }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (slug === "ce-qui-demeure" || slug === "a-l-endroit") {
        const titleLines = slug === "ce-qui-demeure" ? ["ce qui", "demeure"] : ["à", "l'endroit !"];
        return (
            <div className={`relative flex flex-col justify-between overflow-hidden bg-white border-4 border-[#e9e9e9] shadow-sm ${className}`} style={{ backgroundColor: "#ffffff", aspectRatio: "3 / 4", width: "100%", padding: "12% 8%" }}>
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <span className="font-bold text-gray-600" style={{ fontSize: "0.8rem", letterSpacing: "0.02em" }}>sename</span>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center text-center pb-8">
                    <h3 className="font-normal" style={{ fontSize: "clamp(2.5rem, 4vw, 3.2rem)", color: "#FFFF00", lineHeight: "1.1" }}>{titleLines[0]}</h3>
                    <h3 className="font-normal" style={{ fontSize: "clamp(2.5rem, 4vw, 3.2rem)", color: "#FFFF00", lineHeight: "1.1" }}>{titleLines[1]}</h3>
                </div>
                <div className="flex flex-col items-center gap-1 pb-2">
                    <span className="uppercase font-bold" style={{ fontSize: "0.5rem", color: "#333", letterSpacing: "0.15em" }}>essai</span>
                    <span className="font-medium" style={{ fontSize: "0.45rem", color: "#666", letterSpacing: "0.05em" }}>L'Africaine</span>
                    <div className="grid grid-cols-3 gap-[3px] mt-2 mb-1" style={{ width: 18 }}>
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="aspect-square bg-black rounded-[1px]" style={{ width: 4, height: 4 }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (slug === "cosmo-architecture") {
        return (
            <div className={`relative flex flex-col justify-between overflow-hidden bg-white border-4 border-[#e9e9e9] shadow-sm ${className}`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", padding: "16% 8%" }}>
                <div style={{ textAlign: "right", marginTop: "1rem", marginRight: "1rem" }}>
                    <span className="font-semibold text-gray-500" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>sename</span>
                </div>
                <div className="flex-1 flex flex-col justify-center text-left pl-6">
                    <p className="font-semibold text-gray-700" style={{ fontSize: "0.6rem" }}>principes d'une</p>
                    <h3 className="font-semibold -ml-1" style={{ fontSize: "clamp(2.2rem, 3.5vw, 2.8rem)", color: textColor, lineHeight: "1" }}>cosmo</h3>
                    <h3 className="font-normal -ml-1" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", color: textColor, lineHeight: "1.2" }}>architecture</h3>
                </div>
                <div className="flex flex-col items-center gap-1 pb-2">
                    <span className="uppercase font-bold" style={{ fontSize: "0.4rem", color: "#666", letterSpacing: "0.15em" }}>arts</span>
                    <span className="font-medium" style={{ fontSize: "0.35rem", color: "#999", letterSpacing: "0.05em" }}>L'Africaine</span>
                    <AfrLogoBadge size={16} />
                </div>
            </div>
        );
    }

    if (slug === "comprendre-architecture-afrique") {
        return (
            <div className={`relative flex flex-col justify-between overflow-hidden bg-white border-4 border-[#e9e9e9] shadow-sm ${className}`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", padding: "16% 8%" }}>
                <div style={{ textAlign: "right", marginTop: "1rem", marginRight: "1rem" }}>
                    <span className="font-semibold text-gray-500" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>sename</span>
                </div>
                <div className="flex-1 flex flex-col justify-center text-left pl-6">
                    <p className="font-semibold text-gray-700" style={{ fontSize: "0.8rem", marginBottom: "-0.2rem" }}>comprendre</p>
                    <h3 className="font-normal -ml-1" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", color: textColor, lineHeight: "1.1" }}>l'architecture</h3>
                    <h3 className="font-normal -ml-1" style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)", color: textColor, lineHeight: "1.1" }}>en afrique noire</h3>
                </div>
                <div className="flex flex-col items-center gap-1 pb-2">
                    <span className="uppercase font-bold" style={{ fontSize: "0.4rem", color: "#666", letterSpacing: "0.15em" }}>arts</span>
                    <span className="font-medium" style={{ fontSize: "0.35rem", color: "#999", letterSpacing: "0.05em" }}>L'Africaine</span>
                    <AfrLogoBadge size={16} />
                </div>
            </div>
        );
    }

    if (slug === "esthetiques-du-feminin") {
        return (
            <div className={`relative flex flex-col justify-between overflow-hidden bg-white border-4 border-[#e9e9e9] shadow-sm ${className}`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", padding: "16% 8%" }}>
                <div style={{ textAlign: "right", marginTop: "1rem", marginRight: "1rem" }}>
                    <span className="font-semibold text-gray-500" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>sename</span>
                </div>
                <div className="flex-1 flex flex-col justify-center text-center">
                    <h3 className="font-normal" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", color: textColor, lineHeight: "1.1" }}>Esthétiques</h3>
                    <h3 className="font-bold" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", color: textColor, lineHeight: "1.1" }}>du Féminin</h3>
                    <p className="font-medium mt-1" style={{ fontSize: "0.6rem", color: "#777" }}>dans les arts nègres</p>
                </div>
                <div className="flex flex-col items-center gap-1 pb-2">
                    <span className="uppercase font-bold" style={{ fontSize: "0.4rem", color: "#666", letterSpacing: "0.15em" }}>arts</span>
                    <span className="font-medium" style={{ fontSize: "0.35rem", color: "#999", letterSpacing: "0.05em" }}>L'Africaine</span>
                    <AfrLogoBadge size={16} />
                </div>
            </div>
        );
    }

    // Default fallback layout for others
    return (
        <div className={`relative flex flex-col justify-between overflow-hidden bg-white border-4 border-[#e9e9e9] shadow-sm ${className}`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", padding: "16% 8%" }}>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <span className="font-semibold text-gray-500" style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>{authorName}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <h3 className="font-bold" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", color: textColor, lineHeight: "1.1" }}>{title}</h3>
                {subtitle && <p className="mt-2 text-gray-500" style={{ fontSize: "0.6rem" }}>{subtitle}</p>}
            </div>
            <div className="flex flex-col items-center gap-1 pb-2">
                <AfrLogoBadge size={14} />
            </div>
        </div>
    );
}
