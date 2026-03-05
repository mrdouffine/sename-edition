const fs = require('fs');
let path = 'src/app/ouvrages/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const \[books, originalPreorders, crowdfunding, featuredBook\] = await Promise\.all\(\[/, `const [books, originalPreorders, crowdfunding, featuredBook] = await Promise.all([`);

fs.writeFileSync(path, content);
