
// ══════════════════════════════════════════════════════════
//  GLOBAL STATE
// ══════════════════════════════════════════════════════════
DB.init();
BDB.init();

let drop = null, basePrice = 0, currentLowestAsk = null, calculatedPrice = 0;
let currentMatMult = 1, currentSizeMult = 1;
let currentMatName = 'PLA', currentSizeName = '300%', currentColorHex = '#ffffff';
let isCustom = false;
let galleryImages = [], galleryIndex = 0;

const SIZE_CM_MAP = { '300%': 21, '400%': 28, '1000%': 70 };

// Declare functions in global scope so onclick can access them
window.adaptImageBackground = function() {
  const img = document.getElementById('d-img');
  const container = document.getElementById('img-frame-container');
  const ambient = document.getElementById('img-ambient-bg');
  
  if (!img || !img.src || img.src.includes('no-image.jpg') || img.src.startsWith('data:image/gif')) {
    if (img.src.includes('no-image.jpg')) {
      container.style.background = '#0d1117';
      ambient.style.opacity = '0';
      img.classList.add('loaded');
      container.classList.remove('skeleton-bg');
    }
    return;
  }

  // Remove skeleton state
  img.classList.add('loaded');
  container.classList.remove('skeleton-bg');

  // 1. Try canvas to pick up solid background color from top-left pixel
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 100;
    canvas.height = img.naturalHeight || img.height || 100;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const p = ctx.getImageData(2, 2, 1, 1).data;
    
    // Check if not completely transparent
    if (p[3] > 10) {
      container.style.background = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
      ambient.style.opacity = '0';
      return; // Stop here if canvas success
    }
  } catch (e) {
    console.log('Canvas CORS blocked or empty. Falling back to ambient blur.');
  }

  // 2. Fallback: ambient blurred image
  container.style.background = '#0d1117';
  ambient.style.backgroundImage = `url(${img.src})`;
  ambient.style.opacity = '0.85';
};

window.selectMat = function(el, name, mult, desc) {
  currentMatMult = mult;
  currentMatName = name;
  document.querySelectorAll('.mat-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('mat-desc').innerHTML = desc.replace(/^([^:]+):/, '<strong>$1:</strong>');
  updatePrice();
};

window.selectSize = function(el, name, mult) {
    currentSizeMult = mult;
    currentSizeName = name;
    
    // Reset all buttons
    document.querySelectorAll('.size-btn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = 'rgba(255,255,255,0.08)';
      b.style.color = '#9ca3af';
      b.style.background = 'rgba(255,255,255,0.02)';
    });
    
    // Activate clicked button
    el.classList.add('active');
    el.style.borderColor = '#4ade80';
    el.style.color = '#4ade80';
    el.style.background = 'rgba(74, 222, 128, 0.05)';
    
    // Update CM label
    const cm = SIZE_CM_MAP[name] || Math.round(21 * mult);
    const cmLabel = document.getElementById('size-cm');
    if (cmLabel) cmLabel.textContent = `${cm} CM`;
    
    // Update tick position
    const tick = document.querySelector('.size-tick');
    if (tick) {
      const bottomPx = mult <= 1.5 ? 30 : 90;
      tick.style.bottom = `${bottomPx}px`;
    }
    
    updatePrice();
  };

window.changeModelColor = function(el, colorHex) {
  currentColorHex = colorHex;
  if (el) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    const cc = document.getElementById('custom-color');
    if (cc) cc.value = colorHex;
  }
  updatePrice(true);
  const mv = document.querySelector('model-viewer');
  if (mv) {
    const apply = () => { try { mv.model.materials[0].pbrMetallicRoughness.setBaseColorFactor(colorHex); } catch(e){} };
    if (mv.model) apply(); else mv.addEventListener('load', apply, {once:true});
  }
};

window.galleryPrev = function() { setGalleryImage(galleryIndex - 1); };
window.galleryNext = function() { setGalleryImage(galleryIndex + 1); };

window.openFullscreen = function() {
  const src = galleryImages[galleryIndex];
  if (!src) return;
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.96);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
  ov.innerHTML = `<img src="${src}" style="max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px;">`;
  ov.onclick = () => ov.remove();
  document.body.appendChild(ov);
};

window.toggleAcc = function(el) {
  const content = el.nextElementSibling;
  const isOpen = content.style.display === 'block';
  content.style.display = isOpen ? 'none' : 'block';
  el.classList.toggle('open', !isOpen);
};

window.checkout = async function() {
  const user = Auth.getCurrentUser();
  if (!user) {
    alert('Vui lòng đăng nhập để giao dịch!');
    window.location.href = '/login/?next=' + encodeURIComponent(window.location.pathname + window.location.search);
    return;
  }
  document.getElementById('co-img').src = document.getElementById('d-img').src;
  document.getElementById('co-name').textContent = drop.name;
  document.getElementById('co-mat').textContent = currentMatName;
  document.getElementById('co-size').textContent = currentSizeName;
  document.getElementById('co-total').textContent = DB.formatVND(calculatedPrice);
  document.getElementById('checkout-modal').classList.add('open');
};

window.closeCheckoutModal = function() {
  document.getElementById('checkout-modal').classList.remove('open');
};

window.confirmCheckout = function() {
  if (isCustom) {
    DB.addBid({
      id: DB.genId('bid'), dropId: drop.id,
      dropName: `${drop.name} (${currentMatName}, ${currentSizeName}, ${currentColorHex})`,
      dropImage: drop.image, budget: calculatedPrice,
      status: 'pending', createdAt: new Date().toISOString()
    });
    alert(`Đã chốt đơn gia công với giá ${DB.formatVND(calculatedPrice)}!`);
  } else {
    alert(`Chốt đơn thành công với giá ${DB.formatVND(calculatedPrice)}!`);
    if (drop.asks && drop.asks.length > 0) {
      drop.asks.shift();
      DB.updateDropAsks(drop.id, drop.asks);
    }
  }
  window.location.href = '/drops/';
};

window.startChat = function(makerId) {
  if (typeof window.startGlobalChat === 'function') {
    window.startGlobalChat(makerId, drop.id, drop.name);
  }
};

// ══════════════════════════════════════════════════════════
//  PRICE UPDATE
// ══════════════════════════════════════════════════════════

  window.changeQty = function(delta) {
    const el = document.getElementById('purchase-qty');
    let val = parseInt(el.value) || 1;
    let max = parseInt(el.max) || 1;
    val += delta;
    if(val < 1) val = 1;
    if(val > max) val = max;
    el.value = val;
    updatePrice();
  };

  window.toggleCustomMode = function() {
    isCustom = true;
    document.getElementById('options-panel-instock').style.display = 'none';
    document.getElementById('options-panel-custom').style.display = 'grid';
    updatePrice(true);
  };

  function updatePrice(forceCustom = false) {
    // If we have stockQty, default to instock mode unless forceCustom is true
    const hasStock = drop.stockQty && drop.stockQty > 0;
    
    isCustom = forceCustom || (!hasStock) || (currentMatMult !== 1 || currentSizeMult !== 1 || currentColorHex !== '#ffffff');

    if (hasStock && !isCustom) {
      document.getElementById('options-panel-instock').style.display = 'grid';
      document.getElementById('options-panel-custom').style.display = 'none';
      
      document.getElementById('instock-display-qty').textContent = drop.stockQty + ' sản phẩm';
      document.getElementById('instock-display-cond').textContent = drop.stockCondition === 'used' ? 'Cũ (Second-hand)' : 'Mới (100% Brand New)';
      document.getElementById('purchase-qty').max = drop.stockQty;
    } else {
      document.getElementById('options-panel-instock').style.display = 'none';
      document.getElementById('options-panel-custom').style.display = 'grid';
    }

    const priceEl = document.getElementById('d-price');
    const origEl  = document.getElementById('d-price-original');
    const az       = document.getElementById('action-zone');
    const btnBuy   = document.getElementById('btn-buy');
    const btnText  = document.getElementById('btn-text');
    const desc     = document.getElementById('action-desc');
    
    // Apply discount
    const discount = drop.discountPercent ? parseFloat(drop.discountPercent) : 0;
    const finalBasePrice = basePrice * (1 - discount/100);

    if (isCustom) {
      calculatedPrice = finalBasePrice * currentMatMult * currentSizeMult;
      priceEl.textContent = DB.formatVND(calculatedPrice);
      priceEl.style.color = 'var(--accent-purple)';
      
      if (discount > 0) {
        origEl.textContent = DB.formatVND(basePrice * currentMatMult * currentSizeMult);
        origEl.style.display = 'block';
      } else {
        origEl.style.display = 'none';
      }

      az.style.background = 'rgba(124,58,237,0.06)';
      az.style.borderColor = 'rgba(124,58,237,0.3)';
      btnBuy.style.background = 'var(--accent-purple)';
      btnBuy.style.color = 'white';
      btnText.textContent = 'ĐẶT GIA CÔNG (BID) - ' + DB.formatVND(calculatedPrice);
      desc.textContent = 'Custom: Yêu cầu in riêng 3D theo lựa chọn. Chế tác từ 2-4 ngày.';
    } else {
      const qty = parseInt(document.getElementById('purchase-qty')?.value || 1);
      calculatedPrice = finalBasePrice * qty;
      priceEl.textContent = DB.formatVND(calculatedPrice);
      priceEl.style.color = 'var(--accent-green)';
      
      if (discount > 0) {
        origEl.textContent = DB.formatVND(basePrice * qty);
        origEl.style.display = 'block';
      } else {
        origEl.style.display = 'none';
      }

      az.style.background = 'rgba(0,255,136,0.06)';
      az.style.borderColor = 'rgba(0,255,136,0.3)';
      btnBuy.style.background = 'var(--accent-green)';
      btnBuy.style.color = 'black';
      
      btnText.textContent = 'MUA NGAY - ' + DB.formatVND(calculatedPrice * qty);
      desc.textContent = 'Sản phẩm có sẵn tại kho. Giao ngay trong 2H.';
    }
}

// ══════════════════════════════════════════════════════════
//  GALLERY HELPERS
// ══════════════════════════════════════════════════════════
function buildGallery() {
  const all = [];
  if (drop.image && drop.image.trim()) all.push(drop.image.trim());
  (drop.gallery || []).forEach(src => { if (src && src.trim() && src.trim() !== drop.image) all.push(src.trim()); });
  galleryImages = all;
  galleryIndex = 0;
  
  if (galleryImages.length <= 1) {
    // noop
  } else {
    // noop
  }
  
  setGalleryImage(0);
}

function setGalleryImage(idx) {
  galleryIndex = Math.max(0, Math.min(idx, Math.max(0, galleryImages.length - 1)));
  const img = document.getElementById('d-img');
  if (img) {
    const newSrc = galleryImages[galleryIndex] || '/shared/no-image.jpg';
    if (img.src !== newSrc) {
      img.classList.remove('loaded');
      const container = document.getElementById('img-frame-container');
      if (container) container.classList.add('skeleton-bg');
      img.src = newSrc;
    }
  }
  const counter = document.getElementById('gallery-counter');
  const total = Math.max(1, galleryImages.length);
  if (counter) counter.textContent = `${String(galleryIndex + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
}

function extractYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/))([^&?\/\s]{11})/);
  return m ? m[1] : null;
}

// ══════════════════════════════════════════════════════════
//  BOTTOM SECTIONS
// ══════════════════════════════════════════════════════════
async function renderBottomSections() {
  let allDrops = [];
  try { allDrops = await BDB.getDrops(); } catch(e) { allDrops = DB.getDrops(); }
  allDrops = allDrops.filter(d => d.id !== drop.id);

  const renderList = (list) => list.map(d => {
      const lowestAsk = d.asks && d.asks.length > 0 ? Math.min(...d.asks.map(a => a.price)) : null;
      let priceDisplay = lowestAsk ? DB.formatVND(lowestAsk) : DB.formatVND(d.retailPrice);
      if (d.discountPercent > 0) priceDisplay = DB.formatVND(d.retailPrice * (1 - d.discountPercent/100));
      const stock = (d.stockQty !== undefined && d.stockQty > 0) ? d.stockQty : (d.asks || []).length;
    return `
      <div class="drop-card">
        <div class="drop-card-img-wrap" onclick="window.location.href='/drops/detail.html?id=${d.id}'" style="cursor:pointer;">
          <img src="${(d.image&&d.image.trim())?DB.escapeHTML(d.image):'/shared/no-image.jpg'}" alt="${DB.escapeHTML(d.name)}" onerror="this.src='/shared/no-image.jpg'">
          <div class="drop-card-img-overlay"><div class="gallery-hint">Xem</div></div>
          <div class="drop-card-stock" style="color:${stock>0?'var(--accent-green)':'#ef4444'};border-color:${stock>0?'rgba(0,255,136,0.3)':'rgba(239,68,68,0.3)'};">${stock} Sẵn</div>
        </div>
        <div class="drop-card-body">
          ${d.category ? `<div class="drop-card-cat">${DB.escapeHTML(d.category)}</div>` : ''}
          <a href="/drops/detail.html?id=${d.id}" data-link class="drop-card-name">${DB.escapeHTML(d.name)}</a>
          <div class="drop-card-footer">
            <div class="drop-card-price">Từ ${priceDisplay}</div>
            <a href="/drops/detail.html?id=${d.id}" data-link class="drop-card-buy">Mua</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('d-related-list').innerHTML = renderList(allDrops.slice(0,8)) || '<div style="opacity:.5">Chưa có sản phẩm.</div>';
    document.getElementById('d-bestseller-list').innerHTML = renderList([...allDrops].reverse().slice(0,8)) || '<div style="opacity:.5">Chưa có sản phẩm.</div>';
    
    const inStockDrops = allDrops.filter(d => (d.stockQty !== undefined && d.stockQty > 0) || (d.asks && d.asks.length > 0));
    document.getElementById('d-instock-list').innerHTML = renderList(inStockDrops.slice(0,8)) || '<div style="opacity:.5">Chưa có sản phẩm.</div>';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
async function initDetail() {
  const id = new URLSearchParams(window.location.search).get('id');

  // Load drop data
  let drops = [];
  try {
    drops = await BDB.getDrops();
  } catch(e) {
    drops = DB.getDrops();
  }
  drop = drops.find(d => d.id === id);

  if (!drop) { window.location.href = '/drops/'; return; }

  // State
  basePrice = Number(drop.retailPrice) || 0;
  const askPrices = (drop.asks || []).map(a => Number(a.price)).filter(p => p > 0);
  currentLowestAsk = askPrices.length > 0 ? Math.min(...askPrices) : null;
  calculatedPrice = currentLowestAsk || basePrice;

  // ── Populate UI ──
  document.title = drop.name + ' | Legato';
  document.getElementById('d-name').textContent = drop.name;
  document.getElementById('d-bread').textContent = drop.name;
  if (drop.category) {
      const catL = document.getElementById('d-cat-link');
      if(catL) { catL.textContent = drop.category; catL.href = '/drops/?cat=' + encodeURIComponent(drop.category); }
    }
  document.getElementById('d-ask-count').textContent = (drop.asks || []).length;
  document.getElementById('d-desc').innerHTML  = drop.desc  ? drop.desc.replace(/\n/g,'<br>') : '<span style="opacity:.5">Chưa có mô tả.</span>';
  document.getElementById('d-specs').innerHTML = drop.specs ? drop.specs.replace(/\n/g,'<br>') : '<span style="opacity:.5">Chưa có thông số.</span>';

  // Flash sale badge
  if (currentLowestAsk && currentLowestAsk < basePrice) {
    const pct = Math.round((1 - currentLowestAsk / basePrice) * 100);
    const badge = document.getElementById('flash-badge');
    badge.style.display = 'flex';
    document.getElementById('flash-discount').textContent = '-' + pct + '%';
  }

  // Model3D
  if (drop.model3d) {
    const wrap = document.getElementById('d-img').parentNode;
    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', drop.model3d);
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('rotation-per-second', '30deg');
    mv.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,0.08)0%,transparent 70%);';
    document.getElementById('d-img').style.display = 'none';
    // noop
    wrap.appendChild(mv);
    document.getElementById('color-picker-section').style.display = 'block';
  }

  // Video
  if (drop.video) {
    const videoId = extractYoutubeId(drop.video);
    if (videoId) {
      document.getElementById('d-video').src = 'https://www.youtube.com/embed/' + videoId;
      document.getElementById('video-frame').style.display = 'block';
    }
  }

  // Asks
  if (drop.asks && drop.asks.length > 0) {
    document.getElementById('d-asks').innerHTML = drop.asks.map(a => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:11px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;">
        <div>
          <div style="font-weight:700;color:white;">${a.seller || 'Xưởng Ẩn Danh'}</div>
          <div style="font-size:11px;color:var(--text-muted);">${a.type === 'new' ? 'In mới 100%' : 'Pass lại'}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="color:var(--accent-green);font-weight:700;">${DB.formatVND(a.price)}</div>
          <button class="btn btn-ghost" onclick="startChat('${a.makerId||'admin'}')" style="padding:5px 10px;font-size:12px;">💬 Chat</button>
        </div>
      </div>
    `).join('');
  } else {
    document.getElementById('d-asks').innerHTML = '<div style="opacity:.6;font-size:13px;">Chưa có xưởng nào nhận in sẵn. Hãy Đặt Gia Công để xưởng nhận nhé.</div>';
  }

  // Gallery & Price
  if (!drop.model3d) buildGallery();
  updatePrice();
  renderBottomSections();
}

  // Layout unification patch
  setTimeout(() => {
    const sm = document.getElementById('stock-market-zone');
    const az = document.getElementById('action-zone');
    const tl = document.querySelector('.timeline');
    
    if (sm && az && tl && !document.querySelector('.unified-action-group')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'unified-action-group';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.marginTop = '16px';
      wrapper.style.borderRadius = '14px';
      wrapper.style.border = '1px solid rgba(255,255,255,0.1)';
      wrapper.style.overflow = 'hidden';
      wrapper.style.background = 'rgba(0,0,0,0.2)';

      // style adjustments
      sm.style.marginTop = '0';
      sm.style.border = 'none';
      sm.style.borderBottom = '1px solid rgba(253,224,71,0.2)';
      sm.style.borderRadius = '0';
      
      az.style.marginTop = '0';
      az.style.border = 'none';
      az.style.borderRadius = '0';

      tl.style.marginBottom = '0';
      tl.style.border = 'none';
      tl.style.borderTop = '1px solid rgba(255,255,255,0.05)';
      tl.style.borderRadius = '0';
      tl.style.background = 'transparent';

      az.parentNode.insertBefore(wrapper, az);
      wrapper.appendChild(sm);
      wrapper.appendChild(az);
      wrapper.appendChild(tl);
    }
  }, 100);

// Start
initDetail();
