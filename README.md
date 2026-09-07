# LendLoop

A MERN money-lending app for tracking what you lent, what you borrowed, borrow requests between friends, partial repayments, UPI QR payments, and live in-app notifications.

- **Frontend:** React + Vite (`http://localhost:5173`)
- **Backend:** Express + MongoDB Atlas (`http://localhost:5000`)
- **Realtime:** Socket.IO
- **Outbound alerts:** Twilio SMS + Twilio Email, optional SendGrid, optional SMTP

## Complete feature checklist

Everything currently built in the app:

### Accounts
- [x] Register with name, email, password; optional phone and UPI
- [x] Login with JWT (stored in `localStorage`, 7 days)
- [x] Logout
- [x] Protected routes
- [x] Rate-limited login/register
- [x] Profile: account details, stats, update phone/UPI, regenerate QR
- [x] Google Sign-In **removed** (not in the product)

### Logging money
- [x] Add lent or borrowed (friend, amount, date, optional due date, note)
- [x] New loans start **still due** — no payment-status picker on Add
- [x] Transactions list: All / Lent / Borrowed / Repaid tabs
- [x] Filter by friend, sort, pagination
- [x] Edit and delete **manual** (unlinked) loans
- [x] Linked borrow-request loans: cannot delete; cannot change friend/type/principal; **can** record payment

### Partial pay and status
- [x] Stored as rupees + paise: principal, amount paid, remaining
- [x] Status: active, pending approval, repaid; **partial** badge when some amount is paid
- [x] Edit only: Still due / Half paid / Custom amount / Fully paid
- [x] Lender **Record payment** opens that edit screen
- [x] Linked lent + borrowed stay in sync when payment is recorded

### Borrow requests
- [x] Search/select a registered lender
- [x] Send amount, reason, optional due date
- [x] Lender accept → linked lent + borrowed transactions
- [x] Lender reject → no transactions
- [x] Email + SMS to lender on new request (Twilio / SendGrid / SMTP)

### Repayment requests
- [x] Borrower requests full or partial repayment (cannot exceed remaining)
- [x] Lender approve / reject
- [x] Approve updates both linked loans
- [x] Repayment history (borrower or lender)

### Notifications
- [x] Navbar bell with unread count
- [x] MongoDB `Notification` model (user, type, title, message, read, relatedTransaction, createdAt)
- [x] Live push via Socket.IO
- [x] Mark one read / mark all read
- [x] Created on: borrow request, accept/reject, repayment sent/approved/rejected, add loan, record/edit/delete payment, due tomorrow (when the bell is opened)
- [x] Home does **not** show a separate activity feed — alerts stay in the bell

### Settle up and share
- [x] Summary: **Record payment**, **Ask to pay**, **Request repayment** per friend
- [x] Request repayment deep-links to `/borrower-dashboard?repay=<id>`
- [x] Share sheet: WhatsApp, copy UPI ID, copy message, QR (amount in UPI payload when set)
- [x] Share from Summary, Lender table, and Profile (Share UPI / WhatsApp)
- [x] Record / Ask to pay as compact green and gold pill buttons with icons

### Dashboards
- [x] Home: greeting, outstanding lent, you owe, settled, needs action, recent loans, quick links
- [x] Lender: pending repayments, borrow requests, money you lent (not money you borrowed)
- [x] Borrower: sent requests, borrowed loans, mark as paid
- [x] Friend-wise summary with outstanding bars
- [x] UPI QR on profile and when viewing a counterparty

### UI
- [x] Forest green, cream, gold, coral palette
- [x] Fraunces + Plus Jakarta Sans
- [x] Glass navbar, frosted cards
- [x] Primary button hover keeps cream text (readable)

### Not shipped (helpers only)
- [ ] Forgot password UI/API — `sendPasswordResetOtp` exists in the email service but is **not** wired to routes or screens

---

## Features (implementation reference)

### Auth and profile

- Email/password **register** and **login** with JWT (7-day token in `localStorage`)
- Protected routes for all app screens
- **Profile:** name, email, phone, UPI ID; regenerate UPI QR
- Rate-limited login/register
- Google Sign-In is **not** used

### Manual transactions (Add / list)

- Add **lent** or **borrowed** with friend name, amount, date, optional due date, optional note
- **Add transaction does not show payment status.** New loans start as still due (`amountPaid = 0`, `remainingAmount = amount`)
- Transactions list: tabs (all / lent / borrowed / repaid), friend filter, sort, pagination
- Edit and delete unlinked (manually added) loans
- Linked loans (created from an accepted borrow request) cannot be deleted; payment can still be recorded on edit

### Partial repayment and edit payment status

Loans store rupees **and** integer paise:

- `principalAmount` / `originalAmount` — original loan
- `amountPaid` / `paidPaise`
- `remainingAmount` / `remainingPaise`
- `status`: `active` | `pending_approval` | `repaid`

**Edit transaction only** shows **Payment received**:

- Still due
- Half paid (50%)
- Custom amount
- Fully paid

Lender dashboard has **Record payment**, which opens the same edit screen. Updating payment on a linked borrow-request loan updates **both** the lent and borrowed sides.

### Borrow requests

- Borrower searches registered users and sends amount, reason, optional due date
- Lender **accept** creates a linked lent + borrowed pair
- Lender **reject** leaves no transactions
- Lender dashboard lists received requests; borrower dashboard lists sent requests

### Repayment requests (in-app flow)

- Borrower can request a **full or partial** repayment on an active borrowed loan
- Amount cannot exceed remaining balance
- Loan goes to `pending_approval` until the lender approves or rejects
- Approve applies the payment to both linked sides; reject returns the loan to `active`

### Notification Center

Navbar **bell**. Unread count, relative times, mark one read / mark all read.

**Stored in MongoDB** (`Notification`):

| Field | Meaning |
| --- | --- |
| `user` | Owner of the notification |
| `type` | Event kind (see below) |
| `title` / `message` | Copy shown in the panel |
| `read` | Unread until clicked or mark-all |
| `relatedTransaction` | Optional loan id |
| `createdAt` | Timestamp |

**Types:** `borrow_request`, `borrow_accepted`, `borrow_rejected`, `repayment_received`, `repayment_approved`, `repayment_rejected`, `payment_due`, `payment_recorded`, `loan_logged`, `loan_updated`, `loan_deleted`

**When a notification is created**

| Action | Who sees it |
| --- | --- |
| New borrow request | Lender (in-app + Twilio SMS/email) |
| Accept / reject borrow request | Borrower |
| Borrower sends repayment request | Lender + borrower |
| Lender approves / rejects repayment | Borrower |
| Add a new manual transaction | Owner (`loan_logged`) |
| Record more payment on edit | Owner (and linked counterpart if payment changed) |
| Edit loan without changing paid amount | Owner (`loan_updated`) |
| Reduce amount paid | Owner (`loan_updated`) |
| Delete a manual transaction | Owner (`loan_deleted`) |
| Loan due **tomorrow** | Owner, when they open the bell (once per day per loan) |

**Live updates:** authenticated Socket.IO (`auth.token` = JWT). Server emits `notification` to room `user:<userId>`.

**Email / SMS stack** (borrow-request outbound; password-reset helper exists but is not exposed as a public forgot-password flow):

1. Twilio Email API  
2. SendGrid (if `SENDGRID_API_KEY` is set)  
3. SMTP (`EMAIL_USER` / `EMAIL_PASS`)  
4. Twilio SMS to the lender’s phone (`SMS_COUNTRY_CODE` default `+91`)

Twilio trial accounts can only message verified numbers/emails.

### Dashboards and money views

- **Home:** outstanding lent, you owe, settled, items needing action, recent loans, quick links
- **Lender:** pending repayment approvals, borrow requests, lent table, record payment, **ask to pay**
- **Borrower:** sent requests, borrowed loans, repayment amount vs remaining; Summary can deep-link `?repay=` to open the repay form
- **Summary:** friend-wise outstanding; **Record payment**, **Ask to pay**, **Request repayment**
- **Repayment history:** requests where you are borrower or lender
- **Share pay:** WhatsApp, copy UPI ID, copy message, QR (Profile, Summary, Lender)
- Lender dashboard does **not** list money you borrowed (that stays on Borrower)

### UPI QR

- QR generated from `upi://pay` in INR
- Shown on profile and when reviewing a counterparty on lender/borrower flows

### UI

- Brand: forest green, cream, gold, coral for amounts you owe
- Fonts: Fraunces (headings), Plus Jakarta Sans (UI)
- Glass navbar, frosted cards, shared `btn-primary` / `input` / `surface` styles
- Primary buttons keep readable cream text on hover (no white-on-white)

## Application screens

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create an account, optional UPI |
| `/dashboard` | Home overview |
| `/add` | Add a manual transaction (no payment-status picker) |
| `/edit-transaction/:id` | Edit details and **payment received** |
| `/transactions` | List, filter, edit, delete |
| `/summary` | Totals grouped by friend |
| `/borrow-request` | Send a borrow request |
| `/lender-dashboard` | Requests, repayment approvals, money you lent |
| `/borrower-dashboard` | Sent requests, money you borrowed, repay |
| `/profile` | Account, UPI, QR, stats |
| `/repayment-history` | Repayment request history |

## API (authenticated unless noted)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | |
| PUT | `/api/auth/profile/upi` | |
| GET | `/api/auth/user/:id/qr` | |
| GET/POST | `/api/transactions` | Query: `type`, `status`, `friendName`, `page`, `limit`, `sort`, `order` |
| GET/PUT/DELETE | `/api/transactions/:id` | PUT may include `amountPaid` |
| GET | `/api/transactions/type/:type` | `lent` or `borrowed` |
| GET | `/api/friends/summary` | |
| POST/GET | `/api/borrow-requests` | Send / list (see borrow-request routes) |
| PUT | `/api/borrow-requests/:id/accept` | |
| PUT | `/api/borrow-requests/:id/reject` | |
| POST | `/api/repayments/request` | Body: `transactionId`, `amount`, `note` |
| GET | `/api/repayments/pending` | Lender |
| GET | `/api/repayments/history` | |
| PUT | `/api/repayments/:id/approve` | |
| PUT | `/api/repayments/:id/reject` | |
| GET | `/api/notifications` | Also generates due-tomorrow reminders |
| GET | `/api/notifications/unread-count` | |
| PUT | `/api/notifications/read-all` | |
| PUT | `/api/notifications/:id/read` | |
| GET | `/api/health` | Public |

Socket.IO attaches to the same HTTP server as Express (port `5000`). The client connects to the API origin (strip `/api` from `VITE_API_URL`).

## Key backend files

| Area | Files |
| --- | --- |
| Money / partial pay | `backend/utils/money.js` |
| Transactions | `backend/services/transaction.service.js` |
| Borrow requests | `backend/services/borrowRequest.service.js` |
| Repayments | `backend/services/repayment.service.js` |
| In-app + Socket.IO emit | `backend/services/inAppNotification.service.js`, `backend/socket.js` |
| Email / SMS | `backend/services/notification.service.js` |
| Models | `Transaction`, `BorrowRequest`, `RepaymentRequest`, `Notification`, `User` |

## Local development

1. Start MongoDB or use Atlas (`MONGO_URI`). Whitelist your IP if using Atlas.
2. Copy `backend/.env.example` to `backend/.env`. Set at least `MONGO_URI` and `JWT_SECRET`.
3. Copy `frontend/.env.example` to `frontend/.env` if the API is not `http://localhost:5000/api`.

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:5173`. API: `http://localhost:5000`.

### Use on another laptop (same Wi‑Fi)

`localhost` on someone else’s laptop is **their** PC, not yours. Keep **your** backend + frontend running, then:

1. MongoDB Atlas → Network Access → allow `0.0.0.0/0` (or every classmate’s IP).
2. Windows Firewall: allow Node on ports **5000** and **5173**.
3. Restart Vite after pulling these proxy changes. In the frontend terminal you should see a **Network** URL like `http://192.168.x.x:5173`.
4. Other laptops open **that Network URL**, not `localhost`.

Friends cloning the repo still need their own `backend/.env` (`MONGO_URI`, `JWT_SECRET`) plus Atlas access. Your `.env` is not in git.

For **anyone on the internet** (Vercel link, WhatsApp, college demo), a laptop on Wi‑Fi is not enough. Deploy Express (Render) and set Vercel `VITE_API_URL` as below.

### Environment variables (backend)

| Variable | Purpose |
| --- | --- |
| `PORT` | Default `5000` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs auth tokens and Socket.IO auth |
| `CLIENT_URL` | CORS + links in emails (comma-separated) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` | SMS |
| `TWILIO_EMAIL_FROM` / `TWILIO_EMAIL_FROM_NAME` | Twilio Email |
| `SMS_COUNTRY_CODE` | Default `+91` for 10-digit numbers |
| `SENDGRID_API_KEY` / `SENDGRID_FROM` | Optional email |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | SMTP fallback |
| `NODE_ENV` | `development` enables request logs |

Do not commit `.env` or paste Twilio/SendGrid secrets into chat or git.

## Deploying the frontend on Vercel

Vercel only hosts the **React app**. Login talks to Express on another host. `money-lending1.vercel.app` currently calls `http://localhost:5000/api`, which does not exist on the internet, so login fails.

1. Deploy the **backend** (Render, Railway, Fly.io, or similar) with `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, and:

```
CLIENT_URL=https://money-lending1.vercel.app,http://localhost:5173
```

Atlas Network Access must allow the backend host (`0.0.0.0/0` if you cannot add a static IP).

2. In the **Vercel** project → Settings → Environment Variables (Production):

```
VITE_API_URL=https://YOUR-BACKEND-HOST/api
```

Use `https`, no trailing slash except the `/api` path. Example: `https://lendloop-api.onrender.com/api`

3. **Redeploy** the frontend. Vite bakes `VITE_API_URL` in at **build** time. Changing the variable without a new deploy does nothing.

4. Confirm `https://YOUR-BACKEND-HOST/api/health` returns `{ "success": true }` in the browser.

Local `frontend/.env` stays `http://localhost:5000/api` for development only. Do not rely on that file for Vercel.

## Test users

```bash
cd backend
npm run seed:test-users
```

| Email | Password |
| --- | --- |
| `lender@test.com` | `Test@12345` |
| `borrower@test.com` | `Test@12345` |
