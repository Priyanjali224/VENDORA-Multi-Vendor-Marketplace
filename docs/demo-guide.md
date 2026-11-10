# VENDORA Demonstration & Screen Recording Plan

This guide outlines the walkthrough script and execution steps for a 10-minute live demonstration or screen recording of the VENDORA Multi-Vendor Marketplace.

---

## 1. Quick Local Start (Under 60 Seconds)

### Step 1: Start Backend API
Open a terminal in the project root:
```bash
cd backend
npm start
```
*The server will start on `http://localhost:5000` and automatically seed initial data (Admin, 3 Vendors, 2 Customers, Categories, Products, and Coupons).*

### Step 2: Start Frontend Application
Open a second terminal:
```bash
cd frontend
npm run dev
```
*The React SPA will launch on `http://localhost:5173`.*

---

## 2. Screen Recording Demonstration Timeline (10 Minutes)

### Part 1: Marketplace Overview & Customer Experience (Minutes 0:00 - 3:30)
1. **Homepage:** Show hero banner, top category cards, trending multi-vendor products, and value propositions.
2. **Catalog Browsing & Search:**
   - Demonstrate full-text search with live keyword filtering.
   - Filter by Category (e.g. *Electronics*), adjust price range, and filter by rating (4+ Stars).
   - Change sorting (Price Low to High).
3. **Product Detail Page:**
   - Open *Acoustic Pro Wireless Studio Headphones*.
   - View high-res gallery, SKU, stock count, and verified vendor store card (*Apex Audio & Electronics*).
   - Review technical specifications table and verified buyer reviews.
   - Click **Add to Cart**.
4. **Multi-Vendor Cart Aggregation:**
   - Navigate back and add a second item from another vendor (e.g. *Urban Tailored Minimalist Wool Overcoat* from *Urban Luxe Fashion*).
   - Go to Cart: show items grouped clearly under their respective vendor headers.
   - Apply coupon `VENDORA10` and observe instant 10% subtotal discount.

### Part 2: Multi-Vendor Checkout, Split Orders & PDF Invoice (Minutes 3:30 - 5:30)
1. **Checkout Flow:**
   - Click **Proceed to Checkout**.
   - Review auto-filled shipping address.
   - Select **Razorpay (Test Mode)** and click **Complete Payment**.
2. **Order Confirmation & PDF Generation:**
   - Observe instant redirect to confirmation screen with order number (`VEN-XXXXXX-XXXX`).
   - Click **Download PDF Invoice** and open the generated PDF invoice showing:
     - Invoice number and GST calculation (18%).
     - Itemized vendor breakdown.
     - Final balance and customer shipping address.
3. **Live Order Tracking:**
   - Click **Live Tracking** to view visual status timeline (`PLACED` -> `CONFIRMED` -> `PACKED` -> `SHIPPED` -> `DELIVERED`).

### Part 3: Vendor Portal & Fulfillment Workflow (Minutes 5:30 - 7:30)
1. **Switch to Vendor:**
   - Log out or use demo login: `apex@vendora.com` / `vendorPassword123`.
   - Access **Vendor Portal**.
2. **Vendor Dashboard:**
   - Display GMV Sales, Net Vendor Earnings (after 10% commission deduction), and monthly sales trend on Recharts.
   - Show Low-Stock inventory alerts.
3. **Fulfillment Action:**
   - Open **Customer Orders**: observe sub-order assigned to this vendor.
   - Update status from `CONFIRMED` to `PACKED` and then `SHIPPED`.
4. **Inventory Management & Product CRUD:**
   - Go to **Inventory & Stock**: restock units using the quick restock tool.
   - Open **Add Product**: show SKU generator, price in INR, image uploader, and technical specification field builder.

### Part 4: Administrator Governance & Commission Ledger (Minutes 7:30 - 9:30)
1. **Switch to Admin:**
   - Log in as Platform Administrator: `admin@vendora.com` / `adminPassword123`.
   - Navigate to `/admin/dashboard`.
2. **Platform Metrics:**
   - Show aggregate marketplace GMV revenue and platform commission earnings.
   - Recharts dual graphs comparing Gross Volume vs. Net Platform Fees.
3. **Vendor Approval Workflow:**
   - Navigate to **Vendors & Approvals**.
   - Locate pending vendor (*Swift Tech Gadgets*).
   - Click **Approve** and configure custom commission rate (e.g. 10%).
4. **Commission Audit Ledger:**
   - Navigate to **Commission Ledger**: inspect exact transaction splits showing Gross Subtotal, Platform Commission, and Net Vendor Entitlement.
5. **Coupons Management:**
   - Open **Promotions & Coupons**: view existing coupons and create a new promotional code with usage caps.

### Part 5: Conclusion & Reflection (Minutes 9:30 - 10:00)
- Summarize architecture, test suite results (100% pass), and internship takeaways.
