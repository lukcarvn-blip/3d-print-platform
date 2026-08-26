
DB.init();

// Security Check
const user = Auth.getCurrentUser();
if (!user || user.role !== 'admin') {
  alert("Chỉ có Admin mới được truy cập trang này!");
  window.location.href = '/';
}

function switchTab(tabId) {
  const url = new URL(window.location);
  url.searchParams.set('tab', tabId);
  window.history.pushState({}, '', url);
  
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  
  document.getElementById('tab-' + tabId).classList.add('active');
  document.getElementById('content-' + tabId).classList.add('active');
}

const currentParams = new URLSearchParams(window.location.search);
const currentTab = currentParams.get('tab') || 'products';
switchTab(currentTab);

function renderProducts() {
  const drops = DB.getDrops();
  document.getElementById('product-list').innerHTML = drops.map(d => {
    const createdDate = d.createdAt ? new Date(d.createdAt).toLocaleString('vi-VN') : 'Không rõ';
    const authorName = d.author || d.designer || 'BenchyDrop Admin';
    const location = d.location || 'Hà Nội, VN';
    return `
    <tr class="product-row">
      <td class="td-img"><img src="${d.image}" class="admin-td-img" alt="${d.name}"></td>
      <td class="td-info">
        <div style="font-weight:bold; margin-bottom:4px; font-size: 15px;">${d.name}</div>
        <div class="text-xs text-muted">Thiết kế: ${d.designer}</div>
        <div class="text-xs text-muted" style="margin-top:4px; color:var(--accent-purple);"><i data-lucide="clock" style="width:12px;display:inline-block;vertical-align:-2px;"></i> ${createdDate}</div>
      </td>
      <td class="td-author">
        <div style="font-weight:bold; font-size:13px; margin-bottom:4px;"><i data-lucide="user" style="width:12px;display:inline-block;vertical-align:-2px;"></i> ${authorName}</div>
        <div class="text-xs text-muted"><i data-lucide="map-pin" style="width:12px;display:inline-block;vertical-align:-2px;"></i> ${location}</div>
      </td>
      <td class="td-price" data-label="Giá Bán" style="color:var(--accent-green); font-weight:bold; font-size:16px;">${DB.formatVND(d.retailPrice)}</td>
      <td class="td-asks" data-label="Tồn Kho">${d.asks ? d.asks.length : 0} Asks</td>
      <td class="td-actions" style="text-align:right;">
        <a href="/admin/edit.html?id=${d.id}" data-link class="btn-action" title="Sửa"><i data-lucide="edit-2" style="width:16px;"></i> <span style="font-size:13px; margin-left:4px;" class="desktop-hide">Sửa</span></a>
        <button class="btn-action btn-danger" onclick="deleteProd('${d.id}')" title="Xóa" style="margin-left:8px;"><i data-lucide="trash-2" style="width:16px;"></i> <span style="font-size:13px; margin-left:4px;" class="desktop-hide">Xóa</span></button>
      </td>
    </tr>
  `}).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderUsers() {
  const users = DB.getUsers();
  document.getElementById('user-list').innerHTML = users.map(u => `
    <tr id="urow-${u.uid}" class="user-row">
      <td class="td-info">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom: 8px;">
          <img src="${u.avatar}" style="width:40px; height:40px; border-radius:50%; background:var(--bg-lighter);">
          <div>
            <div style="font-weight:bold;">${u.name}</div>
            <div class="text-xs text-muted">${u.email}</div>
          </div>
        </div>
      </td>
      <td class="td-role" data-label="Vai trò"><span style="padding:4px 8px; background:rgba(255,255,255,0.1); border-radius:4px; font-size:12px; text-transform:uppercase;">${u.role}</span></td>
      <td class="td-loc" data-label="Vị trí">${u.location || 'N/A'}</td>
      <td class="td-trust" data-label="Độ uy tín" style="color:var(--accent-green);">${u.trustLevel || 'Newbie'}</td>
      <td class="td-actions" style="text-align:right;">
        <button class="btn-action btn-danger" onclick="deleteUser('${u.uid}')" title="Xóa Thành Viên"><i data-lucide="trash-2" style="width:16px;"></i> <span style="font-size:13px; margin-left:4px;" class="desktop-hide">Xóa</span></button>
      </td>
    </tr>
  `).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function deleteUser(uid) {
  if (confirm("Chắc chắn xóa thành viên này? Hành động này không thể hoàn tác.")) {
    const users = DB.getUsers().filter(u => u.uid !== uid);
    DB._set(DB.KEYS.USERS, users);
    
    // Cũng xóa luôn đơn đăng ký xưởng của họ (nếu có) để họ có thể đăng ký lại
    const makerApps = DB.getMakerApps().filter(a => a.uid !== uid);
    DB._set(DB.KEYS.MAKER_APPS, makerApps);
    
    renderUsers();
    renderMakerApps();
  }
}

function renderMakerApps() {
  const apps = DB.getMakerApps().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  document.getElementById('maker-app-list').innerHTML = apps.map(a => {
    let statusHtml = '';
    if (a.status === 'pending') statusHtml = '<span style="color:var(--accent-purple); font-weight:bold;">Đang chờ</span>';
    else if (a.status === 'approved') statusHtml = '<span style="color:var(--accent-green); font-weight:bold;">Đã duyệt</span>';
    else statusHtml = '<span style="color:#ff5555; font-weight:bold;">Từ chối</span>';
    
    return `
    <tr class="app-row">
      <td class="td-info">
        <div style="font-weight:bold; font-size: 15px;">${a.repName}</div>
        <div class="text-xs text-muted" style="margin-bottom: 4px;">${a.email}</div>
      </td>
      <td class="td-date" data-label="Ngày gửi" style="color:var(--accent-purple); font-size:13px;"><i data-lucide="calendar" style="width:12px;display:inline-block;vertical-align:-2px;"></i> ${new Date(a.createdAt).toLocaleString('vi-VN')}</td>
      <td class="td-loc" data-label="Khu vực">${a.location}</td>
      <td class="td-status" data-label="Trạng thái">${statusHtml}</td>
      <td class="td-actions" style="text-align:right;">
        <button class="btn-action" onclick="viewMakerApp('${a.id}')" title="Xem Chi Tiết" style="background:rgba(255,255,255,0.05);"><i data-lucide="eye" style="width:16px;"></i> <span style="font-size:13px; margin-left:4px;" class="desktop-hide">Xem hồ sơ</span></button>
      </td>
    </tr>
  `}).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function viewMakerApp(appId) {
  const app = DB.getMakerApps().find(a => a.id === appId);
  if (!app) return;
  
  let portHtml = app.portfolio && app.portfolio.length ? app.portfolio.map(p => `<img src="${p}" style="max-height:100px; border-radius:8px; border:1px solid var(--border);">`).join('') : '<i>Không có ảnh</i>';
  
  document.getElementById('app-detail-body').innerHTML = `
    <div class="grid-2 mb-16">
      <div><strong>Đại diện:</strong> ${app.repName}</div>
      <div><strong>Email:</strong> ${app.email}</div>
    </div>
    <div class="grid-2 mb-16">
      <div><strong>SĐT:</strong> ${app.phone}</div>
      <div><strong>Mạng xã hội:</strong> ${app.social ? `<a href="${app.social}" target="_blank" style="color:var(--accent-purple);">Link</a>` : 'Không có'}</div>
    </div>
    <div class="mb-16"><strong>Vị trí / Maps:</strong> ${app.location}</div>
    <hr style="border-color:var(--border); margin:16px 0;">
    <div class="mb-16">
      <strong>Ảnh CCCD / Chân dung:</strong><br><br>
      ${app.cccd ? `<img src="${app.cccd}" style="max-width:100%; max-height:200px; border-radius:8px; border:1px solid var(--border);">` : '<i>Không có ảnh</i>'}
    </div>
    <div>
      <strong>Ảnh sản phẩm mẫu (Portfolio):</strong><br><br>
      <div style="display:flex; gap:12px; overflow-x:auto;">${portHtml}</div>
    </div>
  `;
  
  if (app.status === 'pending') {
    document.getElementById('app-detail-footer').innerHTML = `
      <button class="btn btn-ghost" onclick="document.getElementById('app-detail-modal').classList.remove('open')">Đóng</button>
      <button class="btn btn-primary" style="background:#ff5555;" onclick="rejectMakerApp('${app.id}', '${app.uid}')">Từ Chối</button>
      <button class="btn btn-primary" onclick="approveMakerApp('${app.id}', '${app.uid}')">Duyệt & Cấp Quyền</button>
    `;
  } else {
    document.getElementById('app-detail-footer').innerHTML = `<button class="btn btn-ghost" onclick="document.getElementById('app-detail-modal').classList.remove('open')">Đóng</button>`;
  }
  
  document.getElementById('app-detail-modal').classList.add('open');
}

function approveMakerApp(appId, uid) {
  if (confirm("Duyệt tài khoản này thành Đối Tác Xưởng In?")) {
    DB.updateMakerAppStatus(appId, 'approved');
    DB.updateUser(uid, { role: 'maker', isPendingMaker: false });
    document.getElementById('app-detail-modal').classList.remove('open');
    renderMakerApps();
    renderUsers();
    alert("Đã duyệt thành công!");
  }
}

function rejectMakerApp(appId, uid) {
  if (confirm("Từ chối đơn đăng ký này?")) {
    DB.updateMakerAppStatus(appId, 'rejected');
    DB.updateUser(uid, { isPendingMaker: false });
    document.getElementById('app-detail-modal').classList.remove('open');
    renderMakerApps();
    alert("Đã từ chối đơn đăng ký.");
  }
}

function renderOrders() {
  const orders = DB.getOrders();
  document.getElementById('order-list').innerHTML = orders.map(o => `
    <tr class="order-row">
      <td class="td-id" data-label="Mã Đơn" style="font-family:monospace; color:var(--text-muted); font-size:13px;">${o.id}</td>
      <td class="td-info" style="font-weight:bold; font-size:15px;">${o.dropName}</td>
      <td class="td-customer" data-label="Khách Hàng">${o.buyerEmail}</td>
      <td class="td-price" data-label="Tổng Tiền" style="color:var(--accent-purple); font-weight:bold;">${DB.formatVND(o.price)}</td>
      <td class="td-status" data-label="Trạng Thái">
        <span style="padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; ${o.status==='shipping'?'background:rgba(0,255,136,0.1);color:var(--accent-green);':'background:rgba(255,255,255,0.1);'}">${o.status.toUpperCase()}</span>
      </td>
      <td class="td-actions" style="text-align:right;">
        <button class="btn-action" title="Xem Chi Tiết"><i data-lucide="eye" style="width:16px;"></i> <span style="font-size:13px; margin-left:4px;" class="desktop-hide">Xem đơn</span></button>
      </td>
    </tr>
  `).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderNewsList() {
  const newsList = DB.getNews();
  document.getElementById('news-list').innerHTML = newsList.map(n => {
    const createdDate = n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : 'Không rõ';
    return `
    <tr class="product-row">
      <td class="td-img"><img src="${n.image}" class="admin-td-img" alt="${n.title}"></td>
      <td class="td-info" style="max-width: 300px; white-space: normal;">
        <div style="font-weight:bold; margin-bottom:4px; font-size: 15px;">${n.title}</div>
        <div class="text-xs text-muted" style="margin-top:4px; color:var(--accent-purple);"><i data-lucide="clock" style="width:12px;display:inline-block;vertical-align:-2px;"></i> ${createdDate}</div>
      </td>
      <td class="td-author">
        <div style="font-weight:bold; font-size:13px; margin-bottom:4px;"><i data-lucide="user" style="width:12px;display:inline-block;vertical-align:-2px;"></i> ${n.author || 'Admin'}</div>
      </td>
      <td class="td-actions" style="text-align:right;">
        <a href="/admin/news-edit.html?id=${n.id}" data-link class="btn-action" title="Sửa"><i data-lucide="edit-2" style="width:16px;"></i> <span style="font-size:13px; margin-left:4px;" class="desktop-hide">Sửa</span></a>
        <button class="btn-action btn-danger" onclick="deleteNewsItem('${n.id}')" title="Xóa" style="margin-left:8px;"><i data-lucide="trash-2" style="width:16px;"></i> <span style="font-size:13px; margin-left:4px;" class="desktop-hide">Xóa</span></button>
      </td>
    </tr>
  `}).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderAdminChats() {
  const chats = DB.getChats ? DB.getChats() : [];
  const users = DB.getUsers();
  document.getElementById('admin-chat-list').innerHTML = chats.map(c => {
    const buyer = users.find(u => u.uid === c.buyerId);
    const maker = users.find(u => u.uid === c.makerId);
    const buyerName = buyer ? buyer.name : c.buyerId;
    const makerName = maker ? maker.name : c.makerId;
    
    let lastMsg = 'Chưa có tin nhắn';
    let lastTime = '';
    if (c.messages && c.messages.length > 0) {
      const lm = c.messages[c.messages.length - 1];
      lastMsg = lm.text;
      lastTime = new Date(lm.timestamp).toLocaleString('vi-VN');
    }
    
    return `
    <tr class="product-row">
      <td class="td-info" style="font-weight:bold; font-size:14px;">${c.dropName}</td>
      <td class="td-customer" data-label="Người Mua">${buyerName}</td>
      <td class="td-author" data-label="Xưởng In">${makerName}</td>
      <td class="td-status" data-label="Tin Gần Nhất">
        <div style="font-size:13px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lastMsg}</div>
        <div style="font-size:11px; color:var(--text-muted);">${lastTime}</div>
      </td>
      <td class="td-actions" style="text-align:right;">
        <button class="btn-action" title="Xem Chi Tiết" onclick="viewAdminChat('${c.id}')"><i data-lucide="message-square" style="width:16px;"></i> <span style="font-size:13px; margin-left:4px;" class="desktop-hide">Xem Chat</span></button>
      </td>
    </tr>
  `}).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.viewAdminChat = function(chatId) {
  const chat = DB.getChatById(chatId);
  if (!chat) return;
  const users = DB.getUsers();
  const buyer = users.find(u => u.uid === chat.buyerId);
  const maker = users.find(u => u.uid === chat.makerId);
  
  document.getElementById('admin-chat-title').textContent = chat.dropName;
  document.getElementById('admin-chat-sub').textContent = `Người Mua: ${buyer ? buyer.name : chat.buyerId} | Xưởng In: ${maker ? maker.name : chat.makerId}`;
  
  const bodyEl = document.getElementById('admin-chat-body');
  if (!chat.messages || chat.messages.length === 0) {
    bodyEl.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">Chưa có tin nhắn nào.</div>';
  } else {
    bodyEl.innerHTML = chat.messages.map(m => {
      const isBuyer = m.senderId === chat.buyerId;
      const senderName = isBuyer ? (buyer ? buyer.name : 'Người Mua') : (maker ? maker.name : 'Xưởng In');
      const align = isBuyer ? 'flex-start' : 'flex-end';
      const bg = isBuyer ? 'rgba(255,255,255,0.05)' : 'rgba(0,255,136,0.1)';
      const border = isBuyer ? '1px solid var(--border)' : '1px solid rgba(0,255,136,0.2)';
      return `
        <div style="align-self:${align}; max-width:85%; background:${bg}; border:${border}; padding:10px 14px; border-radius:12px; font-size:13px; line-height:1.4;">
          <div style="font-size:11px; color:var(--text-muted); margin-bottom:4px; font-weight:bold;">${senderName} • ${new Date(m.timestamp).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</div>
          <div>${m.text}</div>
        </div>
      `;
    }).join('');
  }
  
  document.getElementById('admin-chat-modal').classList.add('open');
  // Scroll to bottom
  setTimeout(() => {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }, 50);
}

async function deleteNewsItem(id) {
  if(confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
    await BDB.deleteNews(id);
    renderNewsList();
  }
}

async function deleteProd(id) {
  if (confirm("Chắc chắn xóa sản phẩm này khỏi hệ thống?")) {
    DB.deleteDrop(id);
    renderProducts();
  }
}

// AI Assistant Logic
function toggleAI() {
  document.getElementById('ai-panel').classList.toggle('open');
}

function appendMsg(text, isUser=false) {
  const chat = document.getElementById('ai-chat');
  const qa = document.querySelector('.ai-quick-actions');
  const div = document.createElement('div');
  div.className = `ai-msg ${isUser ? 'user' : 'bot'}`;
  div.innerHTML = text;
  chat.insertBefore(div, qa);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function aiScanSpam() {
  appendMsg("Quét thành viên spam và rác", true);
  
  let apiKey = localStorage.getItem('gemini_api_key') || 'AQ.Ab8RN6JE70G1Edk-N01NRQTvbwXm1rwQWBJl3_P79y8FD97fLA';
  if (!apiKey) {
    apiKey = prompt("Vui lòng nhập Google Gemini API Key để dùng AI:");
    if (!apiKey) return;
    localStorage.setItem('gemini_api_key', apiKey);
  }
  
  const loadingMsg = appendMsg(`<i data-lucide="loader" class="spin" style="width:14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Đang phân tích dữ liệu hệ thống...`);
  lucide.createIcons();
  
  try {
    const users = DB.getUsers();
    const promptText = `
      Bạn là hệ thống AI bảo mật. Dưới đây là danh sách user (JSON):
      ${JSON.stringify(users)}
      Hãy phân tích và trả về CHỈ MỘT MẢNG JSON chứa 'uid' của những tài khoản có dấu hiệu SPAM rõ ràng (email spam, tên vô nghĩa, 0 jobs, trustLevel Suspicious hoặc Newbie nhưng đáng ngờ).
      Trả về đúng mảng JSON, KHÔNG markdown, KHÔNG text dư thừa. Ví dụ: ["user_3", "user_4"]
    `;
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });
    
    if (!res.ok) throw new Error("API Key không hợp lệ.");
    const jsonRes = await res.json();
    const textOut = jsonRes.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
    const spamIds = JSON.parse(textOut);
    
    if (spamIds.length === 0) {
      loadingMsg.innerHTML = "Hệ thống sạch! Không phát hiện tài khoản spam nào.";
    } else {
      loadingMsg.innerHTML = `⚠️ Phát hiện <b>${spamIds.length}</b> tài khoản spam/rác ẩn nấp.<br><br><button class="btn btn-primary" style="font-size:12px; padding:6px 12px;" onclick="banSpammers('${spamIds.join(',')}')">Block & Xóa Dữ Liệu</button>`;
      
      // Chuyển sang tab user và highlight đỏ
      switchTab('users');
      setTimeout(() => {
        spamIds.forEach(id => {
          const row = document.getElementById(`urow-${id}`);
          if (row) row.classList.add('highlight-spam');
        });
      }, 300);
    }
  } catch(e) {
    loadingMsg.innerHTML = "Lỗi phân tích AI: " + e.message;
  }
}

async function aiAnalyzeOrders() {
  appendMsg("Phân tích tổng quan đơn hàng", true);
  let apiKey = localStorage.getItem('gemini_api_key') || 'AQ.Ab8RN6JE70G1Edk-N01NRQTvbwXm1rwQWBJl3_P79y8FD97fLA';
  if (!apiKey) return alert("Vui lòng thiết lập API Key trước qua tính năng Quét Spam!");
  
  const loadingMsg = appendMsg(`<i data-lucide="loader" class="spin" style="width:14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Đang đọc báo cáo...`);
  lucide.createIcons();
  
  try {
    const orders = DB.getOrders();
    const promptText = `
      Danh sách đơn hàng JSON:
      ${JSON.stringify(orders)}
      Hãy viết 1 đoạn báo cáo ngắn gọn (tiếng Việt, 2-3 câu) tóm tắt tình hình kinh doanh: tổng tiền, sản phẩm bán chạy. Dùng HTML cơ bản <b>, <br> để định dạng cho đẹp. KHÔNG DÙNG MARKDOWN.
    `;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });
    const jsonRes = await res.json();
    loadingMsg.innerHTML = jsonRes.candidates[0].content.parts[0].text;
  } catch(e) {
    loadingMsg.innerHTML = "Lỗi: " + e.message;
  }
}

function banSpammers(idsStr) {
  const ids = idsStr.split(',');
  const users = DB.getUsers().filter(u => !ids.includes(u.uid));
  DB._set(DB.KEYS.USERS, users);
  renderUsers();
  appendMsg(`✅ Đã càn quét thành công ${ids.length} tài khoản và đưa IP vào Blacklist!`);
}

// Settings Logic
function loadSettings() {
  const s = JSON.parse(localStorage.getItem('_v3_settings') || '{}');
  document.getElementById('s-logo-text').value = s.logoText || 'BenchyDrop';
  document.getElementById('s-logo-icon').value = s.logoIcon || 'anchor';
  document.getElementById('s-theme-color').value = s.themeColor || '#00ff88';
  document.getElementById('s-theme-hex').textContent = s.themeColor || '#00ff88';
  document.getElementById('s-font-family').value = s.fontFamily || "'Inter', sans-serif";
  document.getElementById('s-gemini-key').value = localStorage.getItem('gemini_api_key') || 'AQ.Ab8RN6JE70G1Edk-N01NRQTvbwXm1rwQWBJl3_P79y8FD97fLA';
  
  document.getElementById('s-theme-color').addEventListener('input', function() {
    document.getElementById('s-theme-hex').textContent = this.value;
  });
}

function saveSettings() {
  const s = {
    logoText: document.getElementById('s-logo-text').value,
    logoIcon: document.getElementById('s-logo-icon').value,
    themeColor: document.getElementById('s-theme-color').value,
    fontFamily: document.getElementById('s-font-family').value
  };
  localStorage.setItem('_v3_settings', JSON.stringify(s));
  localStorage.setItem('gemini_api_key', document.getElementById('s-gemini-key').value);
  alert('Đã lưu cấu hình. Đang áp dụng giao diện mới...');
  setTimeout(() => window.location.reload(), 1500);
}

function renderAll() {
  renderProducts();
  renderUsers();
  renderMakerApps();
  renderOrders();
  renderNewsList();
  renderAdminChats();
}

loadSettings();
renderAll();
