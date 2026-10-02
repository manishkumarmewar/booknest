// ============================================================
// BookNest — Server (Node.js + Express)
// Real login/signup with secure password hashing (scrypt),
// cart + orders API, admin panel API.
//
// DATA STORAGE (2 tareeke — automatic select):
//   1. DATABASE_URL env var set hai  →  PostgreSQL (Render par
//      permanent storage — restart/redeploy par data NAHI udega)
//   2. DATABASE_URL nahi hai         →  db.json file (localhost
//      par chalane ke liye, pehle jaisa)
//
// Run (localhost):  npm install   then   node server.js
// Open: http://localhost:3000
// Admin: http://localhost:3000/admin.html  (password: admin123)
// ============================================================

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const DATABASE_URL = process.env.DATABASE_URL || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- Book catalog (22 books) ----------------
function seedBooks() {
  return [
    { id: 'b01', cover: 'images/b01.jpg', title: 'Godaan', author: 'Munshi Premchand', language: 'Hindi', category: 'Classic', price: 199, mrp: 299, rating: 4.8, desc: 'Premchand ka amar upanyas — ek kisan ke jeevan ka sangharsh aur sapne.' },
    { id: 'b02', title: 'Madhushala', author: 'Harivansh Rai Bachchan', language: 'Hindi', category: 'Poetry', price: 149, mrp: 225, rating: 4.9, desc: 'Hindi sahitya ki sabse prasiddh kavya-kriti — jeevan darshan kavitaon me.' },
    { id: 'b03', cover: 'images/b03.jpg', title: 'Nirmala', author: 'Munshi Premchand', language: 'Hindi', category: 'Classic', price: 129, mrp: 199, rating: 4.6, desc: 'Dahej pratha par likha hriday-sparshi upanyas.' },
    { id: 'b04', cover: 'images/b04.jpg', title: 'Rashmirathi', author: 'Ramdhari Singh Dinkar', language: 'Hindi', category: 'Poetry', price: 159, mrp: 240, rating: 4.9, desc: 'Karna ke jeevan par adharit veer-ras se bhara khand-kavya.' },
    { id: 'b05', cover: 'images/b05.jpg', title: 'Gunahon Ka Devta', author: 'Dharamvir Bharati', language: 'Hindi', category: 'Fiction', price: 179, mrp: 275, rating: 4.7, desc: 'Prem aur samaj ke bandhanon ki amar prem-kahani.' },
    { id: 'b06', cover: 'images/b06.jpg', title: 'Maila Anchal', author: 'Phanishwar Nath Renu', language: 'Hindi', category: 'Classic', price: 189, mrp: 285, rating: 4.5, desc: 'Bihar ke grameen jeevan ka yatharthwadi chitran.' },
    { id: 'b07', cover: 'images/b07.jpg', title: 'The Alchemist', author: 'Paulo Coelho', language: 'English', category: 'Fiction', price: 299, mrp: 450, rating: 4.7, desc: 'A shepherd boy journeys to find his treasure — a fable about following your dream.' },
    { id: 'b08', cover: 'images/b08.jpg', title: 'Atomic Habits', author: 'James Clear', language: 'English', category: 'Self-Help', price: 499, mrp: 899, rating: 4.8, desc: 'Tiny changes, remarkable results — the definitive guide to building good habits.' },
    { id: 'b09', cover: 'images/b09.jpg', title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', language: 'English', category: 'Biography', price: 250, mrp: 375, rating: 4.9, desc: 'The autobiography of Dr. Kalam — from Rameswaram to Rashtrapati Bhavan.' },
    { id: 'b10', cover: 'images/b10.jpg', title: 'The White Tiger', author: 'Aravind Adiga', language: 'English', category: 'Fiction', price: 275, mrp: 399, rating: 4.4, desc: 'Booker Prize winner — a dark, gripping tale of modern India.' },
    { id: 'b11', cover: 'images/b11.jpg', title: 'Gitanjali', author: 'Rabindranath Tagore', language: 'English', category: 'Poetry', price: 180, mrp: 260, rating: 4.8, desc: 'Nobel Prize-winning collection of spiritual poems by Gurudev.' },
    { id: 'b12', cover: 'images/b12.jpg', title: 'A Brief History of Time', author: 'Stephen Hawking', language: 'English', category: 'Science', price: 350, mrp: 550, rating: 4.6, desc: 'From the Big Bang to black holes — the universe explained for everyone.' },
    { id: 'b13', cover: 'images/b13.jpg', title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', language: 'English', category: 'Finance', price: 349, mrp: 599, rating: 4.8, desc: 'The #1 personal finance book — what the rich teach their kids about money.' },
    { id: 'b14', cover: 'images/b14.jpg', title: 'The Psychology of Money', author: 'Morgan Housel', language: 'English', category: 'Finance', price: 299, mrp: 499, rating: 4.9, desc: 'Timeless lessons on wealth, greed, and happiness.' },
    { id: 'b15', cover: 'images/b15.jpg', title: 'Panchatantra Ki Kahaniyan', author: 'Vishnu Sharma', language: 'Hindi', category: 'Kids', price: 149, mrp: 249, rating: 4.7, desc: 'Bacchon ke liye mazedaar aur seekh bhari kahaniyan.' },
    { id: 'b16', cover: 'images/b16.jpg', title: 'Akbar-Birbal: Majedar Kisse', author: 'Folk Tales', language: 'Hindi', category: 'Kids', price: 129, mrp: 199, rating: 4.6, desc: 'Birbal ki chaturai ke hasya-bhare kisse.' },
    { id: 'b17', cover: 'images/b17.jpg', title: 'Bal Kavita Sangrah', author: 'Various Poets', language: 'Hindi', category: 'Kids', price: 99, mrp: 150, rating: 4.5, desc: 'Chhote bacchon ke liye pyaari Hindi kavitaen.' },
    { id: 'b18', cover: 'images/b18.jpg', title: 'Sapiens', author: 'Yuval Noah Harari', language: 'English', category: 'Knowledge', price: 399, mrp: 599, rating: 4.8, desc: 'A brief history of humankind — the worldwide bestseller.' },
    { id: 'b19', cover: 'images/b19.jpg', title: 'Samanya Gyan', author: 'Knowledge Series', language: 'Hindi', category: 'Knowledge', price: 199, mrp: 299, rating: 4.5, desc: 'Pratiyogi parikshaon ke liye sampoorn samanya gyan.' },
    { id: 'b20', cover: 'images/b20.jpg', title: 'Kabir Ke Dohe', author: 'Kabir Das', language: 'Hindi', category: 'Poetry', price: 119, mrp: 180, rating: 4.7, desc: 'Sant Kabir ke prasiddh dohe — jeevan ka gehra gyan.' },
    { id: 'b21', cover: 'images/b21.jpg', title: 'The Power of Your Subconscious Mind', author: 'Joseph Murphy', language: 'English', category: 'Self-Help', price: 199, mrp: 350, rating: 4.7, desc: 'Unlock the power within you — a self-help classic.' },
    { id: 'b22', cover: 'images/b22.jpg', title: 'Tenali Raman Stories', author: 'Folk Tales', language: 'English', category: 'Kids', price: 149, mrp: 250, rating: 4.6, desc: 'Witty tales of the legendary court jester of Vijayanagara.' },
  ];
}

// ============================================================
// DATA LAYER — dono backends ka same interface (async methods)
// ============================================================

// ---------- Backend 1: JSON file (localhost ke liye) ----------
function createJsonStore() {
  function loadDb() {
    if (!fs.existsSync(DB_PATH)) {
      const db = { users: [], sessions: [], carts: {}, orders: [], books: seedBooks(), visits: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      return db;
    }
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const have = new Set((db.books || []).map(b => b.id));
    let added = false;
    for (const b of seedBooks()) {
      if (!have.has(b.id)) { db.books.push(b); added = true; }
    }
    if (added) fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    if (!db.visits) { db.visits = []; fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
    return db;
  }
  let db = loadDb();
  const save = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  return {
    name: 'json',
    async init() {},
    async findUserByLogin(login) {
      const l = login.toLowerCase();
      return db.users.find(u => u.email.toLowerCase() === l || u.username.toLowerCase() === l) || null;
    },
    async findUserById(id) { return db.users.find(u => u.id === id) || null; },
    async emailTaken(email) { return db.users.some(u => u.email.toLowerCase() === email.toLowerCase()); },
    async usernameTaken(username) { return db.users.some(u => u.username.toLowerCase() === username.toLowerCase()); },
    async createUser(u) { db.users.push(u); db.carts[u.id] = []; save(); },
    async listUsers() { return db.users; },
    async createSession(token, userId, expires) {
      db.sessions = db.sessions.filter(s => s.expires > Date.now());
      db.sessions.push({ token, userId, expires }); save();
    },
    async findSessionUser(token) {
      const s = db.sessions.find(x => x.token === token && x.expires > Date.now());
      return s ? (db.users.find(u => u.id === s.userId) || null) : null;
    },
    async deleteSession(token) { db.sessions = db.sessions.filter(s => s.token !== token); save(); },
    async getCart(userId) { return db.carts[userId] || []; },
    async upsertCartLine(userId, bookId, qty) {
      const cart = db.carts[userId] || (db.carts[userId] = []);
      const line = cart.find(x => x.bookId === bookId);
      if (line) line.qty = Math.min(9, line.qty + qty); else cart.push({ bookId, qty });
      save(); return cart;
    },
    async setCartLine(userId, bookId, qty) {
      const cart = db.carts[userId] || [];
      const line = cart.find(x => x.bookId === bookId);
      if (line) { line.qty = qty; save(); return true; } return false;
    },
    async deleteCartLine(userId, bookId) {
      db.carts[userId] = (db.carts[userId] || []).filter(x => x.bookId !== bookId); save();
    },
    async clearCart(userId) { db.carts[userId] = []; save(); },
    async createOrder(o) { db.orders.push(o); save(); },
    async listOrdersByUser(userId) { return db.orders.filter(o => o.userId === userId).reverse(); },
    async listAllOrders() { return db.orders.slice().reverse(); },
    async countOrdersByUser(userId) { return db.orders.filter(o => o.userId === userId).length; },
    async listBooks() { return db.books; },
    async findBook(id) { return db.books.find(b => b.id === id) || null; },
    // ---- Visitor tracking ----
    async logVisit(v) {
      db.visits.push({ id: 'v' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'), ...v });
      save();
    },
    async listVisits(limit) {
      return db.visits.slice(-limit).reverse().map(v => {
        const u = v.userId ? db.users.find(x => x.id === v.userId) : null;
        return { ...v, username: u ? u.username : null };
      });
    },
    // ---- Order status ----
    async updateOrderStatus(orderId, status) {
      const o = db.orders.find(x => x.id === orderId);
      if (!o) return false;
      o.status = status; save(); return true;
    },
    async touchUser(id) {
      const u = db.users.find(x => x.id === id);
      if (u) { u.lastSeen = new Date().toISOString(); save(); }
    },
  };
}

// ---------- Backend 2: PostgreSQL (Render par permanent data) ----------
function createPgStore(pool) {
  const q = (text, params) => pool.query(text, params);

  // DB row → API book object
  const toBook = r => ({
    id: r.id, title: r.title, author: r.author, language: r.language,
    category: r.category, price: r.price, mrp: r.mrp, rating: Number(r.rating),
    desc: r.description, ...(r.cover ? { cover: r.cover } : {}),
  });
  const toUser = r => ({
    id: r.id, username: r.username, email: r.email, phone: r.phone,
    passwordHash: r.password_hash, createdAt: r.created_at,
    lastSeen: r.last_seen || null,
  });
  const toOrder = r => ({
    id: r.id, userId: r.user_id,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
    subtotal: r.subtotal, delivery: r.delivery, total: r.total,
    name: r.name, address: r.address, city: r.city, pincode: r.pincode,
    payment: r.payment, status: r.status, placedAt: r.placed_at,
  });

  return {
    name: 'postgres',
    async init() {
      await q(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL)`);
      await q(`CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires BIGINT NOT NULL)`);
      await q(`CREATE TABLE IF NOT EXISTS carts (
        user_id TEXT NOT NULL, book_id TEXT NOT NULL, qty INT NOT NULL,
        PRIMARY KEY (user_id, book_id))`);
      await q(`CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, items JSONB NOT NULL,
        subtotal INT NOT NULL, delivery INT NOT NULL, total INT NOT NULL,
        name TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL,
        pincode TEXT NOT NULL, payment TEXT NOT NULL, status TEXT NOT NULL,
        placed_at TIMESTAMPTZ NOT NULL)`);
      await q(`CREATE TABLE IF NOT EXISTS visits (
        id TEXT PRIMARY KEY, user_id TEXT, ip TEXT, country TEXT, city TEXT,
        device TEXT, browser TEXT, os TEXT, referrer TEXT, page TEXT,
        visited_at TIMESTAMPTZ NOT NULL)`);
      await q(`CREATE INDEX IF NOT EXISTS idx_visits_time ON visits (visited_at DESC)`);
      await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ`);
      await q(`CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL,
        language TEXT NOT NULL, category TEXT NOT NULL, price INT NOT NULL,
        mrp INT NOT NULL, rating REAL NOT NULL, description TEXT NOT NULL, cover TEXT)`);
      // Catalog seed / upgrade: jo books nahi hain wo jod do
      for (const b of seedBooks()) {
        await q(`INSERT INTO books (id,title,author,language,category,price,mrp,rating,description,cover)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
          [b.id, b.title, b.author, b.language, b.category, b.price, b.mrp, b.rating, b.desc, b.cover || null]);
      }
    },
    async findUserByLogin(login) {
      const r = await q(`SELECT * FROM users WHERE LOWER(email)=LOWER($1) OR LOWER(username)=LOWER($1) LIMIT 1`, [login]);
      return r.rows[0] ? toUser(r.rows[0]) : null;
    },
    async findUserById(id) {
      const r = await q(`SELECT * FROM users WHERE id=$1`, [id]);
      return r.rows[0] ? toUser(r.rows[0]) : null;
    },
    async emailTaken(email) {
      const r = await q(`SELECT 1 FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1`, [email]);
      return r.rows.length > 0;
    },
    async usernameTaken(username) {
      const r = await q(`SELECT 1 FROM users WHERE LOWER(username)=LOWER($1) LIMIT 1`, [username]);
      return r.rows.length > 0;
    },
    async createUser(u) {
      await q(`INSERT INTO users (id,username,email,phone,password_hash,created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        [u.id, u.username, u.email, u.phone, u.passwordHash, u.createdAt]);
    },
    async listUsers() {
      const r = await q(`SELECT * FROM users ORDER BY created_at`);
      return r.rows.map(toUser);
    },
    async createSession(token, userId, expires) {
      await q(`DELETE FROM sessions WHERE expires < $1`, [Date.now()]);
      await q(`INSERT INTO sessions (token,user_id,expires) VALUES ($1,$2,$3)`, [token, userId, expires]);
    },
    async findSessionUser(token) {
      const r = await q(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id
                         WHERE s.token=$1 AND s.expires > $2`, [token, Date.now()]);
      return r.rows[0] ? toUser(r.rows[0]) : null;
    },
    async deleteSession(token) { await q(`DELETE FROM sessions WHERE token=$1`, [token]); },
    async getCart(userId) {
      const r = await q(`SELECT book_id AS "bookId", qty FROM carts WHERE user_id=$1`, [userId]);
      return r.rows;
    },
    async upsertCartLine(userId, bookId, qty) {
      await q(`INSERT INTO carts (user_id,book_id,qty) VALUES ($1,$2,$3)
               ON CONFLICT (user_id,book_id) DO UPDATE SET qty = LEAST(9, carts.qty + EXCLUDED.qty)`,
        [userId, bookId, qty]);
      return this.getCart(userId);
    },
    async setCartLine(userId, bookId, qty) {
      const r = await q(`UPDATE carts SET qty=$3 WHERE user_id=$1 AND book_id=$2`, [userId, bookId, qty]);
      return r.rowCount > 0;
    },
    async deleteCartLine(userId, bookId) {
      await q(`DELETE FROM carts WHERE user_id=$1 AND book_id=$2`, [userId, bookId]);
    },
    async clearCart(userId) { await q(`DELETE FROM carts WHERE user_id=$1`, [userId]); },
    async createOrder(o) {
      await q(`INSERT INTO orders (id,user_id,items,subtotal,delivery,total,name,address,city,pincode,payment,status,placed_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [o.id, o.userId, JSON.stringify(o.items), o.subtotal, o.delivery, o.total,
         o.name, o.address, o.city, o.pincode, o.payment, o.status, o.placedAt]);
    },
    async listOrdersByUser(userId) {
      const r = await q(`SELECT * FROM orders WHERE user_id=$1 ORDER BY placed_at DESC`, [userId]);
      return r.rows.map(toOrder);
    },
    async listAllOrders() {
      const r = await q(`SELECT * FROM orders ORDER BY placed_at DESC`);
      return r.rows.map(toOrder);
    },
    async countOrdersByUser(userId) {
      const r = await q(`SELECT COUNT(*)::int AS c FROM orders WHERE user_id=$1`, [userId]);
      return r.rows[0].c;
    },
    async listBooks() {
      const r = await q(`SELECT * FROM books ORDER BY id`);
      return r.rows.map(toBook);
    },
    async findBook(id) {
      const r = await q(`SELECT * FROM books WHERE id=$1`, [id]);
      return r.rows[0] ? toBook(r.rows[0]) : null;
    },
    // ---- Visitor tracking ----
    async logVisit(v) {
      await q(`INSERT INTO visits (id,user_id,ip,country,city,device,browser,os,referrer,page,visited_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [v.id, v.userId || null, v.ip, v.country, v.city, v.device, v.browser, v.os, v.referrer, v.page, v.visitedAt]);
    },
    async listVisits(limit) {
      const r = await q(`SELECT v.*, u.username FROM visits v LEFT JOIN users u ON u.id = v.user_id
                         ORDER BY visited_at DESC LIMIT $1`, [limit]);
      return r.rows.map(x => ({
        id: x.id, userId: x.user_id, username: x.username, ip: x.ip,
        country: x.country, city: x.city, device: x.device, browser: x.browser,
        os: x.os, referrer: x.referrer, page: x.page, visitedAt: x.visited_at,
      }));
    },
    // ---- Order status ----
    async updateOrderStatus(orderId, status) {
      const r = await q(`UPDATE orders SET status=$2 WHERE id=$1`, [orderId, status]);
      return r.rowCount > 0;
    },
    async touchUser(id) {
      await q(`UPDATE users SET last_seen=$2 WHERE id=$1`, [id, new Date().toISOString()]);
    },
  };
}

// ---------------- Store select + start ----------------
let store = null;
async function initStore() {
  if (DATABASE_URL) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    // Pehle connection test — galat URL ho to saaf error ke saath band ho
    await pool.query('SELECT 1');
    store = createPgStore(pool);
    await store.init();
    console.log('BookNest using PostgreSQL (permanent storage)');
  } else {
    store = createJsonStore();
    await store.init();
    console.log('BookNest using db.json (local storage)');
  }
}

// Export for testing (pg-mem)
module.exports = { createPgStore, createJsonStore, seedBooks };

// ---------------- Password hashing (scrypt) ----------------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}
function verifyPassword(password, stored) {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const check = crypto.scryptSync(password, parts[0], 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(parts[1], 'hex'));
}

// ---------------- Sessions (httpOnly cookie) ----------------
function parseCookies(req) {
  const out = {};
  const header = req.headers.cookie || '';
  header.split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
async function getSessionUser(req) {
  const token = parseCookies(req).sid;
  if (!token) return null;
  return store.findSessionUser(token);
}
async function requireAuth(req, res, next) {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Login required' });
  req.user = user;
  next();
}
function publicUser(u) {
  return { id: u.id, username: u.username, email: u.email, phone: u.phone };
}

// ---------------- Visitor tracking helpers ----------------
// Render proxy ke peeche hota hai, isliye asli IP x-forwarded-for se aata hai
function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}
// Browser ke user-agent se device/browser/OS nikalo
function parseUA(ua) {
  ua = ua || '';
  let device = 'Desktop', os = 'Unknown', browser = 'Unknown';
  if (/mobile|android|iphone|ipod/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && /version/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  return { device, os, browser };
}
// IP → desh/sahar (free API, best-effort — fail ho to 'Unknown', site nahi rukegi)
const geoCache = new Map();
async function geoLookup(ip) {
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip === '::1' || ip === '::ffff:127.0.0.1')
    return { country: 'Local', city: 'Local' };
  if (geoCache.has(ip)) return geoCache.get(ip);
  const fallback = { country: 'Unknown', city: 'Unknown' };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch('http://ip-api.com/json/' + encodeURIComponent(ip) + '?fields=status,country,city', { signal: ctrl.signal });
    clearTimeout(t);
    const j = await res.json();
    const out = (j && j.status === 'success')
      ? { country: j.country || 'Unknown', city: j.city || 'Unknown' } : fallback;
    if (geoCache.size > 2000) geoCache.clear();
    geoCache.set(ip, out);
    return out;
  } catch (e) { return fallback; }
}

// ---------------- Auth API ----------------
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body || {};
    if (!username || !email || !phone || !password)
      return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    if (!/^[0-9+\-\s]{7,15}$/.test(phone))
      return res.status(400).json({ error: 'Invalid phone number' });
    if (await store.emailTaken(email))
      return res.status(400).json({ error: 'Email already registered' });
    if (await store.usernameTaken(username))
      return res.status(400).json({ error: 'Username already taken' });

    const user = {
      id: 'u' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex'),
      username, email, phone,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    await store.createUser(user);

    const token = crypto.randomBytes(32).toString('hex');
    await store.createSession(token, user.id, Date.now() + 30 * 24 * 3600 * 1000);
    res.cookie('sid', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000, path: '/' });
    res.json({ user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Something went wrong' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body || {};
    if (!login || !password)
      return res.status(400).json({ error: 'Email/username and password required' });
    const user = await store.findUserByLogin(login);
    if (!user || !verifyPassword(password, user.passwordHash))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = crypto.randomBytes(32).toString('hex');
    await store.createSession(token, user.id, Date.now() + 30 * 24 * 3600 * 1000);
    res.cookie('sid', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000, path: '/' });
    res.json({ user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Something went wrong' }); }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = parseCookies(req).sid;
    if (token) await store.deleteSession(token);
  } catch (e) { /* ignore */ }
  res.clearCookie('sid', { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', async (req, res) => {
  const user = await getSessionUser(req);
  if (user) store.touchUser(user.id).catch(() => {}); // last seen update (admin ke liye)
  res.json({ user: user ? publicUser(user) : null });
});

// ---------------- Visitor tracking (public) ----------------
// Frontend har page load par ek chhota signal bhejta hai —
// kaun aaya (IP), kahan se (desh/sahar), kaise (mobile/desktop, browser), kab
app.post('/api/track', async (req, res) => {
  try {
    const { page, referrer, userId } = req.body || {};
    const ip = clientIp(req);
    const { device, os, browser } = parseUA(req.headers['user-agent']);
    const geo = await geoLookup(ip);
    let uid = userId || null;
    if (!uid) { const u = await getSessionUser(req); if (u) uid = u.id; }
    await store.logVisit({
      id: 'v' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'),
      userId: uid, ip,
      country: geo.country, city: geo.city,
      device, browser, os,
      referrer: (referrer || '').slice(0, 300),
      page: (page || '/').slice(0, 100),
      visitedAt: new Date().toISOString(),
    });
  } catch (e) { console.error('track error:', e.message); }
  res.json({ ok: true });
});

// ---------------- Books API ----------------
app.get('/api/books', async (req, res) => {
  let list = await store.listBooks();
  const { q, language, category } = req.query;
  if (q) {
    const s = q.toLowerCase();
    list = list.filter(b => (b.title + ' ' + b.author).toLowerCase().includes(s));
  }
  if (language && language !== 'All') list = list.filter(b => b.language === language);
  if (category && category !== 'All') list = list.filter(b => b.category === category);
  res.json(list);
});

app.get('/api/books/:id', async (req, res) => {
  const book = await store.findBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// ---------------- Cart API (login required) ----------------
async function cartWithBooks(userId) {
  const items = await store.getCart(userId);
  const out = [];
  for (const it of items) {
    const book = await store.findBook(it.bookId);
    if (book) out.push({ ...it, book });
  }
  return out;
}

app.get('/api/cart', requireAuth, async (req, res) => {
  res.json(await cartWithBooks(req.user.id));
});

app.post('/api/cart', requireAuth, async (req, res) => {
  const { bookId, qty } = req.body || {};
  const book = await store.findBook(bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const cart = await store.upsertCartLine(req.user.id, bookId, qty || 1);
  res.json({ ok: true, count: cart.reduce((n, x) => n + x.qty, 0) });
});

app.put('/api/cart/:bookId', requireAuth, async (req, res) => {
  const ok = await store.setCartLine(req.user.id, req.params.bookId, Math.max(1, Math.min(9, req.body.qty || 1)));
  if (!ok) return res.status(404).json({ error: 'Not in cart' });
  res.json({ ok: true });
});

app.delete('/api/cart/:bookId', requireAuth, async (req, res) => {
  await store.deleteCartLine(req.user.id, req.params.bookId);
  res.json({ ok: true });
});

// ---------------- Orders API (login required) ----------------
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { name, address, city, pincode, payment } = req.body || {};
    if (!name || !address || !city || !pincode)
      return res.status(400).json({ error: 'Delivery details required' });
    const cart = await cartWithBooks(req.user.id);
    if (!cart.length) return res.status(400).json({ error: 'Cart is empty' });

    const items = cart.map(x => ({ bookId: x.bookId, title: x.book.title, price: x.book.price, qty: x.qty }));
    const subtotal = items.reduce((n, x) => n + x.price * x.qty, 0);
    const delivery = subtotal >= 499 ? 0 : 49; // ₹499 se upar FREE delivery
    const order = {
      id: 'ORD' + Date.now().toString(36).toUpperCase(),
      userId: req.user.id,
      items, subtotal, delivery, total: subtotal + delivery,
      name, address, city, pincode,
      payment: payment || 'Cash on Delivery',
      status: 'Placed',
      placedAt: new Date().toISOString(),
    };
    await store.createOrder(order);
    await store.clearCart(req.user.id);
    res.json({ order });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Something went wrong' }); }
});

app.get('/api/orders', requireAuth, async (req, res) => {
  res.json(await store.listOrdersByUser(req.user.id));
});

// ---------------- Admin Panel (dukandaar ke liye) ----------------
// Customer ka data dekhne ke liye: browser me /admin.html kholo.
// ADMIN_PASSWORD ko apne hisaab se badal lo (koi bhi strong password rakho).
const ADMIN_PASSWORD = 'admin123';
const adminSessions = new Set();

function requireAdmin(req, res, next) {
  const token = parseCookies(req).admin;
  if (!token || !adminSessions.has(token))
    return res.status(401).json({ error: 'Admin login required' });
  next();
}

app.post('/api/admin/login', (req, res) => {
  if (!req.body || req.body.password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Wrong admin password' });
  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.add(token);
  res.cookie('admin', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  adminSessions.delete(parseCookies(req).admin);
  res.clearCookie('admin', { path: '/' });
  res.json({ ok: true });
});

// Saare customers — poori detail: kab signup kiya, kab last aaya, kitne order, kitna kharcha
// NOTE: password kabhi nahi bhejte (wo hashed save hota hai,
// use koi nahi dekh sakta, tum bhi nahi — yehi sahi tareeka hai)
app.get('/api/admin/customers', requireAdmin, async (req, res) => {
  const users = await store.listUsers();
  const orders = await store.listAllOrders();
  const out = [];
  for (const u of users) {
    const uo = orders.filter(o => o.userId === u.id);
    out.push({
      username: u.username, email: u.email, phone: u.phone,
      createdAt: u.createdAt, lastSeen: u.lastSeen || null,
      orders: uo.length,
      totalSpent: uo.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0),
      lastOrderAt: uo.length ? uo[0].placedAt : null,
    });
  }
  res.json(out);
});

// Saare orders — customer ka naam + delivery address ke saath
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  const orders = await store.listAllOrders();
  const out = [];
  for (const o of orders) {
    const u = await store.findUserById(o.userId) || {};
    out.push({
      id: o.id, placedAt: o.placedAt,
      customer: u.username || '—', email: u.email || '—', phone: u.phone || '—',
      items: o.items, subtotal: o.subtotal, delivery: o.delivery, total: o.total,
      name: o.name, address: o.address, city: o.city, pincode: o.pincode,
      payment: o.payment, status: o.status,
    });
  }
  res.json(out);
});

// Order ka status badlo — Placed → Confirmed → Shipped → Out for Delivery → Delivered (ya Cancelled)
const ORDER_STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  const ok = await store.updateOrderStatus(req.params.id, status);
  if (!ok) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true, status });
});

// Taaza visits — kaun aaya, kahan se, kaise (table ke liye)
app.get('/api/admin/visits', requireAdmin, async (req, res) => {
  const limit = Math.min(200, parseInt(req.query.limit) || 100);
  res.json(await store.listVisits(limit));
});

// Poora hisaab ek saath — dashboard ke liye
app.get('/api/admin/overview', requireAdmin, async (req, res) => {
  try {
    const visits = await store.listVisits(5000);
    const users = await store.listUsers();
    const orders = await store.listAllOrders();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const countBy = (arr, key) => {
      const m = {};
      for (const v of arr) { const k = v[key] || 'Unknown'; m[k] = (m[k] || 0) + 1; }
      return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
    };

    // Pichhle 14 din — roz kitne visitors
    const byDay = {};
    for (let i = 13; i >= 0; i--)
      byDay[new Date(now - i * 86400000).toISOString().slice(0, 10)] = 0;
    for (const v of visits) {
      const d = (v.visitedAt || '').slice(0, 10);
      if (d in byDay) byDay[d]++;
    }

    const orderStatus = {};
    for (const o of orders) orderStatus[o.status] = (orderStatus[o.status] || 0) + 1;

    res.json({
      totalVisits: visits.length,
      uniqueVisitors: new Set(visits.map(v => v.ip)).size,
      todayVisits: visits.filter(v => (v.visitedAt || '').slice(0, 10) === todayStr).length,
      totalCustomers: users.length,
      totalOrders: orders.length,
      revenue: orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0),
      byDay,
      byCountry: countBy(visits, 'country'),
      byDevice: countBy(visits, 'device'),
      byBrowser: countBy(visits, 'browser'),
      byReferrer: countBy(visits.filter(v => v.referrer), 'referrer'),
      orderStatus,
      statuses: ORDER_STATUSES,
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Something went wrong' }); }
});

// ---------------- Start ----------------
// test me require karne par server auto-start na ho
if (require.main === module) {
  initStore().then(() => {
    app.listen(PORT, () => {
      console.log('BookNest running at http://localhost:' + PORT + '  [store: ' + store.name + ']');
    });
  }).catch(err => {
    console.error('FATAL: database se connect nahi ho paya:', err.message);
    console.error('DATABASE_URL check karo — ya use hata kar db.json mode me chalao.');
    process.exit(1);
  });
}
