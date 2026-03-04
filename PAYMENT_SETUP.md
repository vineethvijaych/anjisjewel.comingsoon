# ══════════════════════════════════════════════
#  AnjisJewel — REAL PAYMENT SETUP GUIDE
#  (Razorpay + Supabase Edge Functions)
# ══════════════════════════════════════════════

## THE HONEST ANSWER
The previous payment was 100% fake — it just waited 2 seconds and
wrote "paid" to the database. No real money moved at all.

This guide sets up REAL payments using Razorpay, which is:
- Free to sign up
- Supports UPI, cards, net banking, wallets, EMI
- Charges 2% per transaction (no monthly fees)
- Settles money to YOUR bank account in T+2 days
- PCI-DSS certified (they handle card security, not you)

---

## PART 1 — RAZORPAY ACCOUNT SETUP

### Step 1.1 — Create Razorpay Account
1. Go to https://dashboard.razorpay.com/signup
2. Sign up with your email

### Step 1.2 — Complete KYC (to receive real money)
Dashboard → Account & Settings → KYC Details
You need:
  - Business PAN card
  - Bank account details (where money will be received):
      * Account holder name
      * Account number
      * IFSC code
  - Business address proof
  - GST number (if applicable)

KYC approval takes 1–3 working days.

### Step 1.3 — Get API Keys
Dashboard → Settings → API Keys → Generate Test Key

You get two keys:
  - Key ID:     rzp_test_xxxxxxxxxxxx   ← goes in your frontend code
  - Key Secret: xxxxxxxxxxxxxxxxxxxxxxx  ← NEVER in frontend, goes in Supabase secrets

For production: generate LIVE keys after KYC approval.

---

## PART 2 — UPDATE YOUR CODE

### Step 2.1 — Add your Key ID to PaymentModal.jsx

Open: src/components/PaymentModal.jsx
Line 8 — replace with your actual Key ID:

  const RAZORPAY_KEY_ID = "rzp_test_REPLACE_WITH_YOUR_KEY_ID";
                                        ↑ paste your Key ID here

---

## PART 3 — SUPABASE EDGE FUNCTIONS

The app uses two Edge Functions (server-side Deno functions on Supabase):
  - create-order   → creates a Razorpay order using your secret key
  - verify-payment → verifies the payment is genuine, then saves to DB

### Step 3.1 — Install Supabase CLI
npm install -g supabase

### Step 3.2 — Login & Link Project
supabase login
supabase link --project-ref gbhedrawnqyqmlerisfd

### Step 3.3 — Set Secret Environment Variables
These are stored encrypted in Supabase — never exposed to users:

supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxx

(Get these from Razorpay Dashboard → Settings → API Keys)

### Step 3.4 — Deploy the Edge Functions
supabase functions deploy create-order
supabase functions deploy verify-payment

### Step 3.5 — Verify deployment
supabase functions list
# Should show: create-order, verify-payment with status ACTIVE

---

## PART 4 — SUPABASE DATABASE UPDATE

Run this SQL in Supabase Dashboard → SQL Editor
(This adds Razorpay fields to the orders table):

-- Drop and recreate orders table with Razorpay fields
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id             TEXT        NOT NULL UNIQUE,
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  items                TEXT        NOT NULL DEFAULT '[]',
  subtotal             NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst                  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total                NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method       TEXT        NOT NULL DEFAULT 'razorpay',
  status               TEXT        NOT NULL DEFAULT 'pending',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

---

## PART 5 — TEST PAYMENTS (Test Mode)

In TEST mode, use these Razorpay test credentials:

  Card Number:  4111 1111 1111 1111
  Expiry:       Any future date (e.g. 12/29)
  CVV:          Any 3 digits (e.g. 123)
  Name:         Any name
  OTP:          1234 (for 3D secure prompt)

  UPI Test ID:  success@razorpay   (always succeeds)
                failure@razorpay   (always fails — useful for testing)

No real money is charged in test mode.

---

## PART 6 — GO LIVE CHECKLIST

Before switching to live keys:
  [ ] KYC approved in Razorpay dashboard
  [ ] Bank account added and verified
  [ ] Tested all payment methods in test mode
  [ ] Replace rzp_test_ keys with rzp_live_ keys:
        - In PaymentModal.jsx: update RAZORPAY_KEY_ID
        - In Supabase secrets: update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
  [ ] Set Razorpay webhook URL (optional but recommended):
        Dashboard → Webhooks → Add URL:
        https://gbhedrawnqyqmlerisfd.supabase.co/functions/v1/verify-payment

---

## MONEY FLOW DIAGRAM

  Customer pays ₹10,000
       ↓
  Razorpay processes payment
       ↓
  Razorpay takes 2% = ₹200 (their fee)
       ↓
  ₹9,800 settles to YOUR bank account in T+2 working days

---

## QUICK REFERENCE — KEY FILES

  PaymentModal.jsx                    ← Opens Razorpay popup, handles response
  supabase/functions/create-order/    ← Creates Razorpay order (server-side)
  supabase/functions/verify-payment/  ← Verifies payment + saves order (server-side)
  pages/Orders.jsx                    ← Shows order history
  pages/Success.jsx                   ← Confirmation page after payment

