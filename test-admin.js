const fs = require('fs');
const { JSDOM } = require('jsdom');

let html = fs.readFileSync('admin/index.html', 'utf8');
const dbjs = fs.readFileSync('shared/db.js', 'utf8');
const authjs = fs.readFileSync('shared/auth.js', 'utf8');
const appjs = fs.readFileSync('shared/app.js', 'utf8');

html = html.replace('<script src="/shared/db.js"></script>', '<script>' + dbjs + '</script>');
html = html.replace('<script src="/shared/auth.js"></script>', '<script>' + authjs + '</script>');
html = html.replace('<script src="/shared/app.js"></script>', '<script>' + appjs + '</script>');

const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/admin/' });
dom.window.onerror = (msg, url, line, col) => console.log('ERROR:', msg, line, col);

setTimeout(() => {
  const list = dom.window.document.getElementById('product-list');
  console.log('List content:', list ? list.innerHTML.trim() : 'NO LIST');
  process.exit(0);
}, 2000);
