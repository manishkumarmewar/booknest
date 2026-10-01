# 🪹 BookNest — Server Version (Admin Panel ke saath)

Ye **asli** website hai — login/signup server par hota hai, saara customer data
aur orders server par save hote hain, isliye **Admin Panel** me sab dikhta hai.

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
   node server.js
   ```
   `BookNest running at http://localhost:3000` dikhega — matlab chal gaya ✅
   (Terminal band mat karna jab tak site chalani hai!)

### Step 2 — Site kholo

Browser me kholo: **http://localhost:3000**
- Pehle **Sign Up** karo (naya account banao)
- Books dekho, cart me dalo, order karo

### Step 3 — Admin Panel kholo

Browser me kholo: **http://localhost:3000/admin.html**
- Ya site ke neeche footer me **🔐 Admin Panel** link dabao
- Password: **admin123**

Admin panel me dikhega:
- 👥 **Customers** — username, email, phone, signup date, kitne orders
- 📦 **Orders** — order id, customer naam, items, total, poora address, payment
- 📊 Upar 3 hisaab — total customers, total orders, total revenue

## Zaroori notes

- 🔑 **Admin password badalna:** `server.js` me sabse neeche `ADMIN_PASSWORD = 'admin123'`
  likha hai — use apna strong password kar do, phir server restart karo.
- 📞 **Apna phone number:** `public/index.html` me `APNA NUMBER YAHAN` dhoondo —
  2 jagah demo number `+91 98765 43210` hai, apna asli number likh do.
- 🔒 **Passwords kabhi visible nahi hote** — na admin panel me, na kahin.
  Wo hash hokar save hote hain. Yehi sahi aur safe tareeka hai — sir ko ye batana! 💪
- 💳 **Payments demo mode hain** — UPI/Card ke paise asli me nahi kat-te.
  Asli payments ke liye Razorpay/Stripe lagana padega.
- 💾 Saara data `db.json` file me save hota hai (server wale folder me banti hai).
  Customers aur orders kabhi delete nahi hote jab tak tum khud `db.json` na hatao.
- 🌐 Ye site sirf **tumhare computer** par chalti hai (`localhost`).
  Duniya ko dikhane ke liye ise internet par host karna padega (Render/Railway jaise free options hain).
