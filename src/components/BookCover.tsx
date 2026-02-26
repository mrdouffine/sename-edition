/* eslint-disable react/no-unescaped-entities */

interface BookCoverProps {
    title: string;
    subtitle?: string;
    authorName?: string;
    variant?: "light" | "dark";
    className?: string;
}

export default function BookCover({
    title,
    subtitle,
    authorName = "sename",
    variant = "light",
    className = "",
}: BookCoverProps) {
    const bgColor = variant === "dark" ? "#e8e8e0" : "#ffffff";
    const textColor = "#1a1a1a";

    return (
        <div
            className={`relative flex flex-col justify-between overflow-hidden ${className}`}
            style={{
                backgroundColor: bgColor,
                aspectRatio: "3 / 4",
                minHeight: 320,
                padding: "2rem 1.5rem",
            }}
        >
            {/* Author name */}
            <div className="text-right">
                <span
                    className="italic tracking-wide"
                    style={{ fontSize: "0.85rem", color: "#666" }}
                >
                    {authorName}
                </span>
            </div>

            {/* Title block */}
            <div className="flex-1 flex flex-col justify-center gap-2 py-6">
                <h3
                    className="font-black leading-[1.05]"
                    style={{
                        fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                        color: textColor,
                        letterSpacing: "-0.03em",
                    }}
                >
                    {title}
                </h3>
                {subtitle && (
                    <p
                        className="uppercase tracking-[0.15em] font-medium"
                        style={{
                            fontSize: "clamp(0.6rem, 1.2vw, 0.85rem)",
                            color: "#888",
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Bottom details */}
            <div className="flex flex-col items-center gap-2 pb-2">
                <div className="flex flex-col items-center text-center" style={{ fontSize: "0.55rem", color: "#aaa", letterSpacing: "0.15em" }}>
                    <span className="uppercase">essai</span>
                    <span className="uppercase">l'africaine</span>
                </div>
                {/* Small grid icon */}
                <div className="grid grid-cols-3 gap-[3px]" style={{ width: 22 }}>
                    {[...Array(9)].map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square rounded-[1px]"
                            style={{ backgroundColor: i % 2 === 0 ? textColor : "transparent", width: 5, height: 5 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
