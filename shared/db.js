// ============================================================
// Legato — StockX Style LocalStorage DB
// ============================================================

const DB = {
  KEYS: {
    DROPS: 'curated_drops_v5',
    USERS: 'bd_users_v5',
    ORDERS: 'orders_v5',
    MAKER_APPS: 'maker_apps_v5',
    CHATS: 'bd_chats_v5',
    NEWS: 'bd_news_v1'
  },

  SEED_NEWS: [
    {
      id: 'news_001',
      title: 'Công Nghệ In 3D Resin 8K Đang Thay Đổi Cách Chúng Ta Làm Mô Hình',
      image: 'https://images.unsplash.com/photo-1596726888463-5be813636f2a?w=600&q=80',
      summary: 'Khám phá sự khác biệt vượt trội giữa máy in Resin 8K và công nghệ SLA truyền thống. Sự lựa chọn hoàn hảo cho dân chơi figure.',
      content: 'Công nghệ in 3D đang có những bước nhảy vọt đáng kể, đặc biệt là với sự ra đời của các dòng máy in 3D Resin độ phân giải 8K. Khác với FDM truyền thống hay các dòng SLA đời cũ, công nghệ MSLA sử dụng màn hình LCD 8K cho phép tạo ra các chi tiết cực kỳ tinh xảo, mượt mà mà mắt thường khó có thể phân biệt được các lớp in (layer lines).\n\nSự sắc nét vượt trội này là lý do vì sao các xưởng in chuyên về mô hình tĩnh (Figure), sa bàn (Diorama) hay thậm chí là trang sức đang đồng loạt chuyển sang sử dụng Resin 8K. Tuy nhiên, nó cũng đi kèm với thách thức: giá thành mực in đắt đỏ và yêu cầu quy trình xử lý sau in (Post-processing) nghiêm ngặt để đảm bảo an toàn sức khỏe.',
      author: 'Admin',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'news_002',
      title: 'Cách Chọn Chất Liệu In 3D Phù Hợp Cho Từng Mô Hình',
      image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80',
      summary: 'PLA, ABS, PETG hay Resin? Hướng dẫn chi tiết cách chọn loại vật liệu in tốt nhất cho dự án tiếp theo của bạn.',
      content: 'Tùy thuộc vào nhu cầu sử dụng, độ chi tiết và môi trường bảo quản mà chúng ta có những lựa chọn chất liệu khác nhau...',
      author: 'Legato Team',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'news_003',
      title: 'Top 5 Mẫu Cosplay Props Hot Nhất Tháng Này',
      image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&q=80',
      summary: 'Khám phá các bản thiết kế đạo cụ Cosplay đang làm mưa làm gió trong cộng đồng in 3D.',
      content: 'Từ mặt nạ Iron Man đến katana của Demon Slayer, hãy cùng xem những bản thiết kế nào đang được tải về nhiều nhất...',
      author: 'CosplayCorner',
      createdAt: new Date(Date.now() - 259200000).toISOString()
    }
  ],

  SEED_DROPS: [
    {
      id: 'drop_001',
      name: 'Articulated Crystal Dragon',
      category: 'Đồ Chơi (Toys)',
      designer: 'Cinderwing3D',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cinder',
      retailPrice: 18.99,
      image: 'https://images.unsplash.com/photo-1596726888463-5be813636f2a?w=600&q=80',
      model3d: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Fallback model for demo
      gallery: [
        'https://images.unsplash.com/photo-1596726888463-5be813636f2a?w=600&q=80'
      ],
      desc: 'Mô hình Rồng Pha Lê (Crystal Dragon) với các khớp nối linh hoạt, uốn lượn sinh động. \nĐược in 3D nguyên khối không cần lắp ráp. Rất phù hợp làm quà tặng, đồ trang trí bàn làm việc hoặc đồ chơi xả stress (Fidget Toy).',
      specs: '- Công nghệ in: FDM (Nhựa PLA sinh học)\n- Chiều dài: 45cm\n- Thời gian in: ~18 giờ\n- Đặc điểm: Có thể đổi màu sắc tự do (Color-shifting Filament)',
      asks: [
        { id: 'ask_1', type: 'new', price: 20.00, seller: 'Hà Nội 3D Print', makerId: 'user_1' },
        { id: 'ask_2', type: 'new', price: 18.50, seller: 'SG Maker Space', makerId: 'user_2' }
      ]
    },
    {
      id: 'drop_002',
      name: 'Geometric Low-Poly Planter',
      category: 'Trang Trí (Home Decor)',
      designer: 'MakersMuse',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=muse',
      retailPrice: 12.50,
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80',
      gallery: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80'],
      desc: 'Chậu trồng cây sen đá, xương rồng thiết kế theo phong cách Geometric Low-Poly hiện đại. \nTạo điểm nhấn cho không gian làm việc. Sản phẩm đã bao gồm lỗ thoát nước tiêu chuẩn.',
      specs: '- Công nghệ in: FDM\n- Chất liệu: PETG (Chống tia UV, chịu nhiệt độ ngoài trời)\n- Kích thước: 12x12x10 cm',
      asks: [
        { id: 'ask_3', type: 'new', price: 12.00, seller: 'Đà Nẵng 3D', makerId: 'user_3' }
      ]
    },
    {
      id: 'drop_003',
      name: 'Iron Man MK50 Helmet 1:1',
      category: 'Cosplay Props',
      designer: 'HeroForge Labs',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=iron',
      retailPrice: 85.00,
      image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&q=80',
      gallery: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&q=80'],
      desc: 'Mặt nạ Iron Man Mark 50 tỷ lệ 1:1 (Real size) có thể đội được. \nPhù hợp cho Cosplay hoặc trưng bày. Lưu ý: Sản phẩm là phôi in thô (RAW 3D Print), cần tự chà nhám và sơn màu.',
      specs: '- Công nghệ in: FDM\n- Nhựa PLA+ độ cứng cao\n- Gồm 5 mảnh ghép (Faceplate rời, có thể gắn bản lề motor)',
      asks: []
    },
    {
      id: 'drop_004',
      name: 'DnD Orc Warchief Miniature',
      category: 'Boardgame Miniatures',
      designer: 'LootStudios',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=loot',
      retailPrice: 9.99,
      image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=600&q=80',
      gallery: ['https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=600&q=80'],
      desc: 'Mô hình Orc Warchief siêu chi tiết dành cho người chơi Dungeons & Dragons, Warhammer hoặc sưu tầm sơn Miniature. \nĐế base 32mm tiêu chuẩn.',
      specs: '- Công nghệ in: MSLA Resin 8K\n- Độ phân giải: 0.03mm Layer height (siêu nét)\n- Đã xử lý rửa cồn và sấy UV',
      asks: [
        { id: 'ask_4', type: 'new', price: 9.50, seller: 'Resin Master SG', makerId: 'user_2' }
      ]
    },
    {
      id: 'drop_005',
      name: 'Cyberpunk Oni Mask',
      category: 'Cosplay Props',
      designer: 'NeonCity 3D',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oni',
      retailPrice: 55.00,
      image: 'https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=600&q=80',
      gallery: ['https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=600&q=80'],
      desc: 'Mặt nạ quỷ Oni phong cách Cyberpunk cực ngầu, có thể đeo hoặc treo tường. Bề mặt nhám mờ.',
      specs: '- Công nghệ in: FDM hoặc Resin\n- Kích thước: Free size',
      asks: [
        { id: 'ask_5', type: 'new', price: 50.00, seller: 'Đà Nẵng 3D', makerId: 'user_3' }
      ]
    },
    {
      id: 'drop_006',
      name: 'Kame House Diorama',
      category: 'Figure Diorama',
      designer: 'AnimePrintZ',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kame',
      retailPrice: 35.00,
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&q=80',
      gallery: ['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&q=80'],
      desc: 'Mô hình phong cảnh nhà rùa Kame House nổi tiếng trong Dragon Ball. Các mảnh dễ dàng sơn và lắp ráp.',
      specs: '- Vật liệu khuyên dùng: PLA\n- Cần lắp ráp bằng keo',
      asks: []
    },
    {
      id: 'drop_007',
      name: 'Mechanical T-Rex Skeleton',
      category: 'Đồ Chơi (Toys)',
      designer: 'DinoMecha',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trex',
      retailPrice: 22.00,
      image: 'https://images.unsplash.com/photo-1567117189196-1934ec71da70?w=600&q=80',
      gallery: ['https://images.unsplash.com/photo-1567117189196-1934ec71da70?w=600&q=80'],
      desc: 'Khung xương khủng long T-Rex lai máy móc. Rất ngầu để trưng bày.',
      specs: '- In không cần support\n- Các khớp có thể cử động',
      asks: [
        { id: 'ask_7', type: 'new', price: 19.99, seller: 'Hà Nội 3D Print', makerId: 'user_1' }
      ]
    },
    {
      id: 'drop_008',
      name: 'Hogwarts Castle Lamp Lithophane',
      category: 'Trang Trí (Home Decor)',
      designer: 'MagicLamps',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hogwarts',
      retailPrice: 40.00,
      image: 'https://images.unsplash.com/photo-1618944847023-38aa001235f0?w=600&q=80',
      gallery: ['https://images.unsplash.com/photo-1618944847023-38aa001235f0?w=600&q=80'],
      desc: 'Đèn ngủ in bằng kỹ thuật Lithophane (ảnh nổi 3D). Khi bật đèn sẽ hiện ra bóng lâu đài Hogwarts tuyệt đẹp.',
      specs: '- Vỏ in 3D nhựa PLA Trắng tinh khiết\n- Đã kèm sẵn mạch LED',
      asks: []
    },
    {
      id: 'drop_009',
      name: 'Raiden Shogun Figure',
      category: 'Anime Figure',
      designer: 'WaifuPrint',
      designerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raiden',
      retailPrice: 120.00,
      image: 'https://images.unsplash.com/photo-1654157925394-4b7809721149?w=600&q=80',
      gallery: ['https://images.unsplash.com/photo-1654157925394-4b7809721149?w=600&q=80'],
      desc: 'Mô hình tĩnh Raiden Shogun (Genshin Impact). In siêu nét bằng Resin, độ cao 25cm.',
      specs: '- Công nghệ in: Resin 8K\n- Đã lên màu sơn phủ Clear bảo vệ',
      asks: [
        { id: 'ask_9', type: 'new', price: 110.00, seller: 'SG Maker Space', makerId: 'user_2' }
      ]
    }
  ],

  SEED_USERS: [
    {
      uid: 'user_1',
      name: 'Hà Nội 3D Print',
      email: 'hn3d@benchy.vn',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hn3d',
      role: 'maker',
      location: 'Hà Nội, VN',
      lat: 21.0285,
      lng: 105.8542,
      completedJobs: 125,
      rating: 4.9,
      trustLevel: 'Verified Maker'
    },
    {
      uid: 'user_2',
      name: 'SG Maker Space',
      email: 'sgmaker@benchy.vn',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sgmaker',
      role: 'maker',
      location: 'Hồ Chí Minh, VN',
      lat: 10.8231,
      lng: 106.6297,
      completedJobs: 342,
      rating: 5.0,
      trustLevel: 'Pro Maker'
    },
    {
      uid: 'user_3',
      name: 'Đà Nẵng 3D',
      email: 'dn3d@benchy.vn',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dn3d',
      role: 'maker',
      location: 'Đà Nẵng, VN',
      lat: 16.0544,
      lng: 108.2022,
      completedJobs: 45,
      rating: 4.7,
      trustLevel: 'Verified Maker'
    }
  ],

  SEED_BIDS: [
    {
      id: 'bid_001',
      dropId: 'drop_003',
      dropName: 'Iron Man MK50 Helmet 1:1',
      dropImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=200&q=80',
      budget: 80.00,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ],

  SEED_ORDERS: [
    {
      id: 'ord_001',
      dropName: 'Articulated Crystal Dragon',
      buyerEmail: 'nguyenvan.khachhang@example.com',
      price: 20.00,
      status: 'shipping',
      createdAt: new Date().toISOString()
    }
  ],

  _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  },
  _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },

  init() {
    let drops = this._get(this.KEYS.DROPS);
    if (!drops || drops.length === 0) {
      this._set(this.KEYS.DROPS, this.SEED_DROPS);
    } else {
      let updated = false;
      drops = drops.map(d => {
        if (!d.createdAt) {
          d.createdAt = new Date(Date.now() - Math.random() * 10000000000).toISOString();
          d.author = d.designer || 'Admin';
          d.location = 'Hà Nội, VN';
          updated = true;
        }
        return d;
      });
      if (updated) this._set(this.KEYS.DROPS, drops);
    }
    
    const bids = this._get(this.KEYS.BIDS);
    if (!bids || bids.length === 0)  this._set(this.KEYS.BIDS, this.SEED_BIDS);
    
    const users = this._get(this.KEYS.USERS);
    if (!users || users.length === 0) this._set(this.KEYS.USERS, this.SEED_USERS);

    const orders = this._get(this.KEYS.ORDERS);
    if (!orders || orders.length === 0) this._set(this.KEYS.ORDERS, this.SEED_ORDERS);

    const apps = this._get(this.KEYS.MAKER_APPS);
    if (!apps) this._set(this.KEYS.MAKER_APPS, []);

    const chats = this._get(this.KEYS.CHATS);
    if (!chats) this._set(this.KEYS.CHATS, []);
    
    const news = this._get(this.KEYS.NEWS);
    if (!news || news.length === 0) this._set(this.KEYS.NEWS, this.SEED_NEWS);
  },

  getNews() { return this._get(this.KEYS.NEWS) || []; },
  addNews(article) {
    const news = this.getNews(); news.unshift(article); this._set(this.KEYS.NEWS, news);
  },
  updateNews(id, data) {
    const news = this.getNews().map(n => n.id === id ? {...n, ...data} : n);
    this._set(this.KEYS.NEWS, news);
  },
  deleteNews(id) {
    const news = this.getNews().filter(n => n.id !== id);
    this._set(this.KEYS.NEWS, news);
  },

  getDrops() { return this._get(this.KEYS.DROPS) || []; },
  updateDropAsks(dropId, asks) {
    const drops = this.getDrops().map(d => d.id === dropId ? {...d, asks} : d);
    this._set(this.KEYS.DROPS, drops);
  },
  addDrop(drop) {
    const drops = this.getDrops(); drops.unshift(drop); this._set(this.KEYS.DROPS, drops);
  },
  updateDrop(dropId, updatedData) {
    const drops = this.getDrops().map(d => d.id === dropId ? {...d, ...updatedData} : d);
    this._set(this.KEYS.DROPS, drops);
  },
  deleteDrop(dropId) {
    const drops = this.getDrops().filter(d => d.id !== dropId);
    this._set(this.KEYS.DROPS, drops);
  },

  getBids() { return this._get(this.KEYS.BIDS) || []; },
  addBid(bid) {
    const b = this.getBids(); b.unshift(bid); this._set(this.KEYS.BIDS, b);
  },
  acceptBid(bidId) {
    const bids = this.getBids().map(b => b.id === bidId ? {...b, status: 'accepted'} : b);
    this._set(this.KEYS.BIDS, bids);
  },

  getOrders() { return this._get(this.KEYS.ORDERS) || []; },
  addOrder(order) {
    const arr = this.getOrders();
    arr.unshift(order);
    this._set(this.KEYS.ORDERS, arr);
  },

  getUsers() { return this._get(this.KEYS.USERS) || []; },
  updateUser(uid, data) {
    const users = this.getUsers().map(u => u.uid === uid ? {...u, ...data} : u);
    this._set(this.KEYS.USERS, users);
    
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.uid === uid) {
      this.setCurrentUser({...currentUser, ...data});
    }
  },

  getMakerApps() { return this._get(this.KEYS.MAKER_APPS) || []; },
  addMakerApp(app) {
    const apps = this.getMakerApps();
    apps.unshift(app);
    this._set(this.KEYS.MAKER_APPS, apps);
  },
  updateMakerAppStatus(appId, status) {
    const apps = this.getMakerApps().map(a => a.id === appId ? {...a, status} : a);
    this._set(this.KEYS.MAKER_APPS, apps);
  },

  getChats() { return this._get(this.KEYS.CHATS) || []; },
  getChatById(id) { return this.getChats().find(c => c.id === id); },
  getChatsForUser(uid) { return this.getChats().filter(c => c.buyerId === uid || c.makerId === uid); },
  createChat(buyerId, makerId, dropId, dropName) {
    const chats = this.getChats();
    const existing = chats.find(c => c.buyerId === buyerId && c.makerId === makerId && c.dropId === dropId);
    if (existing) return existing;
    
    const newChat = {
      id: this.genId('chat'),
      buyerId, makerId, dropId, dropName,
      createdAt: new Date().toISOString(),
      messages: []
    };
    chats.unshift(newChat);
    this._set(this.KEYS.CHATS, chats);
    return newChat;
  },
  
  maskSpamKeywords(text) {
    if (!text) return text;
    let masked = text;
    // Mask phone numbers
    masked = masked.replace(/(0[35789]\d{8})/g, '<span style="color:#ff5555;font-weight:bold;" title="Vi phạm chính sách">[SĐT BỊ CHE]</span>');
    // Mask words
    const words = ['zalo', 'facebook', ' fb ', 'messenger', 'chuyển khoản', ' ck ', ' stk ', 'momo'];
    words.forEach(w => {
      const regex = new RegExp(w, 'gi');
      masked = masked.replace(regex, '<span style="color:#ff5555;font-weight:bold;" title="Vi phạm chính sách">[HỆ THỐNG CHE]</span>');
    });
    return masked;
  },

  addMessage(chatId, senderId, text) {
    const chats = this.getChats();
    const idx = chats.findIndex(c => c.id === chatId);
    if (idx === -1) return null;
    
    // Mask the text before saving
    const originalText = text;
    const maskedText = this.maskSpamKeywords(text);
    
    const msg = {
      id: this.genId('msg'),
      senderId,
      text: maskedText,
      isMasked: originalText !== maskedText,
      timestamp: new Date().toISOString()
    };
    
    chats[idx].messages.push(msg);
    // Bring chat to top
    const chat = chats.splice(idx, 1)[0];
    chats.unshift(chat);
    
    this._set(this.KEYS.CHATS, chats);
    return chat;
  },

  genId(prefix='id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; },
  formatUSD(n) { return `$${Number(n).toFixed(2)}`; },
  
  // Anti-XSS Utility
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  
  // Auth State
  getCurrentUser() { return this._get('current_user_v3'); },
  setCurrentUser(user) { this._set('current_user_v3', user); },
  logout() { localStorage.removeItem('current_user_v3'); }
};
