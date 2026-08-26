const fs = require('fs');
let html = fs.readFileSync('drops/detail.html', 'utf8');

const oldElse = \      btnText.textContent = '�?T GIA C�NG (BID) - ' + DB.formatVND(calculatedPrice);
      desc.textContent = 'H?t h�ng c� s?n. B?m �?t Gia C�ng d? xu?ng in m?i. (Ho?c n?u c� s?n H�ng Market ? tr�n, b?n c� th? MUA MARKET ngay).';
      isCustom = true;\;

const newElse = \      btnText.textContent = '�?T GIA C�NG (BID) - ' + DB.formatVND(calculatedPrice);
      if (drop && drop.stockQty && drop.stockQty > 0) {
        desc.textContent = 'T�y ch?nh v?t li?u/k�ch thu?c? B?m �?t Gia C�ng d? xu?ng in m?i.';
      } else {
        desc.textContent = 'H?t h�ng c� s?n. B?m �?t Gia C�ng d? xu?ng in m?i.';
      }
      isCustom = true;\;

// Also check if the previous replace actually worked
if (html.includes(oldElse)) {
    html = html.replace(oldElse, newElse);
} else {
    // fallback if it didn't
    const oldElseOriginal = \      btnText.textContent = '�?T GIA C�NG (BID) - ' + DB.formatVND(calculatedPrice);
      desc.textContent = 'H?t h�ng c� s?n. B?m �?t Gia C�ng d? xu?ng in m?i.';
      isCustom = true;\;
    html = html.replace(oldElseOriginal, newElse);
}

fs.writeFileSync('drops/detail.html', html, 'utf8');
console.log('Fixed!');
