const fs = require('fs');

let path = 'src/components/BookCover.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/if \(slug === "ce-qui-demeure" \|\| slug === "a-l-endroit"\) \{[\s\S]*?return \([\s\S]*?<div className=\{`relative[\s\S]*?\{ backgroundColor: bgColor, aspectRatio: "3 \/ 4", width: "100%", padding: "10% 8%" \}\}>/g, `if (slug === "ce-qui-demeure" || slug === "a-l-endroit") {
        const titleLines = slug === "ce-qui-demeure" ? ["ce qui", "demeure"] : ["à", "l'endroit !"];
        return (
            <div className={\`relative flex flex-col justify-between overflow-hidden bg-white border-2 border-gray-100 \${className}\`} style={{ backgroundColor: bgColor, aspectRatio: "3 / 4", width: "100%", padding: "12% 8%" }}>`);

content = content.replace(/className="font-medium" style=\{\{ fontSize: "clamp\(2rem, 3.5vw, 2.6rem\)", color: "#FDE047"/g, 'className="font-normal" style={{ fontSize: "clamp(2.5rem, 4vw, 3.2rem)", color: "#FFFF00"');

fs.writeFileSync(path, content);
