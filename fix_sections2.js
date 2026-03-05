const fs = require('fs');

function fixSections2(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add back the yellow borders to the covers. The user actually WANTS the thick yellow borders!
    content = content.replace(/className="relative mb-4 transition-transform hover:scale-105" style=\{\{ width: 220 \}\}/g, 
        'className="relative border-[8px] border-yellow-400 p-1 mb-4 transition-transform hover:scale-105" style={{ width: 220 }}'
    );
    
    // Also the featured one needs its yellow border back
    content = content.replace(/className="shadow-2xl" style=\{\{ maxWidth: 450 \}\}/g, 
        'className="border-[12px] border-yellow-400 p-1 shadow-2xl" style={{ maxWidth: 450 }}'
    );

    // Ensure titles backgrounds are yellow-400 and not text-[#FFEA00]
    content = content.replace(/bg-\[#FFEA00\]/g, 'bg-yellow-400');

    // Update the layout of "Disponible en [XXXX]" to precisely match the image
    // Image shows: Icon circle to the far left, text "Disponible en XXX" to its right
    content = content.replace(/<div className="flex flex-col items-start gap-3 ml-4 sm:ml-12">/g, 
        '<div className="flex flex-row items-center gap-6 ml-4 sm:ml-12">'
    );
    
    // The text "<p>Disponible en..." needs to not have ml-4/ml-8 since it's now in a flex-row with the icon
    content = content.replace(/<p className="text-sm font-medium text-gray-900 ml-4 lg:ml-8">/g, 
        '<p className="text-xl font-medium text-gray-900">'
    );
    
    // The previous text size was 3xl, icons should be smaller maybe, and the flex flex-row fixes the layout.

    fs.writeFileSync(filePath, content);
}

fixSections2('src/app/ouvrages/page.tsx');
