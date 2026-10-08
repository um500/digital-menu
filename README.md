# Garden Cafe — QR Ordering (Phase 1 + 2 + 3 + 4 + 5 + 6)

QR-code-based ordering and kitchen/admin management for restaurants, built with Next.js 16, MongoDB, and Sanity CMS.

## Scope so far

**Phase 1 — core ordering:**
- Customer: scan table QR → browse menu (Sanity-backed) → cart → checkout (manual/demo payment placeholder) → place order → live order status tracking.
- Kitchen Display Screen: realtime queue of incoming orders (New → Accepted → Preparing → Ready), via SSE.
- Admin: login, Live Orders dashboard (realtime, cancel in-flight orders).

**Phase 2 — admin management:**
- **Tables**: create/edit/delete tables from `/admin/tables`, each with a signed, printable QR code generated on demand (no manual DB seeding needed anymore).
- **Settings**: `/admin/settings` — restaurant name, GST number/%, and per-client payment-method toggles (online/cash/card/meal-voucher/corporate billing). Auto-created with sane defaults on first visit.
- **Reports**: `/admin/reports` — date-range sales summary (orders, revenue, avg. order value), payment-method breakdown, and top-selling items.
- Menu content management stays in the embedded Sanity Studio (`/studio`) by design — linked from the admin nav rather than duplicated.

**Phase 3 — customer engagement:**
- **Loyalty**: customers are recognized by phone number (no OTP, as decided) — 1 point per ₹10 spent, redeemable at checkout for ₹1/point off, capped at 50% of that order's bill. Balance shown at checkout via a debounced lookup.
- **Coupons**: `/admin/coupons` — % or flat-off codes with min-order, expiry, max-discount cap, and usage limits. Re-validated server-side on every order; the checkout preview is only an estimate.
- **Split bill**: a pure client-side calculator on the order status page — equal split across N people. No backend involved; payment is still settled manually until Phase 6.
- **Call waiter**: dine-in customers can ping the counter from their order page; shows up as a highlighted banner on the admin Live Orders board until acknowledged.
- **Feedback**: a star rating + optional comment once an order is served; surfaced as an average rating and recent comments on the Reports page.

**Phase 4 — inventory & counter orders:**
- **Inventory**: `/admin/inventory` — opt-in per-item stock tracking (most items don't need it). A tracked item that hits zero stock atomically blocks new orders for it (reserved inside the same order transaction, so two concurrent orders can't both claim the last unit) and shows as sold out on the customer menu, same as toggling it off in Sanity.
- **Counter orders**: `/admin/counter` — a cashier screen to take walk-in orders, choosing an empty table (dine-in) or takeaway, reusing the same order-creation pipeline (pricing, loyalty, coupons, stock) as the QR flow.

**Phase 5 — operations:**
- **Staff PIN auth**: `/admin/staff` — admins add staff (name, role, 4-6 digit PIN). On shared devices (kitchen tablet, counter terminal) staff "clock in" with their PIN via a small badge in the header; this attributes actions (order status changes, counter orders placed) to a person without replacing the admin login that still protects the device itself. The identified name travels with the action and is saved on the order as `lastHandledByStaff`.
- **Table transfer**: on `/admin/tables`, an occupied table's order can be moved to any empty table (party moved seats, wrong table assigned) — atomically frees the old table and occupies the new one.
- **Table merge**: on `/admin/tables`, an occupied table's order can be folded into another active order (two orders on one table, or combining tables) — items move over, the target's totals are recomputed, and the source order is marked `cancelled` with `mergedIntoOrderId` set (kept for reporting, not deleted). Any coupon/loyalty discount on the merged-away order is not carried over.
- **KOT printing**: a "Print KOT" button on the Kitchen Display and admin Live Orders opens a thermal-receipt-styled ticket (items only, no prices) and triggers the browser print dialog — same `window.print()` pattern as the table QR print flow.

**Phase 6 — payments & billing:**
- **Online payment (Razorpay)**: at checkout, customers choose "Pay online now" (if enabled in Settings) or "Pay at the table" (cash/card). An online order is created with `paymentStatus: "pending"`; on the order status page, a "Pay now" button opens Razorpay Checkout, and a successful payment is verified **server-side** (HMAC signature check against `RAZORPAY_KEY_SECRET`, never trusting the browser's callback alone) before the order is marked paid.
- **Cash/card settlement**: these orders have no payment gateway callback, so the admin marks them paid directly from `/admin/live-orders` ("Mark paid") once the bill is actually settled at the table/counter. Counter orders (`/admin/counter`) default to cash.
- **Payment-at-checkout fraud gate**: a customer's own QR order paid by cash/card is created as `paymentStatus: "pending"` and does **not** reach the Kitchen Display — it sits on `/admin/live-orders` highlighted "Awaiting approval" until an admin clicks "Approve", so a customer can't order, walk off, and leave the kitchen holding food no one pays for. Online orders clear this automatically once Razorpay verifies payment. Counter orders skip the gate entirely (`lib/orders/create-order.ts`) — the staff member taking the order is standing right there collecting payment.
- **GST billing**: a "Print bill" button on the customer order page opens a thermal-receipt-styled, itemized GST bill (subtotal, CGST + SGST split from each line's tax, discount, total, and the restaurant's GSTIN from Settings) via the same `window.print()` pattern as KOT printing. This assumes intra-state billing (CGST+SGST); inter-state (IGST) isn't modeled.
- Reports' existing payment-method breakdown (`/admin/reports`, built in Phase 2) now reflects real online/cash/card data instead of everything landing under the old "manual" placeholder.

## UI redesign (Phase 7)

The functional app above (Phases 1–6) was rebuilt visually to match a set of branded reference mockups — every customer, kitchen, and admin page, not just a few screens.

**Design tokens** (`app/globals.css`, Tailwind v4 `@theme inline`): `--color-cream` / `--color-cream-soft` (page backgrounds), `--color-ink` / `--color-ink-soft` / `--color-ink-sidebar` (text + the dark admin sidebar/kitchen display), `--color-primary` (rust-orange) / `--color-primary-dark` / `--color-primary-light`, `--color-accent` (teal-green) / `--color-accent-dark` / `--color-accent-light`, `--color-border`, and `--font-display` (Georgia/serif for headings and the brand wordmark — falls back to the system serif stack since this sandbox can't reach Google Fonts; swap in a real webfont link when deploying with network access). Every page and shared component now draws from these tokens instead of raw Tailwind grays/oranges, so a future palette tweak only touches `globals.css`.

**New shared pieces**: `GardenCafeLogo`, `StatCard` (admin stat tiles), a kanban-style `LiveOrderBoard` for Live Orders, branded print templates (KOT + GST bill + table QR) that match the in-app look, a numeric-keypad `StaffPinGate`, and a real `useWaiterCallToasts` admin-wide notification stack.

**Scope decisions — intentionally not built**, despite appearing in the mockups:
- **Menu item size/spice customization.** The mockups show per-item size and spice-level pickers. Wiring this correctly means a new client-submitted option identifier that still has to be resolved and re-priced server-side (schema → query → types → cart → validation → price snapshot, across ~3 UI layers) to keep prices trustworthy. Given the size of that chain, it was cut from this pass; the item modal still supports quantity and a free-text note.
- **Inventory "ingredients" with linked menu items.** The mockup implies a full ingredient catalog (e.g. "tomatoes" used by 4 dishes, stock shared across them). The actual data model tracks stock per menu item, not per shared ingredient — building a fake ingredient CRUD on top would mean UI that doesn't do what it visually promises, so it was left as per-item stock tracking (now with search/sort/stock bars instead).
- **"Sign in with PIN" as a login method.** The mockup's login screen offers PIN entry as an alternative to email/password. The codebase's staff PIN system is explicitly documented (`lib/db/models/Staff.ts`) as identity-only, not access control — it requires an already-authenticated admin session to verify against. Wiring PIN entry to grant a session directly would let anyone with a 4-6 digit staff PIN log in as admin on an unattended device, which is a real security regression. The numeric-keypad UI from the mockup was used instead, but only in the one place it's safe: the existing admin-gated "clock in" flow on shared kitchen/counter tablets.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where to get it |
   |---|---|
   | `MONGODB_URI` | MongoDB Atlas (or local) connection string |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | [sanity.io/manage](https://sanity.io/manage) |
   | `SANITY_API_WRITE_TOKEN` | Sanity project → API → Tokens → Editor access |
   | `SESSION_SECRET` | `openssl rand -base64 48` |
   | `QR_SECRET` | `openssl rand -base64 48` (different from `SESSION_SECRET`) |
   | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys (use test-mode keys for development) |
   | `NEXT_PUBLIC_DEMO_RESTAURANT_ID` | any slug, e.g. `demo-restaurant` — must match the `restaurantId` on your Sanity content and Mongo docs |

3. **Seed Sanity content (optional)**

   Run the dev server, open `/studio`, and create at least one `category` and one `menuItem`, each with `restaurantId` set to your `NEXT_PUBLIC_DEMO_RESTAURANT_ID`. You don't have to do this before trying the app — see the sample menu fallback below.

4. **Create an admin login**

   Only the first admin user needs manual seeding — everything else (settings, tables) is managed from the admin UI once you're logged in. Insert one `Admin` document directly in MongoDB for your `restaurantId`, with `passwordHash` set to a bcrypt hash (12 rounds) of your chosen password — e.g. via a one-off Node script calling `lib/auth/password.ts`'s `hashPassword()`.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   - Admin: `http://localhost:3000/admin/login` → `/admin/live-orders`
     - Visit `/admin/settings` first (it self-creates with defaults) to set your restaurant name and GST.
     - Visit `/admin/tables` to add tables and print/scan their QR codes — this replaces the old manual Mongo seeding step.
   - Customer flow: scan a table's QR from `/admin/tables`, or open the printed/previewed URL directly.
   - Kitchen display: `http://localhost:3000/kitchen`
   - Sanity Studio: `http://localhost:3000/studio` (also linked from the admin nav)

## Architecture notes

- **Sample menu fallback**: a new restaurant with nothing in Sanity yet isn't stuck looking at an empty menu — `getMenu()` (`lib/menu/get-menu.ts`) falls back to a built-in sample menu (`lib/menu/sample-menu.ts`, 4 categories/15 items) whenever a restaurant has zero real `category` documents in Sanity. It's a real fallback, not just a display mock: sample items are genuinely orderable (`getMenuItemForOrder()` resolves their prices from the same file, the same server-authoritative way it resolves a real Sanity item's price), so the whole app — customer menu, counter, inventory — stays fully functional before anyone has touched Studio. The moment a restaurant's Sanity has even one real category, this stops automatically; it's a per-restaurant check on every read, not a one-time switch. This only covers "Sanity has nothing yet" — it does not catch Sanity being unreachable (a real outage still surfaces as an error, on purpose, so a down integration doesn't go unnoticed).
- **Multi-tenant isolation**: every Mongo query and Sanity GROQ query is scoped by `restaurantId`.
- **IDOR protection**: customer order lookups require a random `sessionToken` cookie, not just the order's Mongo `_id`.
- **Tamper-proof QR codes**: table QR URLs are HMAC-signed (`lib/qr/generate-qr.ts`) so a table/restaurant ID can't be edited in the URL.
- **Trusted pricing**: order totals are always recomputed server-side from live Sanity data at order time — the client cart's displayed price/total is an estimate only.
- **Realtime**: Kitchen Display and admin Live Orders use Server-Sent Events (`lib/realtime/events.ts`), backed by an in-process event bus (single-instance only — fine for Phase 1, revisit before scaling to multiple server instances).
- **Reports date range**: "today" always means the IST calendar day (`lib/reports/get-report.ts`), regardless of the server's own timezone — this is an India-only product, so that's intentional rather than a bug.
- **Table QR codes**: regenerated on demand from the table's stored HMAC signature (`lib/qr/qr-image.ts`) rather than stored as image files — printing again later always reflects the current signature.
- **Order placement is transactional**: the order document, the table status flip, the coupon usage increment, and the loyalty points debit/credit all commit atomically in one MongoDB transaction (`lib/orders/create-order.ts`) — a crash partway through can't leave a priced order with no loyalty debit. Requires a replica set (Atlas's default, including the free tier — a bare standalone `mongod` does not support transactions).
- **Loyalty/coupon discounts are always re-validated server-side** at order time from the authoritative bill, never trusted from the client's checkout preview — same pricing-integrity rule as menu prices.
- **Stock is operational data, not content**: it lives in Mongo (`lib/db/models/Inventory.ts`) rather than on the Sanity menu item, and is merged into what `getMenu()` returns so every caller still sees one `isAvailable` flag.
- **Staff PINs are identity, not access control**: `lib/staff/verify-pin.ts` just answers "whose PIN is this", gated behind an already-authenticated admin session (`requireAdmin()`) — a shared tablet is never protected by a staff PIN alone. PINs aren't unique/indexed, so verification checks the hash of every active staff member for the restaurant, which is fine at one cafe's shift-roster scale.
- **Table transfer/merge are transactional** for the same crash-safety reason order placement is: `lib/orders/transfer-order.ts` and `lib/orders/merge-orders.ts` wrap the order + table updates in a MongoDB transaction so a table's `activeOrderId` can never point at an order that doesn't point back at it.
- **Payment confirmation is never trusted from the browser**: `lib/payments/order-payment.ts` re-derives the Razorpay signature server-side (`lib/payments/razorpay.ts`, HMAC-SHA256 with `RAZORPAY_KEY_SECRET`, `crypto.timingSafeEqual`) before marking an order paid — the checkout widget's success handler runs in the customer's browser and could otherwise be forged by calling the verify endpoint directly with a fake "it succeeded".
- **Razorpay order creation is idempotent**: re-opening the order status page and tapping "Pay now" again reuses the same `razorpayOrderId` already stored on the order rather than opening a second payment for the same bill.

## Deploy

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying). Make sure all `.env.example` variables are set in your hosting provider.
