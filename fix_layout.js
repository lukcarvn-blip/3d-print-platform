const fs = require('fs');

// 1. Fix shared/style.css
let style = fs.readFileSync('shared/style.css', 'utf8');
// Remove width: 100%; from .main-content
style = style.replace(/\.main-content\s*\{[\s\S]*?margin-left:\s*var\(--sidebar-w\);/g, (match) => {
    return match.replace(/width:\s*100%;\s*/g, '');
});
// Ensure it's replaced
if (!style.includes('width: 100%') || style.match(/\.main-content\s*\{[^}]*width:\s*100%;/)) {
    console.log("Replacing manually");
    style = style.replace(/\.main-content\s*\{\s*flex:\s*1;\s*min-width:\s*0;\s*width:\s*100%;/g, '.main-content {\n    flex: 1;\n    min-width: 0;');
}
fs.writeFileSync('shared/style.css', style, 'utf8');
console.log('Fixed shared/style.css');

// 2. Fix drops/detail.html
let detail = fs.readFileSync('drops/detail.html', 'utf8');

// detail-wrap
detail = detail.replace(
  /\.detail-wrap\s*\{\s*max-width:\s*1280px;\s*margin:\s*0;\s*padding:\s*24px\s*24px\s*0;/g,
  `.detail-wrap {\n      max-width: 100%;\n      margin: 0;\n      padding: 24px 40px 0;`
);

// desc-specs-section
detail = detail.replace(
  /\.desc-specs-section\s*\{\s*max-width:\s*100%;\s*margin:\s*0;\s*padding:\s*40px\s*24px\s*0;/g,
  `.desc-specs-section {\n      max-width: 100%;\n      margin: 0;\n      padding: 40px 40px 0;`
);

// bottom-section
detail = detail.replace(
  /\.bottom-section\s*\{\s*max-width:\s*100%;\s*width:\s*100%;\s*margin:\s*0;\s*padding:\s*40px\s*24px\s*80px;/g,
  `.bottom-section { max-width: 100%; width: 100%; margin: 0; padding: 40px 40px 80px;`
);

fs.writeFileSync('drops/detail.html', detail, 'utf8');
console.log('Fixed drops/detail.html');

