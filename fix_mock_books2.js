const fs = require('fs');

let path = 'src/lib/data/mockBooks.ts';
let content = fs.readFileSync(path, 'utf8');

// Change Preorder Books to only "ce qui demeure" and "à l'endroit !"
// Right now "girations" is "preorder"
// Let's set "girations" to "direct"
content = content.replace(/slug: "girations",[\s\S]*?saleType: "preorder",/m, (match) => {
    return match.replace('"preorder"', '"direct"');
});
// Let's set "decoloniser-le-futur" to "direct"
content = content.replace(/slug: "decoloniser-le-futur",[\s\S]*?saleType: "preorder",/m, (match) => {
    return match.replace('"preorder"', '"direct"');
});

// "ce qui demeure" should be "preorder"
content = content.replace(/slug: "ce-qui-demeure",[\s\S]*?saleType: "direct",/m, (match) => {
    return match.replace('"direct"', '"preorder"');
});


fs.writeFileSync(path, content);
