// ============================================================
// BookNest — JavaScript (Server version)
// Website ka "dimaag": login, books, cart, checkout, payment, order.
// Login/cart/orders SERVER par save hote hain (db.json me),
// isliye admin panel me dikhte hain. Wishlist sirf is browser me.
// Har section ke upar Hindi me samjhaya gaya hai.
// ============================================================

// ---------- 1. SERVER SE BAAT (API helper) ----------
async function api(path, opts) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...(opts || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// ---------- 2. WISHLIST — sirf is browser me save hoti hai ----------
const wishStore = {
  get() {
    try { return JSON.parse(localStorage.getItem('booknest_wishlist_' + (currentUser && currentUser.id))) || []; }
    catch (e) { return []; }
  },
  set(w) {
    try { localStorage.setItem('booknest_wishlist_' + currentUser.id, JSON.stringify(w)); } catch (e) {}
  },
};

let currentUser = null;
let detailQty = 1;
let ALL_BOOKS = []; // server se aati hain (22 books)

// ---------- 3. COVER PHOTO ----------
// Photo ho to <img>, na ho to rang-biranga dabba (fallback).
const COVER_COLORS = [
  'linear-gradient(135deg,#8a5a2b,#3b2f2f)', 'linear-gradient(135deg,#2f5d62,#1d3a3d)',
  'linear-gradient(135deg,#7b2d26,#3d1512)', 'linear-gradient(135deg,#274472,#14263f)',
  'linear-gradient(135deg,#5b3a8e,#2c1a4d)', 'linear-gradient(135deg,#1f6f54,#0f3d2e)',
];
function coverStyle(book) {
  let h = 0;
  for (const c of book.id) h = (h * 31 + c.charCodeAt(0)) % COVER_COLORS.length;
  return `background:${COVER_COLORS[h]}`;
}
function coverImg(book, style, cls) {
  if (!book.cover) return `<div class="book-cover ${cls || ''}" style="${coverStyle(book)};${style}">${book.title[0]}</div>`;
  return `<img src="${book.cover}" class="book-cover-img ${cls || ''}" style="${style}" alt="${book.title}" data-book="${book.id}" onerror="coverFallback(this)">`;
}
function coverFallback(img) {
  const b = ALL_BOOKS.find(x => x.id === img.dataset.book);
  const d = document.createElement('div');
  d.className = ('book-cover ' + img.className.replace('book-cover-img', '')).trim();
  d.style.cssText = coverStyle(b) + ';' + img.getAttribute('style');
  d.textContent = b.title[0];
  img.replaceWith(d);
}
// Kitne % discount hai — badge ke liye
function discountPct(b) { return Math.round((1 - b.price / b.mrp) * 100); }

// ---------- 4. 3D TILT — login card mouse ke saath jhukta hai ----------
function initTilt() {
  const scene = document.getElementById('authScene');
  const card = document.getElementById('tiltCard');
  if (!scene || !card) return;
  scene.addEventListener('mousemove', e => {
    const r = scene.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  scene.addEventListener('mouseleave', () => { card.style.transform = ''; });
}

// ---------- 5. LOGIN / SIGNUP (server par) ----------
function showAuthTab(which) {
  document.getElementById('tabLogin').classList.toggle('active', which === 'login');
  document.getElementById('tabSignup').classList.toggle('active', which === 'signup');
  document.getElementById('loginForm').classList.toggle('d-none', which !== 'login');
  document.getElementById('signupForm').classList.toggle('d-none', which !== 'signup');
}

async function doSignup(e) {
  e.preventDefault();
  const err = document.getElementById('signupError');
  err.textContent = '';
  try {
    const r = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('suUser').value.trim(),
        email: document.getElementById('suEmail').value.trim(),
        phone: document.getElementById('suPhone').value.trim(),
        password: document.getElementById('suPass').value,
      }),
    });
    await enterApp(r.user);
  } catch (ex) { err.textContent = ex.message; }
  return false;
}

async function doLogin(e) {
  e.preventDefault();
  const err = document.getElementById('loginError');
  err.textContent = '';
  try {
    const r = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        login: document.getElementById('loginId').value.trim(),
        password: document.getElementById('loginPass').value,
      }),
    });
    await enterApp(r.user);
  } catch (ex) { err.textContent = ex.message; }
  return false;
}

async function doLogout() {
  await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
  location.reload();
}

async function enterApp(user) {
  currentUser = user;
  ALL_BOOKS = await api('/api/books'); // saari 22 books server se
  document.getElementById('authView').classList.add('d-none');
  document.getElementById('appView').classList.remove('d-none');
  updateLikeBadge();
  go('store');
}

// ---------- 6. PAGES ----------
const VIEWS = ['store', 'cart', 'checkout', 'success', 'orders', 'wishlist', 'profile'];
function go(view) {
  VIEWS.forEach(v => document.getElementById('view-' + v).classList.add('d-none'));
  document.getElementById('view-' + view).classList.remove('d-none');
  if (view === 'store') loadBooks();
  if (view === 'cart') loadCart();
  if (view === 'checkout') loadCheckout();
  if (view === 'orders') loadOrders();
  if (view === 'wishlist') loadWishlist();
  if (view === 'profile') loadProfile();
  window.scrollTo(0, 0);
}

// ---------- 7. BOOKS (professional cards) ----------
// Ek book card ka HTML — store aur wishlist dono me kaam aata hai
function bookCardHTML(b) {
  const liked = getWishlist().includes(b.id);
  return `
    <div class="col">
      <div class="card h-100 book-card" onclick="openBook('${b.id}')">
        <div class="position-relative">
          <span class="discount-badge">-${discountPct(b)}%</span>
          <button class="like-btn ${liked ? 'liked' : ''}" title="Wishlist me jodo"
            onclick="event.stopPropagation();toggleLike('${b.id}')">
            <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </button>
          ${coverImg(b, 'width:100%;height:230px', 'card-img-top')}
        </div>
        <div class="card-body">
          <h6 class="card-title fw-bold mb-1">${b.title}</h6>
          <p class="card-text text-muted small mb-2">${b.author}</p>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="price">₹${b.price}
              <small class="text-muted text-decoration-line-through fw-normal">₹${b.mrp}</small></span>
            <span class="stars small">★ ${b.rating}</span>
          </div>
          <span class="badge bg-light text-dark border">${b.language} · ${b.category}</span>
        </div>
      </div>
    </div>`;
}

function loadBooks() {
  const q = document.getElementById('searchBox').value.toLowerCase();
  const language = document.getElementById('langFilter').value;
  const category = document.getElementById('catFilter').value;
  const list = ALL_BOOKS.filter(b =>
    (!q || (b.title + ' ' + b.author).toLowerCase().includes(q)) &&
    (language === 'All' || b.language === language) &&
    (category === 'All' || b.category === category));

  document.getElementById('bookGrid').innerHTML = list.length ? list.map(bookCardHTML).join('')
    : '<p class="text-muted">No books found. Try a different search.</p>';
  updateCartBadge();
  updateLikeBadge();
}

// ---------- 7b. WISHLIST (dil wali books — sirf is browser me) ----------
function getWishlist() { return currentUser ? wishStore.get() : []; }
function setWishlist(w) { wishStore.set(w); }

function toggleLike(bookId) {
  let w = getWishlist();
  w = w.includes(bookId) ? w.filter(x => x !== bookId) : [...w, bookId];
  setWishlist(w);
  updateLikeBadge();
  loadBooks();
  if (!document.getElementById('view-wishlist').classList.contains('d-none')) loadWishlist();
}

function updateLikeBadge() {
  if (!currentUser) return;
  const n = getWishlist().length;
  const badge = document.getElementById('likeCount');
  badge.textContent = n;
  badge.classList.toggle('d-none', n === 0);
}

function loadWishlist() {
  const list = ALL_BOOKS.filter(b => getWishlist().includes(b.id));
  document.getElementById('wishlistGrid').innerHTML = list.length ? list.map(bookCardHTML).join('')
    : `<div class="col-12"><div class="card card-body text-center p-5 cart-line">
         <div style="font-size:48px">💔</div>
         <h5 class="fw-bold mt-2">Wishlist khaali hai</h5>
         <p class="text-muted">Kisi book par ❤️ dabao — wo yahan save ho jayegi.</p>
         <div><button class="btn btn-glow" onclick="go('store')">Browse Books</button></div></div></div>`;
}

// ---------- 7c. PROFILE ----------
async function loadProfile() {
  const u = currentUser;
  const orders = await api('/api/orders').catch(() => []);
  document.getElementById('profileBody').innerHTML = `
    <div class="card cart-line mx-auto" style="max-width:520px"><div class="card-body p-4 text-center">
      <div class="profile-avatar">${u.username[0].toUpperCase()}</div>
      <h4 class="fw-bold mb-1">${u.username}</h4>
      <p class="text-muted mb-4">BookNest member</p>
      <div class="text-start">
        <p class="mb-2">✉️ <b>Email:</b> ${u.email}</p>
        <p class="mb-2">📞 <b>Phone:</b> ${u.phone}</p>
        <p class="mb-4">📦 <b>Total Orders:</b> ${orders.length} &nbsp; ❤️ <b>Wishlist:</b> ${getWishlist().length}</p>
      </div>
      <div class="d-flex gap-2 justify-content-center flex-wrap">
        <button class="btn btn-glow" onclick="go('orders')">My Orders</button>
        <button class="btn btn-outline-danger" onclick="doLogout()">Logout</button>
      </div>
    </div></div>`;
}

// Search icon dabane par store kholo aur search me cursor lagao
function focusSearch() {
  go('store');
  setTimeout(() => document.getElementById('searchBox').focus(), 80);
}

function openBook(id) {
  const b = ALL_BOOKS.find(x => x.id === id);
  detailQty = 1;
  document.getElementById('bookModalBody').innerHTML = `
    <div class="modal-header border-0">
      <h5 class="modal-title fw-bold">${b.title}</h5>
      <button class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body pt-0">
      <div class="row g-4">
        <div class="col-md-4">${coverImg(b, 'width:100%;height:300px;border-radius:12px')}</div>
        <div class="col-md-8">
          <p class="text-muted">by <b>${b.author}</b> · ${b.language} · ${b.category}</p>
          <p class="stars">★ ${b.rating} / 5 <small class="text-muted">· Bestseller</small></p>
          <p>${b.desc}</p>
          <h3 class="price">₹${b.price}
            <small class="text-muted text-decoration-line-through fw-normal">₹${b.mrp}</small>
            <span class="badge bg-danger ms-2">-${discountPct(b)}%</span></h3>
          <div class="d-flex align-items-center gap-2 my-3">
            <button class="btn btn-outline-secondary qty-btn" onclick="chQty(-1)">−</button>
            <span id="qtyVal" class="fw-bold fs-5">1</span>
            <button class="btn btn-outline-secondary qty-btn" onclick="chQty(1)">+</button>
            <button class="btn btn-glow ms-2 flex-grow-1" onclick="addToCart('${b.id}')">🛒 Add to Cart</button>
          </div>
          <p class="text-muted small mb-0">🚚 Free delivery on orders above ₹499 · ↩️ 7-day returns</p>
        </div>
      </div>
    </div>`;
  new bootstrap.Modal(document.getElementById('bookModal')).show();
}
function chQty(d) {
  detailQty = Math.max(1, Math.min(9, detailQty + d));
  document.getElementById('qtyVal').textContent = detailQty;
}

// ---------- 8. CART (server par save hota hai) ----------
async function addToCart(bookId) {
  await api('/api/cart', { method: 'POST', body: JSON.stringify({ bookId, qty: detailQty }) });
  bootstrap.Modal.getInstance(document.getElementById('bookModal')).hide();
  updateCartBadge();
  go('cart');
}

async function updateCartBadge() {
  if (!currentUser) return;
  try {
    const cart = await api('/api/cart');
    const n = cart.reduce((s, x) => s + x.qty, 0);
    const badge = document.getElementById('cartCount');
    badge.textContent = n;
    badge.classList.toggle('d-none', n === 0);
  } catch (e) { /* ignore */ }
}

function cartTotal(cart) {
  return cart.reduce((s, x) => s + x.book.price * x.qty, 0);
}
function deliveryFee(subtotal) {
  return subtotal >= 499 ? 0 : 49;
}

async function loadCart() {
  const cart = await api('/api/cart').catch(() => []);
  const list = document.getElementById('cartList');
  const footer = document.getElementById('cartFooter');
  if (!cart.length) {
    list.innerHTML = `<div class="card card-body text-center p-5 cart-line">
      <div style="font-size:48px">🛒</div>
      <h5 class="fw-bold mt-2">Your cart is empty</h5>
      <p class="text-muted">Add some books to get started!</p>
      <div><button class="btn btn-glow" onclick="go('store')">Browse Books</button></div></div>`;
    footer.innerHTML = '';
    return;
  }
  list.innerHTML = cart.map(x => `
    <div class="card mb-2 cart-line"><div class="card-body d-flex align-items-center gap-3">
      ${coverImg(x.book, 'width:56px;height:84px;border-radius:8px;flex-shrink:0')}
      <div class="flex-grow-1">
        <h6 class="mb-0 fw-bold">${x.book.title}</h6>
        <small class="text-muted">${x.book.author}</small><br>
        <span class="price">₹${x.book.price}</span>
        <small class="text-muted"> × ${x.qty} = </small><b>₹${x.book.price * x.qty}</b><br>
        <button class="btn btn-link btn-sm text-danger p-0" onclick="removeFromCart('${x.bookId}')">Remove</button>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary qty-btn" onclick="setQty('${x.bookId}',${x.qty - 1})">−</button>
        <span class="fw-bold">${x.qty}</span>
        <button class="btn btn-sm btn-outline-secondary qty-btn" onclick="setQty('${x.bookId}',${x.qty + 1})">+</button>
      </div>
    </div></div>`).join('');
  const subtotal = cartTotal(cart);
  const delivery = deliveryFee(subtotal);
  footer.innerHTML = `<div class="card card-body cart-line d-flex flex-row justify-content-between align-items-center mt-3">
    <div>
      <div class="fs-5 fw-bold">Total: ₹${subtotal + delivery}</div>
      <small class="text-muted">Delivery: ${delivery === 0 ? 'FREE 🎉' : '₹' + delivery} (free above ₹499)</small>
    </div>
    <button class="btn btn-glow btn-lg" onclick="go('checkout')">Checkout →</button></div>`;
}
async function setQty(bookId, qty) {
  if (qty < 1) return removeFromCart(bookId);
  await api('/api/cart/' + bookId, { method: 'PUT', body: JSON.stringify({ qty }) });
  loadCart(); updateCartBadge();
}
async function removeFromCart(bookId) {
  await api('/api/cart/' + bookId, { method: 'DELETE' });
  loadCart(); updateCartBadge();
}

// ---------- 9. CHECKOUT + PAYMENT ----------
// Payment method badalne par sahi fields dikhao
function togglePayFields() {
  const pay = document.querySelector('input[name="pay"]:checked').value;
  document.getElementById('upiFields').classList.toggle('d-none', pay !== 'UPI');
  document.getElementById('cardFields').classList.toggle('d-none', pay !== 'Card');
}

// Checkout khulne par order summary bharo
async function loadCheckout() {
  const cart = await api('/api/cart').catch(() => []);
  if (!cart.length) { go('cart'); return; }
  const subtotal = cartTotal(cart);
  const delivery = deliveryFee(subtotal);
  document.getElementById('checkoutSummary').innerHTML =
    cart.map(x => `<div class="d-flex justify-content-between mb-2">
        <span>${x.book.title} <small class="text-muted">× ${x.qty}</small></span>
        <b>₹${x.book.price * x.qty}</b></div>`).join('') +
    `<hr><div class="d-flex justify-content-between mb-2">
       <span class="text-muted">Delivery</span><b>${delivery === 0 ? 'FREE' : '₹' + delivery}</b></div>
     <div class="d-flex justify-content-between fs-5"><span class="fw-bold">To Pay</span>
       <span class="price fs-4">₹${subtotal + delivery}</span></div>`;
  togglePayFields();
}

async function placeOrder(e) {
  e.preventDefault();
  const err = document.getElementById('coError');
  err.textContent = '';
  const name = document.getElementById('coName').value.trim();
  const address = document.getElementById('coAddr').value.trim();
  const city = document.getElementById('coCity').value.trim();
  const pincode = document.getElementById('coPin').value.trim();
  const pay = document.querySelector('input[name="pay"]:checked').value;

  if (!name || !address || !city || !pincode) { err.textContent = 'Delivery details required'; return false; }
  if (!/^[0-9]{6}$/.test(pincode)) { err.textContent = 'Pincode must be 6 digits'; return false; }

  // Payment ke hisaab se extra validation — NOTE: ye demo hai, asli paise nahi kat te
  let payment = pay;
  if (pay === 'UPI') {
    const upiId = document.getElementById('upiId').value.trim();
    if (!upiId || !upiId.includes('@')) { err.textContent = 'Please enter a valid UPI ID (e.g. name@upi)'; return false; }
    payment = 'UPI (' + upiId + ')';
  } else if (pay === 'Card') {
    const num = document.getElementById('cardNum').value.replace(/\s/g, '');
    const exp = document.getElementById('cardExp').value.trim();
    const cvv = document.getElementById('cardCvv').value.trim();
    if (!/^[0-9]{16}$/.test(num)) { err.textContent = 'Card number must be 16 digits'; return false; }
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(exp)) { err.textContent = 'Expiry must be MM/YY format'; return false; }
    if (!/^[0-9]{3,4}$/.test(cvv)) { err.textContent = 'Invalid CVV'; return false; }
    payment = 'Card (•••• ' + num.slice(-4) + ')'; // sirf aakhri 4 digit bhejte hain
  }

  try {
    const r = await api('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ name, address, city, pincode, payment }),
    });
    const o = r.order;
    document.getElementById('successText').innerHTML =
      `Order <b>${o.id}</b> · <b>₹${o.total}</b><br>Payment: ${o.payment}<br>Thank you, ${o.name}! 🎉`;
    updateCartBadge();
    go('success');
  } catch (ex) { err.textContent = ex.message; }
  return false;
}

// ---------- 10. ORDERS (server se) ----------
async function loadOrders() {
  const orders = await api('/api/orders').catch(() => []);
  document.getElementById('orderList').innerHTML = orders.length ? orders.map(o => `
    <div class="card mb-3 order-card"><div class="card-body">
      <span class="badge bg-success float-end">${o.status}</span>
      <h6 class="fw-bold mb-0">${o.id}</h6>
      <small class="text-muted">${new Date(o.placedAt).toLocaleString('en-IN')} · ${o.payment}</small>
      <ul class="mt-2 mb-2">${o.items.map(i => `<li>${i.title} × ${i.qty} — ₹${i.price * i.qty}</li>`).join('')}</ul>
      <div class="fw-bold">Total paid: <span class="price">₹${o.total}</span></div>
      <small class="text-muted">🚚 ${o.name}, ${o.address}, ${o.city} — ${o.pincode}</small>
    </div></div>`).join('')
    : `<div class="card card-body text-center p-5 cart-line">
         <div style="font-size:48px">📦</div>
         <h5 class="fw-bold mt-2">No orders yet</h5>
         <p class="text-muted">Your orders will appear here.</p>
         <div><button class="btn btn-glow" onclick="go('store')">Start Shopping</button></div></div>`;
}

// ---------- 11. FOOTER INFO (About Us / Policies) ----------
const INFO_CONTENT = {
  legacy: ['Our Legacy', 'BookNest ki shuruaat ek chhote se sapne se hui — har ghar tak achhi kitabein pahunchana. Aaj hamare paas Hindi aur English ki handpicked bestsellers hain, best prices aur fast delivery ke saath. 📚'],
  authors: ['Authors', 'Hamare saath Munshi Premchand, Harivansh Rai Bachchan, A.P.J. Abdul Kalam jaise mahan lekhakon ki kitabein hain — aur naye authors ka swagat hai!'],
  careers: ['Careers', 'BookNest ke saath kaam karna chahte ho? Humein likho: <b>booknest@gmail.com</b> — subject me "Career" likhna na bhoolo.'],
  published: ['Get Published', 'Apni kitab publish karwana chahte ho? Apna manuscript <b>booknest@gmail.com</b> par bhejo — hamari team 7 din me jawab degi.'],
  preorder: ['Pre-Order', 'Jaldi aa rahi hain nayi kitabein! Pre-order par <b>extra 10% off</b> milega. Updates ke liye jude raho. 🚀'],
  findstore: ['Find A Store', 'Hamara store: <b>BookNest, MG Road, Jaipur, Rajasthan 302001</b><br>Timing: Mon–Sat, 10am–7pm'],
  news: ['News & Events', '📢 <b>Is mahine:</b> Bestsellers par 30% tak off!<br>📢 <b>Jaldi:</b> Kids books ka naya collection aa gaya hai. 🎉'],
  privacy: ['Privacy Policy', 'Tumhara data (naam, email, phone, address) sirf order delivery ke liye use hota hai. Hum tumhara data kisi teesre ko <b>kabhi nahi bechte</b>.'],
  secure: ['Secure Shopping', 'Hamari checkout 256-bit encryption se surakshit hai. Tumhare card ka poora number hum kabhi save nahi karte — sirf aakhri 4 digit dikhta hai. 🔒'],
  payments: ['Payments Policy', 'Hum <b>Cash on Delivery, UPI</b> (Google Pay/PhonePe/Paytm) aur <b>Credit/Debit Card</b> (Visa, Mastercard, RuPay) accept karte hain.'],
  shipping: ['Shipping Policy', 'Order 24–48 ghante me dispatch hota hai. Delivery me 3–7 din lagte hain. <b>₹499 se upar ke orders par delivery FREE</b> hai, warna ₹49 lagta hai. 🚚'],
  cancellation: ['Cancellation Policy', 'Order dispatch hone se pehle tak <b>24 ghante ke andar</b> cancel kar sakte ho — <b>booknest@gmail.com</b> par order ID bhejo. Paise 5–7 din me wapas mil jayenge.'],
};

function showInfo(key) {
  const [title, body] = INFO_CONTENT[key] || ['Info', ''];
  document.getElementById('infoTitle').textContent = title;
  document.getElementById('infoBody').innerHTML = `<p>${body}</p>`;
  new bootstrap.Modal(document.getElementById('infoModal')).show();
}

function showContact() {
  new bootstrap.Modal(document.getElementById('contactModal')).show();
}

// ---------- 12. START ----------
// Pehle dekho koi login session hai ya nahi; nahi to login page dikhao
(async function init() {
  initTilt();
  try {
    const r = await api('/api/auth/me');
    if (r.user) { await enterApp(r.user); return; }
  } catch (e) { /* server nahi chala ya session nahi */ }
  document.getElementById('authView').classList.remove('d-none');
})();
