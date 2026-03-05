const fs = require('fs');

let path = 'src/components/BookCover.tsx';
let content = fs.readFileSync(path, 'utf8');

// The image for "le centre de flamme" has a YELLOW border around text! Wait, that's what the image shows:
// A yellow border on the left and bottom of the text.
// No, the user meant: "tu ne vois pas les bordurs?"
// The user probably means the overall yellow border of the covers *grid items*.
// Let's make sure the icon matches: "disponible en precommande" has a hourglass in the user image. Matches our UI exactly. 
// Let's make sure "à l'endroit  shows twice under Pre-commande as in user image.
// Or the user wants exactly the layout for "ce qui demeure" to have grey border? 
// No, the *screenshots* the user provided show thick yellow borders on ALL cards in the grid.
// Let's modify the BookCover to simply have exactly what is shown:
// In the user's second screenshot: "le Centre de Flammes" has a yellow border on left and bottom *only* inside the cover?
// Wait, the user first provided an image showing: 
// A thick yellow border spanning Left and Bottom side of the content of "le Centre de Flammes". Let's recreate that detail!

content = content.replace(/if \(slug === "le-centre-de-flammes"\) \{[\s\S]*?return \([\s\S]*?<div className=\{`relative[\s\S]*?\{ backgroundColor: bgColor, aspectRatio: "3 \/ 4", width: "100%", padding: "10% 8%" \}\}>/g, (match) => {
    return `if (slug === "le-centre-de-flammes") {
        return (
            <div className={\`relative flex flex-col justify-between overflow-hidden bg-white border border-gray-300 \${className}\`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", padding: "10% 8%", position: "relative" }}>
                {/* Yellow angle detail */}
                <div style={{ position: "absolute", bottom: "10%", left: "10%", height: "70%", width: "80%", borderLeft: "6px solid #fbbf24", borderBottom: "6px solid #fbbf24", pointerEvents: "none" }}></div>
                <div style={{ zIndex: 10, display: "flex", flexDirection: "column", height: "100%" }}>`;
});

content = content.replace(/<div className="flex flex-col items-center gap-1 pb-2">[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}/g, (match) => {
    if (match.includes("poésie")) {
        return `<div className="flex flex-col items-center gap-1 pb-2">
                    <span className="uppercase font-bold" style={{ fontSize: "0.5rem", color: "#888", letterSpacing: "0.15em" }}>poésie</span>
                    <span className="font-medium" style={{ fontSize: "0.45rem", color: "#888", letterSpacing: "0.05em" }}>L'Africaine</span>
                    <div className="grid grid-cols-3 gap-[2px] mt-2" style={{ width: 14 }}>
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="aspect-square bg-black" style={{ width: 3, height: 3, opacity: [0,2,4].includes(i) ? 0 : 1 }} />
                        ))}
                    </div>
                </div>
                </div>
            </div>
        );
    }`;
    }
    return match;
});

// "à l'endroit  has a "à" in yellow and "l'endroit !" in yellow. The user image shows "à l'endroit  repeated. We just need to add duplicates of "à l'endroit !" to mockBooks
// Just duplicate it once more in mockboks

fs.writeFileSync(path, content);
