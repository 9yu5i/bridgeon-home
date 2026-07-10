const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "beauty.html");
let html = fs.readFileSync(filePath, "utf8");

const marker = '\n            </div>\n\n            <nav class="listing-pagination desktop-only"';
const idx = html.indexOf(marker);
if (idx === -1) {
  console.error("marker not found");
  process.exit(1);
}

const gridStart = html.indexOf('<div class="listing-grid">');
const gridContentStart = html.indexOf(">", gridStart) + 1;
const gridInner = html.slice(gridContentStart, idx);
const cardRegex = /<article class="listing-card">[\s\S]*?<\/article>/g;
const cards = gridInner.match(cardRegex) || [];

console.log("cards found:", cards.length);
if (cards.length !== 8) {
  process.exit(1);
}

const duplicate = "\n\n              " + cards.join("\n\n              ");
html = html.slice(0, idx) + duplicate + html.slice(idx);
fs.writeFileSync(filePath, html);
console.log("added 8 cards, total 16");
