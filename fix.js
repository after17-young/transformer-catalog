const fs = require('fs');
let c = fs.readFileSync('C:/Users/15164/AppData/Local/Temp/transformer-catalog/js/products.js', 'utf8');
let lines = c.split('\n');
let result = [];
let skip = false;
let deleted = 0;

for (let i = 0; i < lines.length; i++) {
  let l = lines[i];

  // Product start lines that should be REMOVED (all current-related except post/lzzbj9 and post/lzzbj18)
  let shouldSkip = false;
  if (l.includes("type: 'current'")) shouldSkip = true;        // standard current CTs
  if (l.includes("type: 'rail_ct'")) shouldSkip = true;        // rail current CTs
  if (l.includes("type: 'combined'")) shouldSkip = true;       // combined
  if (l.includes("type: 'zero'")) shouldSkip = true;           // zero-sequence
  if (l.includes("series: 'lzzb9'")) shouldSkip = true;        // lzzb9 series products

  if (shouldSkip) {
    skip = true;
    deleted++;
    continue;
  }

  if (skip && l.trim() === '},') {
    skip = false;
    continue;
  }

  if (!skip) result.push(l);
}

fs.writeFileSync('C:/Users/15164/AppData/Local/Temp/transformer-catalog/js/products.js', result.join('\n'));
console.log('Deleted ' + deleted + ' product blocks');
