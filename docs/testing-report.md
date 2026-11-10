# VENDORA Quality Assurance & Testing Report

**Project:** VENDORA – Multi-Vendor E-Commerce Marketplace  
**Internship Organization:** Nexvia Technologies  
**Date of Execution:** November 10, 2026  
**Test Framework:** Node.js Native Test Runner (`node:test`, `node:assert/strict`) & Vite Build Verification  
**Database Test Harness:** High-Speed Embedded MongoDB Test Engine  

---

## 1. Executive Test Summary

| Test Suite Category | Executed Tests | Passed | Failed | Execution Time |
| :--- | :---: | :---: | :---: | :---: |
| **Backend API & Data Logic** | 8 | 8 | 0 | 1,719 ms |
| **Frontend Production Build** | 1 (2,093 modules) | 1 | 0 | 2,250 ms |
| **Overall Status** | **9** | **9** | **0** | **100% PASS** |

---

## 2. Automated Test Results

The backend test suite (`backend/tests/api.test.js`) was executed against the database test instance.

```
> vendora-backend@1.0.0 test
> node --test tests/**/*.test.js

ℹ️  No MONGODB_URI provided. Initializing high-speed embedded MongoMemoryServer for development/testing...
✅ Embedded MongoMemoryServer active at: mongodb://127.0.0.1:61317/
📦 MongoDB Connected: 127.0.0.1
✔ 1. Authentication: Customer Registration & Password Hashing (1001.573084ms)
✔ 2. Multi-Vendor Onboarding & Admin Approval Workflow (137.736541ms)
✔ 3. Product Creation & Integer Paise Price Safety (8.509167ms)
✔ 4. Full-Text Search and Category Filtering (7.399625ms)
✔ 5. Multi-Vendor Shopping Cart & Coupon Application (5.133042ms)
✔ 6. Multi-Vendor Order Splitting & Exact Platform Commission Calculation (6.366875ms)
✔ 7. Payment Verification & Idempotency Protection (3.506333ms)
✔ 8. Verified Purchase Product Review (2.374459ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1719.464459
```

---

## 3. Test Cases & Verification Details

### 3.1 Authentication & Password Hashing
- **Objective:** Ensure plaintext passwords are never stored and bcrypt salt rounds (10) are applied.
- **Verification:** Verified `customer.password !== 'securePassword123'` and `await customer.matchPassword('securePassword123') === true`.
- **Status:** **PASS**

### 3.2 Multi-Vendor Onboarding & Admin Approval
- **Objective:** Verify new vendors register with `pending` status and can only sell products once upgraded to `approved` by an administrator.
- **Verification:** Vendor store registered with `status: 'pending'`, then transitioned to `approved` with custom commission rate `12%`.
- **Status:** **PASS**

### 3.3 Integer Paise Price Safety
- **Objective:** Prevent floating point math errors by storing currency in integer paise (₹2,499 = 249,900 paise).
- **Verification:** Created product with price 249,900 paise; confirmed precision is preserved without floating point drift.
- **Status:** **PASS**

### 3.4 Full-Text Search and Filtering
- **Objective:** Verify regex and full-text index matching against product titles and price ranges.
- **Verification:** Queried "Noise Cancelling" within price boundary ₹1,000 to ₹3,000; accurately retrieved matched product.
- **Status:** **PASS**

### 3.5 Shopping Cart & Promotional Coupon Application
- **Objective:** Validate multi-vendor cart item aggregation and coupon discount calculation.
- **Verification:** Added 2 units of ₹1,999 item (Subtotal: 399,800 paise); applied 10% coupon (`SAVE10`), resulting in exactly 39,980 paise discount.
- **Status:** **PASS**

### 3.6 Multi-Vendor Order Splitting & Platform Commission Calculation
- **Objective:** Verify master `Order` splits correctly into `VendorOrder` partitions and calculates vendor-specific commission deductions.
- **Input:**
  - Product Subtotal: 399,800 paise (₹3,998)
  - Vendor Commission Rate: 12%
- **Calculation:**
  $$\text{Commission Amount} = \lfloor \frac{399800 \times 12}{100} \rfloor = 47,976 \text{ paise (₹479.76)}$$
  $$\text{Vendor Earnings} = 399,800 - 47,976 = 351,824 \text{ paise (₹3,518.24)}$$
- **Verification:** Verified `vendorOrder.commissionAmount + vendorOrder.vendorEarnings === vendorOrder.subtotal`. Both numbers verified exact to the single paise.
- **Status:** **PASS**

### 3.7 Payment Verification & Idempotency Protection
- **Objective:** Prevent duplicate payment captures using unique `idempotencyKey`.
- **Verification:** Simulated capturing payment with key `IDEMP_KEY_VEN_9001_1`; confirmed second call returns existing payment record rather than inserting a duplicate.
- **Status:** **PASS**

### 3.8 Verified Purchase Product Review
- **Objective:** Ensure reviews link to verified customer orders and update product aggregate rating.
- **Status:** **PASS**

---

## 4. Frontend Compilation & Bundle Verification

- **Command:** `npm run build` (Vite 6.4.6, React 18.3.1, Tailwind CSS)
- **Output:**
  - `dist/index.html`: 0.83 kB
  - `dist/assets/index.css`: 36.50 kB (gzip: 6.75 kB)
  - `dist/assets/index.js`: 839.42 kB (gzip: 226.60 kB)
- **Result:** Successfully compiled 2,093 modules in 2.25 seconds with 0 syntax or runtime errors.
