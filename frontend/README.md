# Ecommerce Frontend

React + Vite + shadcn/ui storefront targeting Bangladeshi customers (Hind Siliguri font, BDT currency).

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the API URL

Copy `.env.example` to `.env.local` and set your backend URL:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_API_BASE_URL=https://api.your-domain.com
```

> During local development against your PHP backend, use:
> `VITE_API_BASE_URL=http://localhost:8000`  (or wherever XAMPP/Laragon serves it)

### 3. Run locally
```bash
npm run dev
```

Open `http://localhost:5173`

---

## Deploy to Vercel

1. Push the `/frontend` folder (or the whole repo) to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Set **Root Directory** to `frontend`.
4. Under **Environment Variables** add:
   - `VITE_API_BASE_URL` = `https://api.your-domain.com`
5. Click **Deploy**.

After deploy, copy the Vercel domain (e.g. `https://mystore.vercel.app`) and add it to `ALLOWED_ORIGINS` in your `backend/config.php`.

---

## Project structure

```
src/
├── App.jsx                  # Router + layout wiring
├── main.jsx
├── index.css                # Tailwind + shadcn CSS variables
├── lib/
│   ├── api.js               # All fetch calls to the PHP backend
│   └── utils.js             # cn(), formatPrice(), formatDate()
├── context/
│   ├── AuthContext.jsx      # Admin session (sessionStorage)
│   └── CartContext.jsx      # Shopping cart state (React memory)
├── components/
│   ├── ui/                  # shadcn/ui components (button, card, table…)
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   └── ProtectedRoute.jsx
└── pages/
    ├── Home.jsx
    ├── Product.jsx
    ├── Checkout.jsx         # Meta Pixel browser event fired here
    ├── OrderSuccess.jsx
    └── admin/
        ├── Login.jsx
        └── Dashboard.jsx    # Orders / Products / Settings tabs
```

---

## Auth token storage

The admin JWT-style token is stored in `sessionStorage` (not `localStorage`).

**Tradeoff:**
- `sessionStorage` is cleared when the browser tab is closed — lower XSS exposure window.
- `localStorage` survives restarts — more convenient but riskier if an XSS vector exists.

For an internal-only admin panel, `sessionStorage` is the right choice.

---

## Meta Pixel

The browser-side Pixel is loaded **only on the Checkout page**, using the Pixel ID fetched from
`GET /api/public/pixel`. This keeps the ID configurable from the admin panel without a frontend redeploy.

The `eventID` passed to `fbq('track', 'Purchase', ..., { eventID })` matches the `event_id`
returned by the server — this is how Meta deduplicates the browser Pixel event and the
server-side CAPI event.
