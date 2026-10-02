# 🪹 BookNest — Server Version (Admin Panel ke saath)

Ye website Node.js server par chalti hai. Customer accounts aur orders local testing me
`db.json` me, aur hosted deployment me PostgreSQL database me save hote hain.

## Kya-kya hai isme

- ✨ 3D login page (floating books + glass card)
- 📚 22 books — saari AI cover photos ke saath (Finance, Kids, Knowledge categories)
- 🔍❤️👤🛒 Top icons — search, wishlist, profile, cart
- 💳 Checkout — COD / UPI / Card (demo mode — asli paise nahi kat-te)
- 🔴 Bada red footer — About Us, links, policies, contact
- 🔐 **Admin Panel** — customers + orders + revenue stats

## Chalane ka tareeka (step by step)

### Step 0 — Node.js install karo (SIRF PEHLI BAAR, zaroori!)

Tumhare Mac me `npm` nahi hai — iska matlab Node.js installed nahi hai.
Bina iske server nahi chalega.

1. Browser me kholo: **https://nodejs.org**
2. **LTS** wala bada button dabao (Download kar lo)
3. Downloaded file kholo aur install kar do (bas Next → Next)
4. Terminal me check karo:
   ```
   node --version
   npm --version
   ```
   Dono me version number aana chahiye (jaise `v22.x.x`).

### Step 1 — Server start karo

1. Is zip ko extract karo
2. VS Code me ye folder kholo
3. VS Code ka terminal kholo (menu: Terminal → New Terminal)
4. Ye 2 commands chalao:
   ```
  npm install
  npm start
   ```
   `BookNest running at http://localhost:3000` dikhega — matlab chal gaya ✅
   (Terminal band mat karna jab tak site chalani hai!)

### Step 2 — Site kholo

Browser me kholo: **http://localhost:3000**
- Pehle **Sign Up** karo (naya account banao)
- Books dekho, cart me dalo, order karo

### Step 3 — Admin Panel kholo

Browser me kholo: **http://localhost:3000/admin.html**
- Password: **admin123**

Admin panel me dikhega:
- 👥 **Customers** — username, email, phone, signup date, kitne orders
- 📦 **Orders** — order id, customer naam, items, total, poora address, payment
- 📊 Upar 3 hisaab — total customers, total orders, total revenue

## Zaroori notes

- 🔑 **Admin password:** Local testing ke liye default `admin123` hai. Production me
  Render ke Environment settings me `ADMIN_PASSWORD` ko strong secret se set karo.
- 📞 **Apna phone number:** `public/index.html` me `APNA NUMBER YAHAN` dhoondo —
  2 jagah demo number `+91 98765 43210` hai, apna asli number likh do.
- 🔒 **Passwords kabhi visible nahi hote** — na admin panel me, na kahin.
  Wo hash hokar save hote hain. Yehi sahi aur safe tareeka hai — sir ko ye batana! 💪
- 💳 **Payments demo mode hain** — UPI/Card ke paise asli me nahi kat-te.
  Asli payments ke liye Razorpay/Stripe lagana padega.
- 💾 Local data `db.json` me save hota hai. Hosted Render service ke liye durable storage
  zaroori hai; free service ka local filesystem permanent nahi hota.
- 🌐 Render par customer data permanently rakhne ke liye free Neon PostgreSQL database banao:
  1. `https://neon.tech` par project banao aur connection string copy karo.
  2. Render dashboard me `booknest` service ke **Environment** section me `DATABASE_URL`
     variable add karo. Connection string ko GitHub ya chat me mat daalo.
  3. **Save, rebuild, and deploy** dabao. Server table khud banayega; naye users aur orders
     PostgreSQL me store honge. `DATABASE_URL` ke bina production server start nahi hoga.
- ⚠️ Free database plans ki limits aur retention policies hoti hain. Lifetime guarantee ke
  liye provider ki limits check karo aur regular backups/export rakho. Pehle se lost data
  automatically wapas nahi aayega.
