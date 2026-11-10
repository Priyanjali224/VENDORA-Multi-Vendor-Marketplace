# VENDORA: 10-Minute Internship Capstone Presentation

**Presenter:** Full-Stack Software Engineering Intern  
**Company:** Nexvia Technologies  
**Project:** VENDORA – Multi-Vendor E-Commerce Marketplace  
**Tagline:** One Marketplace. Multiple Vendors. Endless Possibilities.  

---

## Slide 1: Title & Executive Summary
- **Project Name:** VENDORA
- **Objective:** Design, architect, develop, and test an Amazon/Shopify-style multi-vendor e-commerce platform that connects independent merchants with consumers through a single unified checkout, decimal-safe commission deductions, and role-based access control.
- **Roles Implemented:** Customer, Vendor, Platform Administrator.

---

## Slide 2: Problem Statement & Industry Context
- **Traditional E-Commerce Limitations:** Single-merchant stores face inventory limits, fragmented checkout experiences, and high customer acquisition costs.
- **Multi-Vendor Complexities:**
  - One customer shopping cart containing items from multiple distinct sellers.
  - Ensuring sellers only access their own orders, inventory, and financial balances.
  - Transparent, decimal-safe commission splits and fraud-proof payment verification.
  - Preventing overselling during concurrent checkouts.

---

## Slide 3: Technology Stack & Architectural Decision
- **Frontend:**
  - React 18, React Router v6, Tailwind CSS
  - Lucide React (accessible icon suite)
  - Recharts (interactive dashboard telemetry & monthly trends)
  - Axios (JWT interceptors & automatic session invalidation)
- **Backend:**
  - Node.js & Express.js (Layered Service-Oriented REST architecture)
  - JWT Authentication & bcryptjs password hashing
  - Helmet security headers, rate limiting, and CORS enforcement
- **Database & Persistence:**
  - MongoDB & Mongoose (14 normalized/referenced schemas)
- **Advanced Integrations & Fallback Adapters:**
  - In-Memory & Redis Cache Adapter (Cart, product search cache, TTL invalidation)
  - Elasticsearch & MongoDB Text Search Adapter
  - AWS S3 & Disk Media Storage Adapter
  - PDFKit Invoice Generation Engine (Dynamic tax invoices)
  - Razorpay & Stripe Test Mode Payment Adapter with HMAC-SHA256 signature verification

---

## Slide 4: System Architecture & Order Splitting Engine
- **Three-Tier Architecture:** Client SPA $\leftrightarrow$ Express API Gateway $\leftrightarrow$ Services & Integration Adapters $\leftrightarrow$ MongoDB / Cache / Storage.
- **The Split-Order Workflow:**
  1. Customer checks out cart with items from Vendors $A$ and $B$.
  2. Gateway creates master parent `Order` (`VEN-XXXXXX-XXXX`).
  3. System splits items into independent sub-orders (`VendorOrder A` and `VendorOrder B`).
  4. Platform commission is calculated in integer paise:
     $$\text{Commission} = \lfloor \frac{\text{Subtotal} \times \text{Rate}}{100} \rfloor$$
     $$\text{Vendor Earnings} = \text{Subtotal} - \text{Commission}$$
  5. Both Vendor $A$ and Vendor $B$ independently manage packing, shipping, and delivery status.

---

## Slide 5: Database Schema Design (14 Models)
- **User:** Role-based identity (`customer`, `vendor`, `admin`), hashed credentials.
- **Vendor:** Store profile, approval state (`pending`, `approved`, `suspended`), custom commission %.
- **Product & Inventory:** Multi-vendor SKU, pricing in paise, low-stock threshold triggers.
- **Cart & Wishlist:** Multi-vendor cart cache with coupon application.
- **Order & VendorOrder:** Parent-child relationship enabling isolated seller fulfillment.
- **Payment & Commission:** Immutable financial transaction and platform fee ledger.
- **Coupon, Review & Notification:** Promotional campaigns, verified buyer reviews, and in-app alerts.

---

## Slide 6: Customer Experience & Feature Highlights
- Live full-text search with regex and index matching.
- Multi-faceted filters (Category, Price Range, Ratings 4+ Stars, Sort by Price/Popularity).
- Product Detail Page with image gallery, seller profile, stock indicator, and verified customer reviews.
- Multi-vendor cart grouping by vendor.
- Promotional coupon engine (`VENDORA10`, `FESTIVE500`).
- Downloadable PDF tax invoices with GST breakdown.
- Visual milestone order tracking (`PLACED` -> `CONFIRMED` -> `PACKED` -> `SHIPPED` -> `DELIVERED`).

---

## Slide 7: Vendor Management Portal
- Merchant store onboarding and admin approval lifecycle.
- Product CRUD with SKU management and image uploads.
- Real-time stock monitor and low-stock warnings.
- Incoming sub-orders list with status updates.
- Real-time analytics with Recharts monthly revenue graphs.
- Payout bank coordinate management and commission deductions summary.

---

## Slide 8: Administrator Governance & Platform Analytics
- Platform-wide GMV revenue and net commission metrics.
- Vendor application audit (Approve, Reject, Suspend, modify commission %).
- Consumer account management (Deactivate/Reactivate).
- Coupon code creator with minimum order constraints and usage caps.
- Complete financial commission audit trail.

---

## Slide 9: Security & Quality Assurance
- **Security:**
  - Bcrypt password hashing (salt rounds = 10).
  - Role-based middleware (`protect`, `authorize`, `ensureApprovedVendor`).
  - Integer paise calculations to eliminate IEEE 754 floating point rounding bugs.
  - Payment signature validation and idempotency keys to stop duplicate charges.
- **Quality Assurance:**
  - 8 automated backend test suites covering all critical business paths.
  - 100% test pass rate in 1.7 seconds.
  - Zero-error frontend production build (2,093 modules compiled in 2.25s).

---

## Slide 10: Reflection, Results & Future Roadmap
- **Key Results:**
  - Portfolio-quality, fully functioning multi-vendor marketplace.
  - Fully tested order splitting, commission calculation, and PDF generation.
  - 100% adherence to Nexvia Technologies internship deliverables.
- **Future Enhancements:**
  - Automated payout transfers via RazorpayX Route / Stripe Connect Custom Accounts.
  - Multi-currency conversions for international cross-border trade.
  - Progressive Web App (PWA) offline product browsing.
