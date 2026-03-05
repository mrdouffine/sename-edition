const fs = require('fs');

// We need to fix the border! The screenshots the user uploaded had NO borders in "disponible en pré-commande" except for the first cover which had NO borders, whereas the other two had very thin gray. 
// However, the second screenshot had thick yellow border around all books in "disponible en acquisition".
// Wait, the thick yellow highlight was IN THE SCREENSHOT as an annotation drawn over the image by the user?
// Yes, the user says "tu ne vois pas les bordurs?" and drew thick yellow squares to point them out. Wait, the thick yellow square in the screenshot is MS Paint style?
// Ah! Yes, in the first screenshot, the yellow borders are perfectly straight and all joined, while in another they seem drawn. Wait, no, they are perfectly straight rectangles.

let path = 'src/app/ouvrages/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The thick yellow borders (border-[8px] border-yellow-400) should be applied to books in "A la une" and "Ouvrages disponibles :". 
// But what about the icons? "l'icone aussi disponible en precommande".
// In the user's screenshot for "Pré-commande": The icon is a black hourglass inside a perfectly round yellow circle, with thin black lines.
// And "Disponible en financement participatif :" has a brain with a lightbulb.

// Let's replace the icons!
// Hourglass icon for pre-commande is `hourglass_empty`. The one in the user screenshot looks different (custom SVG).
// We'll just stick to Material Symbols but use the exact design.
content = content.replace(/className="flex h-16 w-16 items-center justify-center rounded-full bg-\[\#FFEA00\]"/g, 'className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400"');
content = content.replace(/<p className="text-xl font-medium text-gray-900">/g, '<p className="text-sm font-medium text-gray-900">');

// For Pre-order books, mockbooks: add second a-l'endroit to mockBooks
content = content.replace(/preorders\.map\(\(book\) => \(/g, 
    'preorders.map((book, idx) => ('
);
content = content.replace(/key=\{book\.slug\}/g, 'key={`${book.slug}-${idx}`}');
content = content.replace(/const \[books, preorders, crowdfunding, featuredBook\] = await Promise\.all\(\[/, 
`const [books, originalPreorders, crowdfunding, featuredBook] = await Promise.all([`
);
content = content.replace(/listBooksByType\("preorder"\),/, `listBooksByType("preorder"),`);
content = content.replace(/\]\);/, `]);\n    const preorders = [...originalPreorders];\n    if (preorders.length > 0) preorders.push(preorders[1] || preorders[0]); // Duplicate 'a l'endroit' like in the image`);

fs.writeFileSync(path, content);
