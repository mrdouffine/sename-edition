const fs = require('fs');

function fixSections(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove the thick yellow borders around covers, replace with simple layout and no yellow border
    content = content.replace(/className="relative border-\[8px\] border-yellow-400 shadow-md mb-4 transition-transform hover:scale-105" style=\{\{ width: 220 \}\}/g, 
        'className="relative mb-4 transition-transform hover:scale-105" style={{ width: 220 }}'
    );
    
    // Also the featured one
    content = content.replace(/className="border-\[12px\] border-yellow-400 shadow-2xl" style=\{\{ maxWidth: 450 \}\}/g, 
        'className="shadow-2xl" style={{ maxWidth: 450 }}'
    );

    // 2. Fix Section titles: "A la une :" and "Ouvrages disponibles :"
    // They are fine since they are bg-yellow-400, but we can make them match closer
    content = content.replace(/className="bg-yellow-400 inline-block px-4 py-1 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl"/g, 
        'className="bg-[#FFEA00] inline-block px-3 py-1 text-xl font-medium tracking-wide text-black sm:text-2xl"'
    );
    // Actually the user image shows: "Ouvrages disponibles :" not uppercase.
    // Let's replace uppercase with normal case for titles
    content = content.replace(/>\s*([A|O][^<]+)\s*:\s*<\/h2>/g, (match, p1) => {
        return `>${p1 === "A la une " ? "A la une" : "Ouvrages disponibles"} :</h2>`;
    });
    content = content.replace(/uppercase tracking-tight/, 'tracking-tight');

    // 3. Fix the icons to be left aligned
    // Currently: <div className="flex flex-col items-center gap-4">
    // Replace with: <div className="flex flex-col items-start gap-4 ml-4">
    content = content.replace(/className="flex flex-col items-center gap-4"/g, 'className="flex flex-col items-start gap-3 ml-4 sm:ml-12"');
    
    // Change circle color
    content = content.replace(/bg-yellow-400 shadow-lg/g, 'bg-[#FFEA00]');
    
    // Resize circle
    content = content.replace(/h-24 w-24/g, 'h-16 w-16');
    content = content.replace(/text-5xl/g, 'text-3xl');

    // 4. Update the text alignment
    content = content.replace(/<p className="text-lg font-medium text-gray-900">/g, '<p className="text-sm font-medium text-gray-900 ml-4 lg:ml-8">');
    

    fs.writeFileSync(filePath, content);
}

fixSections('src/app/ouvrages/page.tsx');
