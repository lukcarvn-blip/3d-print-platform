const { JSDOM } = require('jsdom');
const fs = require('fs');

let html = fs.readFileSync('drops/index.html', 'utf8');

const dbjs = fs.readFileSync('shared/db.js', 'utf8');
const authjs = fs.readFileSync('shared/auth.js', 'utf8');
const appjs = fs.readFileSync('shared/app.js', 'utf8');

html = html.replace('<script src="/shared/db.js"></script>', '<script>' + dbjs + '</script>');
html = html.replace('<script src="/shared/auth.js"></script>', '<script>' + authjs + '</script>');
html = html.replace('<script src="/shared/app.js"></script>', '<script>' + appjs + '</script>');

const dom = new JSDOM(html, {
  url: 'http://localhost/drops/',
  runScripts: 'dangerously',
  resources: 'usable'
});

dom.window.onerror = function(msg, url, line, col, error) {
  console.log('JSDOM ERROR:', msg, line, col);
};

dom.window.document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired!');
});

setTimeout(() => {
  console.log('Sidebar inner:', dom.window.document.querySelector('.sidebar') ? 'EXISTS' : 'NONE');
  console.log('Header actions inner:', dom.window.document.querySelector('.header-actions') ? dom.window.document.querySelector('.header-actions').innerHTML : 'NONE');
  process.exit(0);
}, 3000);
