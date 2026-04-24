const fs = require('fs');

const filePath = '/Users/jonas/Developer/side-quest-generator/quests.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the content between [ and ]
const startBracket = content.indexOf('[');
const endBracket = content.lastIndexOf(']');

if (startBracket === -1 || endBracket === -1) {
    console.error("Could not find array brackets.");
    process.exit(1);
}

const dataStr = content.substring(startBracket, endBracket + 1);

let quests;
try {
    // Eval the array string
    quests = eval(dataStr);
} catch (e) {
    console.error("Failed to parse data string:", e);
    process.exit(1);
}

const categoryOrder = [
    "Mental", "Creative", "Adventure", "Social", "Physical", "Travel",
    "Netherlands", "Amsterdam", "South Holland", "Utrecht",
    "Cape Town", "Windhoek", "Dubai"
];

const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };

quests.sort((a, b) => {
    const catA = categoryOrder.indexOf(a.category);
    const catB = categoryOrder.indexOf(b.category);
    
    if (catA !== catB) return catA - catB;
    
    const diffA = difficultyOrder[a.difficulty] || 99;
    const diffB = difficultyOrder[b.difficulty] || 99;
    
    if (diffA !== diffB) return diffA - diffB;
    
    return a.title.localeCompare(b.title);
});

let newContent = "// ===== Quest Data =====\nconst quests = [\n";
let currentCategory = "";

quests.forEach(q => {
    if (q.category !== currentCategory) {
        currentCategory = q.category;
        newContent += `\n  // ===== ${currentCategory} =====\n`;
    }
    newContent += `  { title: ${JSON.stringify(q.title)}, desc: ${JSON.stringify(q.desc)}, category: ${JSON.stringify(q.category)}, difficulty: ${JSON.stringify(q.difficulty)}, xp: ${q.xp} },\n`;
});

newContent += "];\n";

fs.writeFileSync(filePath, newContent);
console.log(`Sorted ${quests.length} quests.`);
