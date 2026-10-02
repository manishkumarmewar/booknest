// ============================================================
// BookNest — Server (Node.js + Express)
// Real login/signup with secure password hashing (scrypt),
// Local JSON or PostgreSQL database, cart + orders API, admin panel API.
// Run:  npm install   then   node server.js
// Open: http://localhost:3000
// Admin: http://localhost:3000/admin.html  (password: admin123)
// ============================================================

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const DATABASE_URL = process.env.DATABASE_URL;
const dbPool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL, max: 1 }) : null;

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

// ---------------- JSON database ----------------
function createEmptyDb() {
  return { users: [], sessions: [], carts: {}, orders: [], books: seedBooks() };
}

function ensureDbShape(data) {
  let changed = false;
  if (!Array.isArray(data.users)) { data.users = []; changed = true; }
  if (!Array.isArray(data.sessions)) { data.sessions = []; changed = true; }
  if (!data.carts || typeof data.carts !== 'object') { data.carts = {}; changed = true; }
  if (!Array.isArray(data.orders)) { data.orders = []; changed = true; }
  if (!Array.isArray(data.books)) { data.books = []; changed = true; }

  const have = new Set(data.books.map(book => book.id));
  for (const book of seedBooks()) {
    if (!have.has(book.id)) {
      data.books.push(book);
      changed = true;
    }
  }
  return changed;
}

function loadLocalDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = createEmptyDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  if (ensureDbShape(data)) fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  return data;
}

let db;
let saveQueue = Promise.resolve();

async function saveDb() {
  if (!dbPool) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return;
  }

  const snapshot = JSON.stringify(db);
  const write = saveQueue.catch(() => {}).then(() => dbPool.query(
    `INSERT INTO booknest_state (id, data)
     VALUES (1, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [snapshot]
  ));
  saveQueue = write;
  await write;
}

async function initializeDb() {
  if (!dbPool) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL is required in production for persistent customer data');
    }
    db = loadLocalDb();
    return;
  }

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS booknest_state (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL
    )
  `);

  const result = await dbPool.query('SELECT data FROM booknest_state WHERE id = 1');
  if (result.rowCount === 0) {
    db = createEmptyDb();
    await saveDb();
    return;
  }

  db = result.rows[0].data;
  if (ensureDbShape(db)) await saveDb();
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

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
async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions = db.sessions.filter(s => s.expires > Date.now());
  db.sessions.push({ token, userId, expires: Date.now() + 30 * 24 * 3600 * 1000 });
  await saveDb();
  return token;
}
function getSessionUser(req) {
  const token = parseCookies(req).sid;
  if (!token) return null;
  const s = db.sessions.find(x => x.token === token && x.expires > Date.now());
  if (!s) return null;
  return db.users.find(u => u.id === s.userId) || null;
}
function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Login required' });
  req.user = user;
  next();
}
function publicUser(u) {
  return { id: u.id, username: u.username, email: u.email, phone: u.phone };
}

// ---------------- Auth API ----------------
app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const { username, email, phone, password } = req.body || {};
  if (!username || !email || !phone || !password)
    return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address' });
  if (!/^[0-9+\-\s]{7,15}$/.test(phone))
    return res.status(400).json({ error: 'Invalid phone number' });
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(400).json({ error: 'Email already registered' });
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase()))
    return res.status(400).json({ error: 'Username already taken' });

  const user = {
    id: 'u' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex'),
    username, email, phone,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  db.carts[user.id] = [];
  await saveDb();

  const token = await createSession(user.id);
  res.cookie('sid', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000, path: '/' });
  res.json({ user: publicUser(user) });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password)
    return res.status(400).json({ error: 'Email/username and password required' });
  const user = db.users.find(u =>
    u.email.toLowerCase() === login.toLowerCase() ||
    u.username.toLowerCase() === login.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = await createSession(user.id);
  res.cookie('sid', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000, path: '/' });
  res.json({ user: publicUser(user) });
}));

app.post('/api/auth/logout', asyncHandler(async (req, res) => {
  const token = parseCookies(req).sid;
  if (token) {
    db.sessions = db.sessions.filter(s => s.token !== token);
    await saveDb();
  }
  res.clearCookie('sid', { path: '/' });
  res.json({ ok: true });
}));

app.get('/api/auth/me', (req, res) => {
  const user = getSessionUser(req);
  res.json({ user: user ? publicUser(user) : null });
});

// ---------------- Books API ----------------
app.get('/api/books', (req, res) => {
  let list = db.books;
  const { q, language, category } = req.query;
  if (q) {
    const s = q.toLowerCase();
    list = list.filter(b => (b.title + ' ' + b.author).toLowerCase().includes(s));
  }
  if (language && language !== 'All') list = list.filter(b => b.language === language);
  if (category && category !== 'All') list = list.filter(b => b.category === category);
  res.json(list);
});

app.get('/api/books/:id', (req, res) => {
  const book = db.books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// ---------------- Cart API (login required) ----------------
app.get('/api/cart', requireAuth, (req, res) => {
  const items = db.carts[req.user.id] || [];
  res.json(items.map(it => ({ ...it, book: db.books.find(b => b.id === it.bookId) })).filter(x => x.book));
});

app.post('/api/cart', requireAuth, asyncHandler(async (req, res) => {
  const { bookId, qty } = req.body || {};
  const book = db.books.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const cart = db.carts[req.user.id] || (db.carts[req.user.id] = []);
  const line = cart.find(x => x.bookId === bookId);
  if (line) line.qty = Math.min(9, line.qty + (qty || 1));
  else cart.push({ bookId, qty: qty || 1 });
  await saveDb();
  res.json({ ok: true, count: cart.reduce((n, x) => n + x.qty, 0) });
}));

app.put('/api/cart/:bookId', requireAuth, asyncHandler(async (req, res) => {
  const cart = db.carts[req.user.id] || [];
  const line = cart.find(x => x.bookId === req.params.bookId);
  if (!line) return res.status(404).json({ error: 'Not in cart' });
  line.qty = Math.max(1, Math.min(9, req.body.qty || 1));
  await saveDb();
  res.json({ ok: true });
}));

app.delete('/api/cart/:bookId', requireAuth, asyncHandler(async (req, res) => {
  db.carts[req.user.id] = (db.carts[req.user.id] || []).filter(x => x.bookId !== req.params.bookId);
  await saveDb();
  res.json({ ok: true });
}));

// ---------------- Orders API (login required) ----------------
app.post('/api/orders', requireAuth, asyncHandler(async (req, res) => {
  const { name, address, city, pincode, payment } = req.body || {};
  if (!name || !address || !city || !pincode)
    return res.status(400).json({ error: 'Delivery details required' });
  const cart = db.carts[req.user.id] || [];
  if (!cart.length) return res.status(400).json({ error: 'Cart is empty' });

  const items = cart.map(it => {
    const book = db.books.find(b => b.id === it.bookId);
    return { bookId: it.bookId, title: book.title, price: book.price, qty: it.qty };
  });
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
  db.orders.push(order);
  db.carts[req.user.id] = [];
  await saveDb();
  res.json({ order });
}));

app.get('/api/orders', requireAuth, (req, res) => {
  res.json(db.orders.filter(o => o.userId === req.user.id).reverse());
});

// ---------------- Admin Panel (dukandaar ke liye) ----------------
// Customer ka data dekhne ke liye: browser me /admin.html kholo.
// ADMIN_PASSWORD ko apne hisaab se badal lo (koi bhi strong password rakho).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (
  process.env.NODE_ENV === 'production' ? null : 'admin123'
);
const adminSessions = new Set();

function requireAdmin(req, res, next) {
  const token = parseCookies(req).admin;
  if (!token || !adminSessions.has(token))
    return res.status(401).json({ error: 'Admin login required' });
  next();
}

app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD || !req.body || req.body.password !== ADMIN_PASSWORD)
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

// Saare customers — NOTE: password kabhi nahi bhejte (wo hashed save hota hai,
// use koi nahi dekh sakta, tum bhi nahi — yehi sahi tareeka hai)
app.get('/api/admin/customers', requireAdmin, (req, res) => {
  res.json(db.users.map(u => ({
    username: u.username,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt,
    orders: db.orders.filter(o => o.userId === u.id).length,
  })));
});

// Saare orders — customer ka naam + delivery address ke saath
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  res.json(db.orders.map(o => {
    const u = db.users.find(x => x.id === o.userId) || {};
    return {
      id: o.id,
      placedAt: o.placedAt,
      customer: u.username || '—',
      email: u.email || '—',
      phone: u.phone || '—',
      items: o.items,
      subtotal: o.subtotal,
      delivery: o.delivery,
      total: o.total,
      name: o.name,
      address: o.address,
      city: o.city,
      pincode: o.pincode,
      payment: o.payment,
      status: o.status,
    };
  }).reverse());
});

// ---------------- Start ----------------
app.use((err, req, res, next) => {
  console.error('Request failed:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await initializeDb();
    app.listen(PORT, () => {
      console.log('BookNest running at http://localhost:' + PORT);
    });
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exitCode = 1;
    if (dbPool) await dbPool.end();
  }
}

startServer();
