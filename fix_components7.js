const fs = require('fs');

let path = 'src/app/ouvrages/[slug]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// I also need to apply the yellow border to the book detail page picture
content = content.replace(/className="w-full h-auto object-cover shadow-md"/g, 
'className="w-full h-auto object-cover shadow-md border-[6px] border-[#FFE500] p-1"');

// Wait we replaced img with BookCover in detail page previously?
content = content.replace(/<img\s*src=\{book\.coverImage\}\s*alt=\{book\.title\}\s*className="w-full h-auto object-cover shadow-md"\s*\/>/g, 
`<BookCover
                slug={book.slug}
                title={book.title}
                subtitle={book.subtitle}
                authorName={book.authorName}
                variant={(book as any).coverVariant === "dark" ? "dark" : "light"}
                titleColor={(book as any).titleColor}
                className="w-full shadow-md border-[8px] border-[#FFE500] p-1"
              />`);

fs.writeFileSync(path, content);
