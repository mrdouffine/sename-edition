const fs = require('fs');

let path = 'src/app/ouvrages/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// I need to add border-[4px] border-[#FFE500] 
content = content.replace(/className="relative border-\[8px\] border-yellow-400 p-1 mb-4 transition-transform hover:scale-105" style=\{\{ width: 220 \}\}/g, 
'className="relative border-[4px] border-[#FFE500] p-1 mb-4 transition-transform hover:scale-105" style={{ width: 240 }}');

content = content.replace(/className="border-\[12px\] border-yellow-400 p-1 shadow-2xl"/g, 
'className="border-[6px] border-[#FFE500] p-1 shadow-xl"');

fs.writeFileSync(path, content);
