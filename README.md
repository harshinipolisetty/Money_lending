# Money Lending

A full-stack personal lending tracker for recording money lent to friends, requesting loans from other registered users, tracking repayments, and confirming payment with UPI QR codes.

This repository is the MERN implementation: an Express/MongoDB API with a React (Vite) frontend. The API contract matches the original Angular app.

## Features

- Register and login with JWT sessions stored in `localStorage`
- Manual lent/borrowed transactions with edit, delete, and friend filters
- Borrow requests between registered users, with linked transactions on accept
- Repayment requests that lenders approve or reject
- UPI QR codes generated from `upi://pay` payloads in INR

## Application screens

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create an account, optionally with UPI details |
| `/add` | Add a manual transaction |
| `/edit-transaction/:id` | Edit an owned transaction |
| `/transactions` | List, edit, and delete transactions |
| `/summary` | Show totals grouped by friend |
| `/borrow-request` | Search/select a lender and send a borrow request |
| `/lender-dashboard` | Review borrow requests, repayment approvals, lent money, and QR codes |
| `/borrower-dashboard` | Review borrow requests, borrowed money, repayments, and QR codes |
| `/profile` | Account information, statistics, quick actions, and logout |
| `/repayment-history` | Repayment requests where you are borrower or lender |

## Local development

1. Start MongoDB or create an accessible MongoDB Atlas database.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` and `JWT_SECRET`.
3. API:

```bash
cd backend
npm install
npm run dev
```

4. React app:

```bash
cd frontend
npm install
npm start
```

The frontend opens at `http://localhost:5173` and the API at `http://localhost:5000`.

## Test users

```bash
cd backend
npm run seed:test-users
```

| Email | Password |
| --- | --- |
| `lender@test.com` | `Test@12345` |
| `borrower@test.com` | `Test@12345` |
