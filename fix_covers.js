// 1. Restore BookCover instead of img in src/app/ouvrages/page.tsx
const fs = require('fs');

function replaceImgWithBookCover(filePath, isSlug) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // In ouvrages/page.tsx
    content = content.replace(/<Link href={`\/ouvrages\/\$\{([^}]+)\.slug\}`} className="relative border-2 border-yellow-400 p-1 mb-4 transition-transform hover:scale-105">\s*<img\s*alt=\{[^\}]+\}\s*className="h-72 w-52 object-cover shadow-md"\s*src=\{([^\}]+)\.coverImage\}\s*\/>\s*<\/Link>/g, 
        (match, p1, p2) => {
            return `<Link href={\`/ouvrages/\${${p1}.slug}\`} className="relative border-[8px] border-yellow-400 shadow-md mb-4 transition-transform hover:scale-105" style={{ width: 220 }}>
                                        <BookCover
                                            title={${p1}.title}
                                            subtitle={${p1}.subtitle}
                                            authorName={${p1}.authorName}
                                            variant={(${p1} as any).coverVariant === "dark" ? "dark" : "light"}
                                            titleColor={(${p1} as any).titleColor}
                                        />
                                    </Link>`;
        }
    );

    // Also for featuredBook in ouvrages/page.tsx
    content = content.replace(/<div className="border-\[12px\] border-yellow-400 shadow-2xl">\s*<img\s*alt=\{featuredBook\.title\}\s*className="max-h-\[70vh\] w-auto object-contain"\s*src=\{featuredBook\.coverImage\}\s*\/>\s*<\/div>/g, 
        `<div className="border-[12px] border-yellow-400 shadow-2xl" style={{ maxWidth: 450 }}>
                                    <BookCover
                                        title={featuredBook.title}
                                        subtitle={featuredBook.subtitle}
                                        authorName={featuredBook.authorName}
                                        variant={(featuredBook as any).coverVariant === "dark" ? "dark" : "light"}
                                        titleColor={(featuredBook as any).titleColor}
                                    />
                                </div>`
    );

    // If it doesn't have BookCover import, add it
    if (!content.includes('import BookCover')) {
        content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport BookCover from "@/components/BookCover";');
    }

    fs.writeFileSync(filePath, content);
}

replaceImgWithBookCover('src/app/ouvrages/page.tsx', false);
