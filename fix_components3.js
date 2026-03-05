const fs = require('fs');

let path = 'src/components/BookCover.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/border border-gray-300 /g, 'border-2 border-gray-150 shadow-sm ');

fs.writeFileSync(path, content);
