const fs = require('fs');

let path = 'src/app/ouvrages/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The books need THICK yellow borders around them exactly like in the user's second set of screenshots
content = content.replace(/className="relative mb-4 transition-transform hover:scale-105" style=\{\{ width: 220 \}\}/g, 
'className="relative border-[4px] border-yellow-400 p-1 mb-4 transition-transform hover:scale-105" style={{ width: 240 }}');

content = content.replace(/className="shadow-2xl" style=\{\{ maxWidth: 450 \}\}/g, 
'className="border-[6px] border-yellow-400 p-1 shadow-2xl" style={{ maxWidth: 450 }}');

// Change titles to lower
content = content.replace(/A la une/g, "A la une");

// icons for the sections
// 1. Acquisition -> diamond 
// 2. Pre-commande -> hourglass -> User uses hourglass icon with specific design but we must settle on standard since css is hard
// Wait user said "tu ne vois pas les bordurs? l'icone aussi disponible en precommande".
// In their screenshot, the "A la une" has no icon.
// "Ouvrages disponibles :" has no icon.
// Then under it "Disponible en Acquisition" has a yellow circle with a Diamond icon inside.
// Then "Disponible en Pré-commande" has a yellow circle with an hourglass icon inside.
// Then "Disponible en financement participatif" has a yellow circle with a brain icon inside.

// I already have those! `diamond`, `hourglass_empty`, and `psychology`.
// Let's make sure the icon text is next to the icon, not below.

// "Ouvrages disponibles :" has background color yellow
content = content.replace(/className="bg-\[\#FFEA00\] inline-block px-3 py-1 text-xl font-medium tracking-wide text-black sm:text-2xl"/g, 
'className="bg-[#ffe500] inline-block px-2 text-[22px] font-medium tracking-wide text-black mb-8"');

fs.writeFileSync(path, content);
