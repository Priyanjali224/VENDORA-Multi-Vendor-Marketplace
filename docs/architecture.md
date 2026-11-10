# VENDORA System Architecture & Technical Specifications

**Project Name:** VENDORA  
**Tagline:** One Marketplace. Multiple Vendors. Endless Possibilities.  
**Role Scope:** Customer, Vendor, Platform Administrator  
**Internship Organization:** Nexvia Technologies  

---

## 1. High-Level Architecture Overview

VENDORA is designed following a modular Service-Oriented / Layered Monolith pattern with clear boundary separation between the presentation tier (React Single Page Application), business application tier (Node.js & Express REST APIs), and data persistence / caching tiers (MongoDB, Redis, Elasticsearch, AWS S3 / Local storage adapter).

```
                      +---------------------------------------+
                      |          Client Web Browsers          |
                      |  - Customer Portal                    |
                      |  - Vendor Management Portal           |
                      |  - Administrator Console              |
                      +-------------------+-------------------+
                                          |
                                          | HTTPS / REST / JSON
                                          v
                      +---------------------------------------+
                      |          Express.js Gateway           |
                      |  - Helmet & CORS Security Headers     |
                      |  - Global Rate Limiting               |
                      |  - JWT Role-based Authentication      |
                      |  - Request Validation Middleware      |
                      +-------------------+-------------------+
                                          |
            +-----------------------------+-----------------------------+
            |                             |                             |
            v                             v                             v
  +--------------------+        +--------------------+        +--------------------+
  |  Customer Service  |        |   Vendor Service   |        |   Admin Service    |
  |  - Cart & Wishlist |        |  - Store Profile   |        |  - Vendor Approval |
  |  - Checkout & Pay  |        |  - Product Catalog |        |  - Category Mgmt   |
  |  - Order Tracking  |        |  - Inventory & SKU |        |  - Platform Stats  |
  |  - Reviews & Stars |        |  - Split Payouts   |        |  - Commission Mgmt |
  +---------+----------+        +---------+----------+        +---------+----------+
            |                             |                             |
            +-----------------------------+-----------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Integration Adapters          |
                      |  - Cache Adapter (Redis + In-Memory)  |
                      |  - Search Adapter (Elasticsearch + DB)|
                      |  - Media Adapter (AWS S3 + Local Disk)|
                      |  - Payment Adapter (Razorpay/Stripe)  |
                      |  - Invoice Engine (PDFKit Generator)  |
                      +-------------------+-------------------+
                                          |
          +---------------+---------------+---------------+---------------+
          |               |                               |               |
          v               v                               v               v
    +-----------+   +-----------+                   +-----------+   +-----------+
    |  MongoDB  |   |   Redis   |                   | Elastic-  |   |  AWS S3 / |
    | (Primary) |   | (Cache)   |                   |  search   |   |  Storage  |
    +-----------+   +-----------+                   +-----------+   +-----------+
```

---

## 2. Authentication & Authorization Matrix

| Route Group | Customer | Vendor (Pending) | Vendor (Approved) | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| `/api/auth/register`, `/login` | Public | Public | Public | Public |
| `/api/customer/*` | Granted | Granted | Granted | Granted |
| `/api/vendor/profile/onboarding` | Denied | Granted | Granted | Granted |
| `/api/vendor/products` (CRUD) | Denied | Denied | Granted | Granted |
| `/api/vendor/orders` (View & Status) | Denied | Denied | Granted | Granted |
| `/api/vendor/earnings` | Denied | Denied | Granted | Granted |
| `/api/admin/*` | Denied | Denied | Denied | Granted |

---

## 3. Multi-Vendor Order Splitting & Commission Workflow

1. **Customer Checkout:** The customer places an order containing items from multiple distinct vendors ($V_1, V_2, \dots, V_k$).
2. **Parent Order Creation:** A master `Order` record is created storing customer address, payment state, and total aggregate breakdown.
3. **VendorOrder Partitioning:** For each unique vendor $V_i$, an independent `VendorOrder` is created containing only their items.
4. **Commission Math (Integer Safe):**
   - Item Subtotal: $S = \sum (\text{item.price} \times \text{item.quantity})$
   - Commission Rate: $C_{\%} = \text{vendor.commissionRate} \lor \text{platformDefault} \text{ (e.g. 10\%)}$
   - Commission Amount: $A_{\text{comm}} = \lfloor \frac{S \times C_{\%}}{100} \rfloor$
   - Vendor Earnings: $E_{\text{vendor}} = S - A_{\text{comm}}$
5. **Inventory Decrement:** Atomic stock decrements execute to prevent race conditions or overselling.
6. **Delivery & Status Synchronization:** Each vendor updates their own `VendorOrder` through statuses `PLACED` -> `CONFIRMED` -> `PACKED` -> `SHIPPED` -> `DELIVERED`. The master order reflects unified state once all sub-orders reach delivery.
