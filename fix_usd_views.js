const fs = require('fs');

// 1. Fix DB.js
let db = fs.readFileSync('shared/db.js', 'utf8');

// Remove * 1000 from formatVND
db = db.replace(/Number\(n\) \* 1000/g, 'Number(n)');

// Multiply seed prices by 1000
db = db.replace(/retailPrice:\s*([\d\.]+)/g, (match, p1) => `retailPrice: ${parseFloat(p1) * 1000}`);
db = db.replace(/price:\s*([\d\.]+)/g, (match, p1) => `price: ${parseFloat(p1) * 1000}`);
db = db.replace(/budget:\s*([\d\.]+)/g, (match, p1) => `budget: ${parseFloat(p1) * 1000}`);

fs.writeFileSync('shared/db.js', db, 'utf8');
console.log('Fixed shared/db.js');

// 2. Fix admin/index.html to use DB.formatVND
let adminIndex = fs.readFileSync('admin/index.html', 'utf8');
adminIndex = adminIndex.replace(
  /\$\{d\.retailPrice \? d\.retailPrice\.toLocaleString\('vi-VN'\) \+ ' VNĐ' : 'Liên hệ'\}/g,
  "${d.retailPrice ? DB.formatVND(d.retailPrice) : 'Liên hệ'}"
);
fs.writeFileSync('admin/index.html', adminIndex, 'utf8');
console.log('Fixed admin/index.html');

// 3. Add Views field to admin/edit.html
let adminEdit = fs.readFileSync('admin/edit.html', 'utf8');
// Add input field
adminEdit = adminEdit.replace(
  /<div class="form-group">\s*<label>Tồn Kho \(SL\)<\/label>\s*<input type="number" class="form-control" id="f-stock-qty" placeholder="Để trống = tính theo Asks" min="0">\s*<\/div>/g,
  `<div class="form-group">
                <label>Tồn Kho (SL)</label>
                <input type="number" class="form-control" id="f-stock-qty" placeholder="Để trống = tính theo Asks" min="0">
              </div>
              <div class="form-group">
                <label>Lượt xem (Views)</label>
                <input type="number" class="form-control" id="f-views" placeholder="Để trống = auto sinh theo lượt thích" min="0">
              </div>`
);
// Bind data
adminEdit = adminEdit.replace(
  /document\.getElementById\('f-stock-qty'\)\.value = d\.stockQty \|\| '';/g,
  `document.getElementById('f-stock-qty').value = d.stockQty || '';
          document.getElementById('f-views').value = d.views || '';`
);
// Save data
adminEdit = adminEdit.replace(
  /const stockQty = document\.getElementById\('f-stock-qty'\)\.value;/g,
  `const stockQty = document.getElementById('f-stock-qty').value;
    const views = document.getElementById('f-views').value;`
);
adminEdit = adminEdit.replace(
  /stockQty: stockQty,/g,
  `stockQty: stockQty,
      views: views ? parseInt(views) : null,`
);
fs.writeFileSync('admin/edit.html', adminEdit, 'utf8');
console.log('Fixed admin/edit.html');

// 4. Also fix drops/detail.html to not auto-generate if views is set, wait detail.html already does: `drop.views || (likesCount * 14 + 105)`
// That's perfect.
