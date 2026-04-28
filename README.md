# 3ZF Platform — Three Zeros of Freedom

**Full-stack Monorepo** | Next.js 16 · Node.js · MongoDB · Socket.io · Cloudinary · bKash · Nagad · Rocket · SureCash

---

## 📁 Complete File Structure (120 Files)

```
3zf/
├── docker-compose.yml
├── turbo.json
├── package.json
│
├── apps/
│   ├── backend/                         Node.js + Express (port 5000)
│   │   └── src/
│   │       ├── index.ts                 Server entry + all routes
│   │       ├── types/index.ts           TypeScript types
│   │       ├── config/
│   │       │   ├── database.ts          MongoDB Atlas
│   │       │   ├── cloudinary.ts        Cloudinary upload
│   │       │   └── socket.ts            Socket.io events
│   │       ├── controllers/
│   │       │   ├── auth.controller.ts   Register, OTP, Login, Reset
│   │       │   ├── user.controller.ts   Profile, follow, block, settings
│   │       │   ├── post.controller.ts   Feed, CRUD, like, comment, share
│   │       │   ├── message.controller.ts Conversations, send, react
│   │       │   ├── payment.controller.ts All 4 gateways + callbacks
│   │       │   └── admin.controller.ts  Dashboard, ban, analytics
│   │       ├── middleware/
│   │       │   ├── auth.middleware.ts   JWT authenticate + authorize
│   │       │   ├── ratelimit.middleware.ts Rate limiter
│   │       │   ├── upload.middleware.ts Multer file upload
│   │       │   └── error.middleware.ts  Global error handler
│   │       ├── models/
│   │       │   ├── User.model.ts
│   │       │   ├── Post.model.ts
│   │       │   ├── Message.model.ts     Conversation + Message
│   │       │   ├── Group.model.ts       Group + Page
│   │       │   ├── Organisation.model.ts
│   │       │   ├── Product.model.ts     Product + Cart + Order
│   │       │   ├── Payment.model.ts     All gateway transactions
│   │       │   └── Misc.models.ts       Event, Blog, Gallery, Notification
│   │       ├── routes/
│   │       │   ├── auth.routes.ts
│   │       │   ├── user.routes.ts
│   │       │   ├── post.routes.ts
│   │       │   ├── friend.routes.ts
│   │       │   ├── message.routes.ts
│   │       │   ├── group.routes.ts
│   │       │   ├── page.routes.ts
│   │       │   ├── organisation.routes.ts
│   │       │   ├── association.routes.ts
│   │       │   ├── supershop.routes.ts
│   │       │   ├── payment.routes.ts    ← bKash, Nagad, Rocket, SZLM
│   │       │   ├── admin.routes.ts
│   │       │   └── misc.routes.ts       Event, Blog, Gallery, Contact
│   │       ├── services/
│   │       │   ├── bkash.service.ts
│   │       │   ├── nagad.service.ts
│   │       │   ├── rocket.service.ts
│   │       │   └── szlm.service.ts
│   │       └── utils/
│   │           ├── email.ts
│   │           ├── helpers.ts
│   │           └── otp.ts
│   │
│   └── frontend/                        Next.js 16 App Router (port 3000)
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx             Landing page
│           │   ├── settings/page.tsx
│           │   ├── admin/page.tsx       Admin dashboard
│           │   ├── payment/
│           │   │   ├── page.tsx         Payment redirect handler
│           │   │   ├── success/page.tsx
│           │   │   └── failed/page.tsx
│           │   ├── (auth)/
│           │   │   ├── login/page.tsx
│           │   │   ├── register/page.tsx + OTP
│           │   │   └── password/page.tsx forgot+reset
│           │   ├── (community)/
│           │   │   ├── layout.tsx       Sidebar + auth guard
│           │   │   └── community/
│           │   │       ├── page.tsx     Feed (infinite scroll)
│           │   │       ├── profile/[username]/page.tsx
│           │   │       ├── messages/page.tsx   Realtime chat
│           │   │       ├── notifications/page.tsx
│           │   │       ├── friends/page.tsx
│           │   │       ├── groups/page.tsx
│           │   │       ├── pages/page.tsx
│           │   │       ├── explore/page.tsx    Search
│           │   │       ├── reels/page.tsx
│           │   │       └── saved/page.tsx
│           │   └── (main)/
│           │       ├── about/page.tsx
│           │       ├── association/page.tsx
│           │       ├── blog/page.tsx
│           │       ├── contact/page.tsx
│           │       ├── events/page.tsx
│           │       ├── gallery/page.tsx
│           │       ├── organisation/
│           │       │   ├── page.tsx     Registration form
│           │       │   ├── donate/page.tsx ← Payment gateway
│           │       │   ├── pending/page.tsx
│           │       │   ├── books/page.tsx
│           │       │   ├── requests/page.tsx
│           │       │   └── gallery/page.tsx
│           │       └── supershop/
│           │           ├── page.tsx     Product listing
│           │           ├── cart/page.tsx ← Payment gateway
│           │           ├── orders/page.tsx
│           │           └── product/[slug]/page.tsx
│           ├── components/
│           │   ├── admin/PaymentsTab.tsx
│           │   ├── community/
│           │   │   ├── CommunityNavbar.tsx
│           │   │   ├── CreatePost.tsx
│           │   │   ├── FriendSuggestions.tsx
│           │   │   ├── PostCard.tsx
│           │   │   ├── StoryRow.tsx
│           │   │   └── index.tsx
│           │   ├── layout/
│           │   │   ├── MainNavbar.tsx   EN/BN + dark/light
│           │   │   └── MainFooter.tsx
│           │   ├── payment/
│           │   │   └── PaymentGateway.tsx  ← All 4 gateways UI
│           │   ├── providers/QueryProvider.tsx
│           │   ├── supershop/ProductCard.tsx
│           │   └── ui/
│           │       ├── LanguageSwitcher.tsx  badge/icon/full
│           │       ├── Modal.tsx             Modal, Badge, Avatar
│           │       ├── Spinner.tsx
│           │       └── ThemeToggle.tsx
│           ├── hooks/
│           │   ├── useSocket.ts
│           │   └── useT.ts              ← Translation hook (EN/BN)
│           ├── lib/
│           │   ├── api.ts               Axios + auto token refresh
│           │   └── i18n.ts              Complete EN + বাংলা translations
│           ├── store/
│           │   ├── authStore.ts         Zustand auth
│           │   └── langStore.ts         Language (en/bn)
│           └── styles/globals.css
```

---

## 🚀 Quick Setup

```bash
# 1. Extract
unzip 3zf-platform-full.zip && cd 3zf

# 2. Backend env
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your credentials

# 3. Frontend env
cp apps/frontend/.env.example apps/frontend/.env.local
# Edit .env.local

# 4. Install & run
# Terminal 1:
cd apps/backend && npm install && npm run dev

# Terminal 2:
cd apps/frontend && npm install && npm run dev

# Or with Docker:
docker-compose up -d
```

---

## 🔑 Required Services

| Service | Purpose | Get From |
|---------|---------|---------|
| MongoDB Atlas | Database | mongodb.com/atlas |
| Cloudinary | Media | cloudinary.com |
| Gmail SMTP | Email/OTP | Google App Password |
| bKash | Payment | developer.bka.sh |
| Nagad | Payment | Nagad Merchant Portal |
| Rocket | Payment | Dutch Bangla Bank |
| SureCash | Payment | surecash.net |

---

## 🌐 Language System

```tsx
// In any component:
import { useT } from '@/hooks/useT';

function MyComponent() {
  const { t, lang, setLang } = useT();
  return (
    <>
      <h1>{t.nav.home}</h1>
      <button onClick={() => setLang('bn')}>বাংলা</button>
      <button onClick={() => setLang('en')}>English</button>
    </>
  );
}
```

**How it works:**
- `langStore.ts` stores only `lang: 'en' | 'bn'` (persisted in localStorage)
- `useT()` hook reads lang and returns fresh `translations[lang]` every render
- No hydration mismatch — no stale closures
- `LanguageSwitcher` component: `variant="badge" | "icon" | "full"`

---

## 💳 Payment Gateway Flow

```
POST /api/payments/initiate
  → bKash: redirect to bkashURL
  → Nagad: redirect to callBackUrl  
  → Rocket: redirect to redirect_url
  → SZLM: redirect to payment_url
  → COD: instant confirm

Gateway callback → /api/payments/callback/{gateway}
  → verify payment
  → update order/donation status
  → redirect to /payment/success or /payment/failed

Manual TrxID → POST /api/payments/manual-verify
  → admin notified → PATCH /api/payments/admin/:id/approve
```

---

## ⚡ Realtime Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `newMessage` | Server→Client | New chat message |
| `userTyping` | Server→Client | Typing indicator |
| `newNotification` | Server→Client | Likes, comments, friend requests |
| `onlineUsers` | Server→Client | Online user list |
| `messageDeleted` | Server→Client | Message soft delete |
| `orderStatusUpdated` | Server→Client | Order tracking |
| `accountStatusChanged` | Server→Client | Ban notification |
| `adminNotification` | Server→Admin | New orders, payments, deletion requests |

---

## 👤 Roles & Access

| Role | Capabilities |
|------|-------------|
| `user` | Full community access, shop, donate |
| `moderator` | + Moderate posts, view contacts |
| `admin` | + Full user management, approve registrations |
| `superadmin` | + Change roles, system config |

---

## 📱 All Pages

| URL | Page |
|-----|------|
| `/` | Landing page |
| `/about` | About 3ZF |
| `/login` | Sign in |
| `/register` | Register + OTP |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/community` | Feed |
| `/community/profile/:username` | Profile |
| `/community/messages` | Realtime chat |
| `/community/notifications` | Notifications |
| `/community/friends` | Friends |
| `/community/groups` | Groups |
| `/community/pages` | Pages |
| `/community/explore` | Search |
| `/organisation` | Registration |
| `/organisation/donate` | Donate |
| `/organisation/pending` | Status |
| `/organisation/books` | Book donation |
| `/association` | NGO info |
| `/supershop` | Products |
| `/supershop/cart` | Cart + Checkout + Payment |
| `/supershop/orders` | My orders |
| `/supershop/product/:slug` | Product detail |
| `/events` | Events |
| `/blog` | Blog |
| `/gallery` | Gallery |
| `/contact` | Contact |
| `/settings` | User settings |
| `/admin` | Admin dashboard |
| `/payment/success` | Payment confirmed |
| `/payment/failed` | Payment failed |

---

*Built with ❤️ — 3ZF Platform, Bangladesh*
