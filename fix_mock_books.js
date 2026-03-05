const fs = require('fs');

let path = 'src/lib/data/mockBooks.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\/images\/covers\/placeholder\.jpg/g, function(match, offset, string) {
    // find the slug
    const start = string.lastIndexOf('slug: "', offset) + 7;
    const end = string.indexOf('",', start);
    if (start > 6 && end > start) {
        const slug = string.substring(start, end);
        return `/images/covers/${slug}.png`;
    }
    return match;
});

fs.writeFileSync(path, content);
