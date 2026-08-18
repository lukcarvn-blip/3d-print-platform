// ============================================================
// Legato — Shared App Logic (Layout & Navigation)

// Apply Global Settings
window.SiteSettings = JSON.parse(localStorage.getItem('_v3_settings') || '{}');
const root = document.documentElement;
if (window.SiteSettings.themeColor) {
  root.style.setProperty('--accent-green', window.SiteSettings.themeColor);
}
if (window.SiteSettings.fontFamily) {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.style.fontFamily = window.SiteSettings.fontFamily;
  });
}

// --- NATIVE ALERT UPGRADE (iOS Style Toast) ---
window.alert = function(message) {
  let container = document.getElementById('app-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '10000',
      padding: '20px'
    });
    // Ensure body exists before appending
    if (document.body) {
      document.body.appendChild(container);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(container));
    }
  }

  const toast = document.createElement('div');
  Object.assign(toast.style, {
    background: 'rgba(20, 20, 25, 0.75)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    padding: '20px 32px',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '15px',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: '85%',
    transform: 'translateY(150px) scale(0.8)',
    opacity: '0',
    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  });
  
  toast.innerHTML = `
    <div style="background:rgba(255,255,255,0.1); border-radius:50%; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
      <i data-lucide="info" style="width:22px; color:white;"></i>
    </div>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons({root: toast});

  // Animate In (Bounce up)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0) scale(1)';
      toast.style.opacity = '1';
    });
  });

  // Animate Out (Drop down)
  setTimeout(() => {
    toast.style.transform = 'translateY(100px) scale(0.9)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s cubic-bezier(0.36, 0, 0.66, -0.56)';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 2500);
};
// ----------------------------------------------

// 1. Inject Lucide Icons CDN (Firebase is loaded synchronously in HTML)
if (typeof lucide === 'undefined') {
  const lucideScript = document.createElement('script');
  lucideScript.src = 'https://unpkg.com/lucide@latest';
  document.head.appendChild(lucideScript);
}
// 2. Inject Page Transition Styles
const style = document.createElement('style');
style.textContent = `
  #page-loader {
    position: fixed;
    inset: 0;
    background: var(--bg-base);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  #page-loader.active {
    opacity: 1;
    pointer-events: all;
  }
  .loader-spinner {
    color: var(--accent-green);
    animation: spin 1s linear infinite;
  }
  
  /* Sidebar and Layout updates */
  .sidebar-nav a { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; color: var(--text-secondary); transition: var(--transition); text-decoration: none; }
  .sidebar-nav a:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
  .sidebar-nav a.active { background: rgba(0,255,136,0.1); color: var(--accent-green); }
  .sidebar-nav i { width: 20px; height: 20px; }
`;
document.head.appendChild(style);

// 3. Inject Layout HTML
const initApp = () => {
  // Add Loader
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.innerHTML = `
    <style>
      @keyframes legoFaceSwap {
        0%, 20% { opacity: 1; }
        25%, 45% { opacity: 0; }
        50%, 70% { opacity: 0; }
        75%, 95% { opacity: 0; }
        100% { opacity: 1; }
      }
      .l-face-smile { animation: legoFaceSwap 4s infinite; }
      .l-face-wink { animation: legoFaceSwap 4s infinite; animation-delay: -3s; opacity: 0; }
      .l-face-surprised { animation: legoFaceSwap 4s infinite; animation-delay: -2s; opacity: 0; }
      .l-face-cool { animation: legoFaceSwap 4s infinite; animation-delay: -1s; opacity: 0; }
    </style>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="width: 72px; height: 72px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));">
      <!-- Head shape -->
      <path fill="#FDE047" d="M22 14 L22 10 C22 8 23 7 25 7 L39 7 C41 7 42 8 42 10 L42 14 L48 14 C52 14 55 17 55 21 L55 47 C55 51 52 54 48 54 L16 54 C12 54 9 51 9 47 L9 21 C9 17 12 14 16 14 Z"/>
      
      <!-- Smile Face -->
      <g class="l-face-smile" fill="#000">
        <circle cx="24" cy="30" r="3.5"/>
        <circle cx="40" cy="30" r="3.5"/>
        <path d="M 24 40 Q 32 46 40 40" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>

      <!-- Wink Face -->
      <g class="l-face-wink" fill="#000">
        <path d="M 20 30 L 28 30" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="40" cy="30" r="3.5"/>
        <path d="M 26 40 Q 32 45 38 38" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
      
      <!-- Surprised Face -->
      <g class="l-face-surprised" fill="#000">
        <circle cx="24" cy="28" r="3.5"/>
        <circle cx="40" cy="28" r="3.5"/>
        <circle cx="32" cy="42" r="3.5"/>
      </g>
      
      <!-- Cool Face -->
      <g class="l-face-cool" fill="#000">
        <path d="M 18 28 L 46 28 L 42 34 L 22 34 Z" fill="#000" stroke-linejoin="round"/>
        <path d="M 28 42 Q 32 42 36 42" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
    </svg>
  `;
  document.body.appendChild(loader);

  // Setup Sidebar if an element with class .app-layout exists
  const appLayout = document.querySelector('.app-layout');
  if (appLayout) {
    const currentPath = window.location.pathname;
    
    // Determine active states
    const isHome = currentPath.endsWith('/') || currentPath.endsWith('index.html') && !currentPath.includes('/') && !currentPath.includes('discover');
    const isDiscover = currentPath.includes('/discover');
    const isDrops = currentPath.includes('/drops');
    const isJobs = currentPath.includes('/jobs');
    const isProfile = currentPath.includes('/profile');
    const isAdmin = currentPath.includes('/admin');

    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : (typeof DB !== 'undefined' ? DB.getCurrentUser() : null);
    const isMaker = user && (user.role === 'maker' || user.role === 'admin');

    // Create Sidebar
    const logoTxt = window.SiteSettings.logoText || 'Legato';
    
    const sidebarHtml = `
      <aside class="sidebar">
        <div class="sidebar-logo" style="position:relative;">
          <a href="/" style="text-decoration:none; cursor:pointer; display:flex; align-items:center; gap:10px; flex:1; min-width:0;" data-link>
            <img src="/shared/logo.png" alt="Legato Logo" style="height: 108px; width: auto; object-fit: contain; margin-left: -12px;" class="sidebar-logo-img">
          </a>
          <button class="sidebar-toggle-btn" onclick="toggleSidebar()" title="Đóng/Mở menu" id="sidebar-toggle-btn">
            <i data-lucide="panel-left-close" style="width:15px;"></i>
          </button>
        </div>
        <div class="sidebar-section">
          <nav class="sidebar-nav">
            <a href="/" class="${isHome && !isDiscover && !isDrops && !isJobs && !isProfile && !isAdmin ? 'active' : ''}" data-link>
              <i data-lucide="home"></i> <span>Trang chủ</span>
            </a>
            <a href="/discover/" class="${isDiscover ? 'active' : ''}" data-link>
              <i data-lucide="compass"></i> <span>Khám Phá</span>
            </a>
            <a href="/drops/" class="${isDrops ? 'active' : ''}" data-link>
              <i data-lucide="shopping-bag"></i> <span>Exclusive Drops</span>
            </a>
            <a href="/about/" class="${currentPath.includes('/about') ? 'active' : ''}" data-link>
              <i data-lucide="info"></i> <span>Giới thiệu</span>
            </a>
          </nav>
        </div>
        ${isMaker ? `
        <div class="sidebar-section">
          <div class="sidebar-section-label">Makers Zone</div>
          <nav class="sidebar-nav">
            <a href="/jobs/" class="${isJobs ? 'active' : ''}" data-link>
              <i data-lucide="briefcase"></i> <span>Job Board</span>
              <span class="badge" id="app-job-count" style="margin-left:auto;">0</span>
            </a>
            <a href="/profile/" class="${isProfile ? 'active' : ''}" data-link>
              <i data-lucide="user"></i> <span>Xưởng Của Tôi</span>
            </a>
          </nav>
        </div>` : ''}
        ${isAdmin ? `
        <div class="sidebar-footer">
          <nav class="sidebar-nav">
            <a href="/admin/" class="${isAdmin ? 'active' : ''}" data-link>
              <i data-lucide="shield-alert"></i> <span>Admin</span>
            </a>
          </nav>
        </div>` : ''}
        
        <div class="sidebar-footer-links" style="padding: 16px; margin-top: auto;">
          <div style="display:flex; gap:16px; margin-bottom:16px; color:var(--text-secondary);">
            <a href="#" style="color:inherit;"><i data-lucide="facebook" style="width:20px;"></i></a>
            <a href="#" style="color:inherit;"><i data-lucide="instagram" style="width:20px;"></i></a>
            <a href="#" style="color:inherit;"><i data-lucide="youtube" style="width:20px;"></i></a>
            <a href="#" style="color:inherit;"><svg style="width:20px; height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg></a>
            <a href="#" style="color:inherit;"><svg style="width:20px; height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5" /></svg></a>
          </div>
          <div style="border-top: 1px solid var(--border); padding-top: 16px; display:flex; gap:12px; font-size:13px; color:var(--text-secondary);">
            <a href="#" style="color:inherit; text-decoration:none;">Privacy</a>
            <a href="#" style="color:inherit; text-decoration:none;">Terms</a>
            <a href="#" style="color:inherit; text-decoration:none;">Guidelines</a>
          </div>
        </div>
      </aside>
    `;
    
    // Inject sidebar at the beginning of app-layout
    appLayout.insertAdjacentHTML('afterbegin', sidebarHtml);

    // Sidebar Toggle Logic
    window.toggleSidebar = function() {
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      const btn = document.getElementById('sidebar-toggle-btn');
      if (!sidebar) return;
      const isCollapsed = sidebar.classList.toggle('collapsed');
      if (mainContent) mainContent.style.marginLeft = isCollapsed ? '64px' : '';
      // Swap icon
      if (btn) {
        const iconEl = btn.querySelector('i[data-lucide]');
        if (iconEl) {
          iconEl.setAttribute('data-lucide', isCollapsed ? 'panel-left-open' : 'panel-left-close');
          if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [iconEl] });
        }
      }
      // Persist preference
      try { localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0'); } catch(e) {}
    };
    // Restore collapse state
    try {
      if (localStorage.getItem('sidebar_collapsed') === '1') {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        if (sidebar) {
          sidebar.classList.add('collapsed');
          if (mainContent) mainContent.style.marginLeft = '64px';
          // Fix toggle icon
          setTimeout(() => {
            const btn = document.getElementById('sidebar-toggle-btn');
            if (btn) {
              const iconEl = btn.querySelector('i[data-lucide]');
              if (iconEl) {
                iconEl.setAttribute('data-lucide', 'panel-left-open');
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [iconEl] });
              }
            }
          }, 100);
        }
      }
    } catch(e) {}

    // Inject mobile logo into top header
    const topHeader = document.querySelector('.top-header');
    const mobileLogoHtml = `
        <a href="/" class="mobile-header-logo" style="text-decoration:none; align-items:center; gap:8px;" data-link>
          <img src="/shared/logo.png" alt="Legato Logo" style="height: 80px; width: auto; object-fit: contain; transform: scale(1.2); transform-origin: left center;">
        </a>
    `;
    if (topHeader && !topHeader.querySelector('.mobile-header-logo') && !topHeader.querySelector('.back-btn')) {
      topHeader.insertAdjacentHTML('afterbegin', mobileLogoHtml);
    }

    // Create Mobile Bottom Nav
    const mobileNavHtml = `
      <nav class="mobile-nav">
        <div class="mobile-nav-items">
          <button class="mobile-nav-item ${isHome && !isDiscover && !isDrops && !isJobs && !isProfile && !isAdmin ? 'active' : ''}" onclick="window.location.href='/'">
            <i data-lucide="home" class="mobile-nav-icon"></i>
            Trang chủ
          </button>
          <button class="mobile-nav-item ${isDiscover ? 'active' : ''}" onclick="window.location.href='/discover/'">
            <i data-lucide="compass" class="mobile-nav-icon"></i>
            Khám Phá
          </button>
          <button class="mobile-nav-item ${isDrops ? 'active' : ''}" onclick="window.location.href='/drops/'">
            <i data-lucide="shopping-bag" class="mobile-nav-icon"></i>
            Drops
          </button>
          ${isMaker ? `
          <button class="mobile-nav-item ${isJobs ? 'active' : ''}" onclick="window.location.href='/jobs/'">
            <i data-lucide="briefcase" class="mobile-nav-icon"></i>
            Jobs
          </button>` : `
          <button class="mobile-nav-item" onclick="window.location.href='/profile/'">
            <i data-lucide="factory" class="mobile-nav-icon"></i>
            Makers
          </button>`}
          <button class="mobile-nav-item ${isProfile ? 'active' : ''}" onclick="window.location.href='/profile/'">
            <i data-lucide="user" class="mobile-nav-icon"></i>
            Cá Nhân
          </button>
        </div>
      </nav>
    `;
    document.body.insertAdjacentHTML('beforeend', mobileNavHtml);

    // Auto-hide Top Header on Scroll
    if (topHeader) {
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', () => {
        if (window.scrollY > 60 && window.scrollY > lastScrollY) {
          topHeader.classList.add('hide-on-scroll');
        } else {
          topHeader.classList.remove('hide-on-scroll');
        }
        lastScrollY = window.scrollY;
      }, { passive: true });
    }

    // Update job count if DB exists
    if (window.DB) {
      const countEl = document.getElementById('app-job-count');
      if (countEl && typeof window.DB.getBids === 'function') {
        countEl.textContent = window.DB.getBids().filter(j => j.status === 'pending').length;
      }
    }
  }

  // 4. Intercept clicks for loading transition
  document.querySelectorAll('a[data-link]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = anchor.getAttribute('href');
      
      // Show Loader
      document.getElementById('page-loader').classList.add('active');
      
      // Navigate after delay
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 400); // 400ms loading effect
    });
  });

  // 5. Update Header Auth UI
  setTimeout(() => {
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : (typeof DB !== 'undefined' ? DB.getCurrentUser() : null);
    const headerActions = document.querySelector('.header-actions');
    
    if (headerActions) {
      if (user) {
        headerActions.innerHTML = `
          <button class="header-btn mobile-search-btn" title="Tìm kiếm" onclick="toggleMobileSearch()"><i data-lucide="search"></i></button>
          <button class="header-btn" title="Thông báo" onclick="alert('Bạn không có thông báo mới.')"><i data-lucide="bell"></i></button>
          <button class="header-btn" title="Giỏ hàng" onclick="alert('Giỏ hàng trống.')"><i data-lucide="shopping-cart"></i></button>
          <div style="position:relative; display:inline-block;" class="auth-dropdown-wrap">
            <img src="${user.avatar}" class="header-avatar" id="avatar-btn" alt="Avatar" style="cursor:pointer;">
            <div id="auth-dropdown-menu" class="auth-dropdown glass-panel-dark" style="position:absolute; right:0; top:45px; width:200px; display:none; flex-direction:column; z-index:100; border:1px solid var(--border);">
              <div style="padding:16px; border-bottom:1px solid var(--border);">
                <div style="font-weight:bold; font-size:14px; color:white;">${user.name}</div>
                <div style="font-size:12px; color:var(--text-muted); word-break:break-all;">${user.email || '@user'}</div>
              </div>
              <a href="/profile/" data-link style="padding:12px 16px; text-decoration:none; color:var(--text-primary); font-size:14px; display:flex; align-items:center; gap:8px;"><i data-lucide="user" style="width:16px;"></i> Trang Cá Nhân</a>
              <a href="#" onclick="Auth.logout()" style="padding:12px 16px; text-decoration:none; color:var(--text-red); font-size:14px; display:flex; align-items:center; gap:8px; border-top:1px solid var(--border);"><i data-lucide="log-out" style="width:16px;"></i> Đăng Xuất</a>
            </div>
          </div>
        `;
      } else {
        headerActions.innerHTML = `
          <button class="header-btn mobile-search-btn" title="Tìm kiếm" onclick="toggleMobileSearch()" style="margin-right:8px;"><i data-lucide="search"></i></button>
          <a href="/login/" data-link class="header-login-btn" style="display:none; align-items:center; gap:8px; padding:8px 20px; background:var(--accent-green); color:black; font-weight:700; font-size:14px; border-radius:99px; text-decoration:none; white-space:nowrap; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'"><i data-lucide="log-in" style="width:16px;"></i> Đăng nhập</a>
        `;
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }, 300);

  // Init Lucide again just in case dynamic content was added
  setTimeout(() => { 
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Bind global click for avatar
    document.addEventListener('click', (e) => {
      const avatarBtn = document.getElementById('avatar-btn');
      const dropdown = document.getElementById('auth-dropdown-menu');
      if (avatarBtn && dropdown) {
        if (e.target === avatarBtn) {
          dropdown.classList.toggle('show');
        } else if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('show');
        }
      }
    });
  }, 500);

  // Mobile search logic
  window.toggleMobileSearch = function() {
    let modal = document.getElementById('mobile-search-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'mobile-search-modal';
      modal.style.cssText = 'position:fixed; inset:0; background:var(--bg-base); z-index:10000; padding:16px; display:flex; flex-direction:column; gap:16px;';
      modal.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="flex:1; display:flex; align-items:center; background:var(--bg-surface); border:1px solid var(--border); border-radius:99px; padding:0 16px; height:44px;">
            <i data-lucide="search" style="color:var(--text-muted); width:18px;"></i>
            <input type="text" id="mobile-search-input" placeholder="Tìm mô hình, xưởng in..." style="flex:1; background:transparent; border:none; outline:none; color:white; font-size:14px; padding:10px;" onkeypress="if(event.key==='Enter') executeMobileSearch()">
          </div>
          <button onclick="toggleMobileSearch()" style="background:transparent; border:none; color:var(--text-primary); font-size:14px; cursor:pointer;">Hủy</button>
        </div>
        <div style="color:var(--text-muted); font-size:13px; text-align:center; margin-top:32px;">Nhập từ khóa và nhấn Enter để tìm kiếm trên Khám Phá.</div>
      `;
      document.body.appendChild(modal);
      if(typeof lucide !== 'undefined') lucide.createIcons({root: modal});
      setTimeout(() => document.getElementById('mobile-search-input').focus(), 100);
    } else {
      modal.remove();
    }
  };

  window.executeMobileSearch = function() {
    const val = document.getElementById('mobile-search-input').value;
    if (val) {
      window.location.href = '/discover/?q=' + encodeURIComponent(val);
    }
  };

  // 6. Inject Global Chat Widget
  const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : (typeof DB !== 'undefined' ? DB.getCurrentUser() : null);
  const isAdminRoute = window.location.pathname.includes('/admin');
  if (user && !isAdminRoute) {
    const chatWidgetHtml = `
      <div id="global-chat-fab" style="position:fixed; bottom:32px; right:32px; width:56px; height:56px; border-radius:28px; background:var(--accent-green); color:black; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 24px rgba(0,255,136,0.4); z-index:10000; transition:transform 0.2s;" onclick="toggleGlobalChat()">
        <i data-lucide="message-circle" style="width:24px; height:24px;"></i>
        <span id="global-chat-badge" style="display:none; position:absolute; top:-4px; right:-4px; background:#ff5555; color:white; font-size:10px; font-weight:bold; width:20px; height:20px; border-radius:10px; align-items:center; justify-content:center; border:2px solid var(--bg-base);">0</span>
      </div>
      
      <div id="global-chat-panel" style="position:fixed; bottom:100px; right:32px; width:380px; height:500px; max-height:80vh; background:var(--bg-card); border-radius:16px; border:1px solid var(--border); box-shadow:0 12px 40px rgba(0,0,0,0.8); z-index:9999; display:flex; flex-direction:column; opacity:0; pointer-events:none; transform:translateY(20px); transition:all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); overflow:hidden;">
        
        <!-- List View -->
        <div id="gc-list-view" style="display:flex; flex-direction:column; height:100%;">
          <div style="padding:16px 20px; background:rgba(0,255,136,0.1); border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between;">
            <div style="font-weight:700; font-size:16px;">Tin Nhắn</div>
            <button onclick="toggleGlobalChat()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;"><i data-lucide="x" style="width:20px;"></i></button>
          </div>
          <div id="gc-list-body" style="flex:1; overflow-y:auto;">
            <!-- Chat Items -->
          </div>
        </div>

        <!-- Detail View -->
        <div id="gc-detail-view" style="display:none; flex-direction:column; height:100%;">
          <div style="padding:16px 20px; background:var(--bg-card); border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <button onclick="backToGlobalChatList()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:0;"><i data-lucide="arrow-left" style="width:20px;"></i></button>
              <div>
                <div id="gc-partner-name" style="font-weight:700; font-size:14px;">Tên Đối Tác</div>
                <div id="gc-drop-name" style="font-size:11px; color:var(--text-muted); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Mô hình...</div>
              </div>
            </div>
            <button onclick="toggleGlobalChat()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;"><i data-lucide="x" style="width:20px;"></i></button>
          </div>
          <div style="background: rgba(255, 170, 0, 0.1); color: #ffaa00; padding: 8px 12px; font-size: 11px; text-align: center; border-bottom: 1px solid rgba(255, 170, 0, 0.2);">
            <i data-lucide="alert-triangle" style="width:12px; display:inline-block; vertical-align:-2px;"></i> Cấm chia sẻ SĐT, Zalo ngoài nền tảng.
          </div>
          <div id="gc-detail-body" style="flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; background:var(--bg-base);">
            <!-- Messages -->
          </div>
          <div style="padding:12px; border-top:1px solid var(--border); background:var(--bg-card); display:flex; gap:8px;">
            <input type="text" id="gc-input" placeholder="Nhập tin nhắn..." style="flex:1; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:20px; padding:8px 16px; color:white; outline:none; font-size:13px;" onkeypress="if(event.key==='Enter') sendGlobalChatMsg()">
            <button onclick="sendGlobalChatMsg()" style="background:var(--accent-green); border:none; width:36px; height:36px; border-radius:18px; color:black; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i data-lucide="send" style="width:16px;"></i></button>
          </div>
        </div>

      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatWidgetHtml);
    
    // State
    window.gcActiveChatId = null;
    
    window.toggleGlobalChat = function() {
      const panel = document.getElementById('global-chat-panel');
      if (panel.style.opacity === '0') {
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'auto';
        panel.style.transform = 'translateY(0)';
        renderGlobalChatList();
      } else {
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';
        panel.style.transform = 'translateY(20px)';
      }
    };
    
    window.renderGlobalChatList = function() {
      const u = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : DB.getCurrentUser();
      const chats = DB.getChatsForUser(u.uid);
      const listBody = document.getElementById('gc-list-body');
      
      if (chats.length === 0) {
        listBody.innerHTML = '<div style="padding:32px; text-align:center; color:var(--text-muted); font-size:13px;"><i data-lucide="message-square" style="width:32px; opacity:0.5; margin-bottom:12px;"></i><br>Chưa có cuộc trò chuyện nào</div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }
      
      listBody.innerHTML = chats.map(c => {
        const isBuyer = c.buyerId === u.uid;
        const partnerId = isBuyer ? c.makerId : c.buyerId;
        const partner = DB.getUsers().find(x => x.uid === partnerId);
        const partnerName = partner ? partner.name : (isBuyer ? 'Xưởng In' : 'Khách Hàng');
        const lastMsg = c.messages.length ? c.messages[c.messages.length - 1].text : 'Chưa có tin nhắn';
        
        return `
          <div onclick="openGlobalChatDetail('${c.id}')" style="padding:16px; border-bottom:1px solid var(--border); cursor:pointer; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
            <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${partnerName}</div>
            <div style="font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px;">${c.dropName}</div>
            <div style="font-size:12px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; opacity:0.7;">${lastMsg}</div>
          </div>
        `;
      }).join('');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    };
    
    window.openGlobalChatDetail = function(chatId) {
      window.gcActiveChatId = chatId;
      document.getElementById('gc-list-view').style.display = 'none';
      document.getElementById('gc-detail-view').style.display = 'flex';
      
      const u = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : DB.getCurrentUser();
      const chat = DB.getChatById(chatId);
      const isBuyer = chat.buyerId === u.uid;
      const partnerId = isBuyer ? chat.makerId : chat.buyerId;
      const partner = DB.getUsers().find(x => x.uid === partnerId);
      
      document.getElementById('gc-partner-name').textContent = partner ? partner.name : (isBuyer ? 'Xưởng In' : 'Khách Hàng');
      document.getElementById('gc-drop-name').textContent = chat.dropName;
      
      renderGlobalChatMessages();
    };
    
    window.renderGlobalChatMessages = function() {
      if (!window.gcActiveChatId) return;
      const chat = DB.getChatById(window.gcActiveChatId);
      const u = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : DB.getCurrentUser();
      const bodyEl = document.getElementById('gc-detail-body');
      
      bodyEl.innerHTML = chat.messages.map(m => {
        const isMe = m.senderId === u.uid;
        return `
          <div style="padding:10px 14px; border-radius:14px; max-width:80%; font-size:13px; line-height:1.4; ${isMe ? 'background:var(--accent-green); color:black; align-self:flex-end; border-bottom-right-radius:4px;' : 'background:rgba(255,255,255,0.05); border:1px solid var(--border); align-self:flex-start; border-bottom-left-radius:4px;'}">${m.text}</div>
        `;
      }).join('');
      
      bodyEl.scrollTop = bodyEl.scrollHeight;
    };
    
    window.sendGlobalChatMsg = function() {
      const input = document.getElementById('gc-input');
      const text = input.value.trim();
      if (!text || !window.gcActiveChatId) return;
      
      const u = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : DB.getCurrentUser();
      DB.addMessage(window.gcActiveChatId, u.uid, text);
      input.value = '';
      renderGlobalChatMessages();
    };
    
    window.backToGlobalChatList = function() {
      window.gcActiveChatId = null;
      document.getElementById('gc-detail-view').style.display = 'none';
      document.getElementById('gc-list-view').style.display = 'flex';
      renderGlobalChatList();
    };
    
    window.startGlobalChat = function(makerId, dropId, dropName) {
      const u = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : DB.getCurrentUser();
      if (!u) {
        alert("Vui lòng đăng nhập để chat!");
        window.location.href = '/login/';
        return;
      }
      if (u.uid === makerId) {
        alert("Bạn không thể chat với chính mình.");
        return;
      }
      const chat = DB.createChat(u.uid, makerId, dropId, dropName);
      
      const panel = document.getElementById('global-chat-panel');
      panel.style.opacity = '1';
      panel.style.pointerEvents = 'auto';
      panel.style.transform = 'translateY(0)';
      
      openGlobalChatDetail(chat.id);
    };
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// CSS for dropdown
const dropStyle = document.createElement('style');
dropStyle.textContent = `
  .auth-dropdown.show { display: flex !important; }
  .auth-dropdown a:hover { background: rgba(255,255,255,0.05); }
`;
document.head.appendChild(dropStyle);

// Fix bfcache (Back button) loading issue
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.remove('active');
  }
});
