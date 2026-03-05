const fs = require('fs');
let content = fs.readFileSync('src/app/ouvrages/page.tsx', 'utf8');

// The replacement should add slug prop to BookCover invocations
content = content.replace(/<BookCover\s+title=\{book\.title\}/g, '<BookCover\n                                            slug={book.slug}\n                                            title={book.title}');
content = content.replace(/<BookCover\s+title=\{project\.title\}/g, '<BookCover\n                                            slug={project.slug}\n                                            title={project.title}');
content = content.replace(/<BookCover\s+title=\{featuredBook\.title\}/g, '<BookCover\n                                        slug={featuredBook.slug}\n                                        title={featuredBook.title}');

fs.writeFileSync('src/app/ouvrages/page.tsx', content);

let detailContent = fs.readFileSync('src/app/ouvrages/[slug]/page.tsx', 'utf8');
detailContent = detailContent.replace(/<BookCover\s+title=\{book\.title\}/g, '<BookCover\n                slug={book.slug}\n                title={book.title}');
fs.writeFileSync('src/app/ouvrages/[slug]/page.tsx', detailContent);
