// 100% yellow border on ALL book covers shown on screen

const fs = require('fs');

function applyBorder(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure we have the #FFE500 border on all grid items in ouvrages page
    content = content.replace(/className="relative mb-4 transition-transform hover:scale-105"/g, 'className="relative mb-4 transition-transform hover:scale-105 border-[4px] border-[#FFE500] p-1"');
    
    // There were some other versions added, let's just make sure
    content = content.replace(/className="relative border-\[4px\] border-yellow-400 p-1 mb-4/g, 'className="relative border-[4px] border-[#FFE500] p-1 mb-4');
    
    // Check if the icon for pre-commande is hourglass. Yes it is, but we want it EXACTLY in a circle
    content = content.replace(/hourglass_empty/g, 'hourglass_top');

    // Make sure "A la une :" is also yellow bg
    content = content.replace(/className="bg-yellow-400 inline-block/g, 'className="bg-[#FFE500] inline-block');

    fs.writeFileSync(filePath, content);
}

applyBorder('src/app/ouvrages/page.tsx');
