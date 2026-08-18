// ============================================================
// Legato — Authentication System (Firebase + Local Fallback)
// ============================================================

let firebaseAuth = null;
let googleProvider = null;

// Use already initialized Firebase app (from shared/firebase.js)
try {
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    firebaseAuth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    console.log("Firebase Auth Initialized!");
  }

} catch (error) {
  console.warn("Firebase Init Error:", error);
}

const Auth = {
  // Check if currently logged in
  getCurrentUser() {
    return DB.getCurrentUser();
  },

  // Logout
  logout() {
    if (firebaseAuth) {
      firebaseAuth.signOut().then(() => {
        DB.logout();
        window.location.reload();
      });
    } else {
      DB.logout();
      window.location.reload();
    }
  },

  // Login with Google (Real Firebase)
  loginWithGoogle() {
    if (!firebaseAuth) {
      alert("Tính năng Đăng nhập Google cần được cấu hình Firebase API Key trong file auth.js để hoạt động thật.");
      return;
    }
    
    document.getElementById('page-loader')?.classList.add('active');
    firebaseAuth.signInWithPopup(googleProvider)
      .then((result) => {
        const user = result.user;
        const isAdmin = ['admin@Legato.com', 'ceo@Legato.com', 'bpmodelshop@gmail.com'].includes(user.email);
        
        let bdUser = {
          uid: user.uid,
          name: user.displayName || "Google User",
          email: user.email,
          avatar: user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
          type: 'google',
          role: isAdmin ? 'admin' : 'member'
        };

        const users = DB.getUsers();
        const existingIdx = users.findIndex(u => u.uid === bdUser.uid || u.email === bdUser.email);
        
        if (existingIdx > -1) {
          // Merge to preserve role (if they were already a maker)
          const existingUser = users[existingIdx];
          bdUser = { ...existingUser, ...bdUser, role: isAdmin ? 'admin' : existingUser.role };
          users[existingIdx] = bdUser;
        } else {
          users.push(bdUser);
        }
        
        DB._set(DB.KEYS.USERS, users);
        DB.setCurrentUser(bdUser);
        
        const urlParams = new URLSearchParams(window.location.search);
        window.location.href = urlParams.get('next') || '/';
      })
      .catch((error) => {
        document.getElementById('page-loader')?.classList.remove('active');
        console.error(error);
        alert("Đăng nhập thất bại: " + error.message);
      });
  },

  // Mock Manual Email Login/Register for demo without Firebase
  registerEmail(name, email, password) {
    if (!name || !email || !password) return alert("Vui lòng nhập đủ thông tin!");
    
    document.getElementById('page-loader')?.classList.add('active');
    setTimeout(() => {
      const users = DB.getUsers();
      if (users.find(u => u.email === email)) {
        document.getElementById('page-loader')?.classList.remove('active');
        return alert("Email này đã được sử dụng!");
      }
      
      const isAdmin = ['admin@Legato.com', 'ceo@Legato.com', 'bpmodelshop@gmail.com'].includes(email);
      const newUser = {
        uid: DB.genId('user'),
        name: name,
        email: email,
        password: password, // In real app, never store plain text password
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        type: 'email',
        role: isAdmin ? 'admin' : 'member'
      };
      
      users.push(newUser);
      DB._set(DB.KEYS.USERS, users);
      DB.setCurrentUser(newUser);
      const urlParams = new URLSearchParams(window.location.search);
      window.location.href = urlParams.get('next') || '/';
    }, 800);
  },

  loginEmail(email, password) {
    if (!email || !password) return alert("Vui lòng nhập đủ thông tin!");
    
    document.getElementById('page-loader')?.classList.add('active');
    setTimeout(() => {
      const users = DB.getUsers();
      let user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Double check admin role on login just in case
        const isAdmin = ['admin@Legato.com', 'ceo@Legato.com', 'bpmodelshop@gmail.com'].includes(user.email);
        if (isAdmin && user.role !== 'admin') {
          user.role = 'admin';
          DB._set(DB.KEYS.USERS, users);
        }
        
        DB.setCurrentUser(user);
        const urlParams = new URLSearchParams(window.location.search);
        window.location.href = urlParams.get('next') || '/';
      } else {
        document.getElementById('page-loader')?.classList.remove('active');
        alert("Sai email hoặc mật khẩu!");
      }
    }, 800);
  }
};
