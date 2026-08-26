const fs = require('fs');
let html = fs.readFileSync('admin/index.html', 'utf8');
html = html.replace(/\$\{d\.retailPrice \? d\.retailPrice\.toLocaleString\('vi-VN'\) \+ ' VN.*?' : 'Li.*?n h.*?'\}/g, "${d.retailPrice ? DB.formatVND(d.retailPrice) : 'Liên hệ'}");
fs.writeFileSync('admin/index.html', html, 'utf8');
