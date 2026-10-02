# 🪹 BookNest — Server v3 (PostgreSQL + Admin Panel)

Ye **asli** website hai — login/signup server par hota hai, aur saara data
**PostgreSQL database** me save hota hai (Render par permanent — restart ya
redeploy par customers/orders **nahi udenge**).

## Kya-kya hai isme

- ✨ 3D login page (floating books + glass card)
- 📚 22 books — saari AI cover photos ke saath
- 🔍❤️👤🛒 Top icons — search, wishlist, profile, cart
- 💳 Checkout — COD / UPI / Card (demo mode — asli paise nahi kat-te)
- 🔴 Bada red footer — About Us, links, policies, contact
- 🔐 **Admin Panel** — customers + orders + revenue stats
- 🗄️ **PostgreSQL** — permanent data storage

---

## PART A — Apne computer par chalana (localhost)

### Step 0 — Node.js install karo (SIRF PEHLI BAAR)

1. **https://nodejs.org** kholo → **LTS** download → install kar do
2. Terminal me check karo: `node --version` aur `npm --version`

### Step 1 — Server start karo

1. Is zip ko extract karo, VS Code me ye folder kholo
2. Terminal me (folder ke andar):
   ```
   npm install
   node server.js
   ```
   `BookNest running at http://localhost:3000 [store: json]` dikhega ✅
3. Browser me kholo: **http://localhost:3000** → pehle **Sign Up** karo

> Localhost par data `db.json` file me save hota hai (ye normal hai —
> permanent database sirf Render/live site par lagti hai).

### Admin Panel (localhost)

**http://localhost:3000/admin.html** — password: **admin123**
(Site ke footer me 🔐 Admin Panel link bhi hai.)

---

## PART B — Render par LIVE karna (permanent database ke saath)

### Step 1 — Code GitHub par dalo

1. **github.com** par naya repository banao (naam: `booknest`)
2. Is folder ke saare files usme push karo (`node_modules` aur `db.json` mat dalna —
   ye automatically ban jaate hain)

### Step 2 — Free PostgreSQL database banao

1. **dashboard.render.com** kholo → **New +** → **PostgreSQL**
2. Name: `booknest-db` → sabse sasta **Free** plan chuno → **Create Database**
3. Database khulne par **Connections** me **Internal Database URL** copy karo
   (ye `postgres://...` se shuru hota hai)

> Note: Agar Render ka free database maange ya expire ho jaye to
> **neon.tech** par free account banao — wahan se bhi aisa hi URL milta hai.
> Aage ke steps same hain.

### Step 3 — Web Service banao / update karo

1. **New +** → **Web Service** → apna `booknest` GitHub repo chuno
   (agar purani service hai to usi ki **Settings** me jao)
2. Ye settings rakho:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. **Environment** section me naya variable jodo:
   - **Key:** `DATABASE_URL`
   - **Value:** Step 2 me copy kiya hua Internal Database URL (poora paste karna)
4. **Deploy** dabao

### Step 4 — Check karo

- Deploy ke baad **Logs** me ye line dikhni chahiye:
  `BookNest using PostgreSQL (permanent storage)` ✅
- Phir apni live site kholo — sab kaam karega, aur data ab kabhi nahi udega!

> ⚠️ **Agar Logs me ye dikhe:** `FATAL: database se connect nahi ho paya`
> to `DATABASE_URL` galat ya aadha paste hua hai — Environment me dobara
> poora URL daal kar **Manual Deploy** karo.

---

## Zaroori notes

- 🔑 **Admin password badalna:** `server.js` me `ADMIN_PASSWORD = 'admin123'`
  hai — apna strong password kar do, phir redeploy karo.
- 📞 **Apna phone number:** `public/index.html` me `APNA NUMBER YAHAN` dhoondo —
  2 jagah demo number `+91 98765 43210` hai, apna asli number likh do.
- 🔒 **Passwords kabhi visible nahi hote** — na admin panel me, na database me.
  Wo hash hokar save hote hain. Yehi sahi aur safe tareeka hai — sir ko ye batana! 💪
- 💳 **Payments demo mode hain** — UPI/Card ke paise asli me nahi kat-te.
