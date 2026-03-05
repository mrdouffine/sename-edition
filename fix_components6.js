const fs = require('fs');
let path = 'src/components/BookCover.tsx';
let content = fs.readFileSync(path, 'utf8');

// I also need to ensure that the aspect ratio and design is VERY close.
content = content.replace(/padding: "10% 8%"/g, 'padding: "16% 8%"');

fs.writeFileSync(path, content);
