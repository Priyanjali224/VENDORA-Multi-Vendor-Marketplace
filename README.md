# VENDORA – Multi-Vendor E-Commerce Marketplace

> **Tagline:** One Marketplace. Multiple Vendors. Endless Possibilities.  
> **Internship Capstone Project:** Nexvia Technologies Full-Stack Development Internship  
> **Engineered By:** Full-Stack Software Engineering Intern

---

## 🌟 Overview

**VENDORA** is a portfolio-grade, production-ready multi-vendor e-commerce marketplace built on modern full-stack web technologies. It empowers multiple independent merchants to establish storefronts, manage products and inventory, track fulfillments, and review earnings, while allowing customers to seamlessly purchase products from different vendors in a single unified checkout.

Platform administrators maintain total governance over vendor onboarding, product catalogs, customer accounts, commission policies, and financial ledgers.

---

## 🚀 Key Features

### 🛍️ Customer Portal
- **Catalog & Search:** Full-text search with regex and index matching, multi-faceted filtering (Category, Price Range, Ratings 4+ Stars), and sorting (Price, Newest, Popularity).
- **Product Experience:** Multi-image gallery, vendor store info, real-time stock indicator, technical specifications table, and verified customer reviews.
- **Unified Multi-Vendor Cart:** Add items from multiple independent merchants into one shopping cart with automatic vendor grouping.
- **Discounts & Coupons:** Real-time promotional coupon engine (`VENDORA10`, `FESTIVE500`).
- **Checkout & Test Payments:** Integrated test payment workflow (Razorpay & Stripe simulation) with HMAC-SHA256 signature verification.
- **Order Management & Invoices:** Visual milestone order tracking (`PLACED` -> `CONFIRMED` -> `PACKED` -> `SHIPPED` -> `DELIVERED`), cancellation of eligible orders, and downloadable PDF tax invoices with GST breakdown.

### 🏪 Vendor Management Portal
- **Store Onboarding:** Register store and submit business profile for administrator review.
- **Product Management:** Full CRUD operations with auto-generated SKUs, image uploads, price in integer paise, and technical specification builders.
- **Inventory & Stock Monitor:** Real-time stock counts with automated low-stock warnings and quick restock actions.
- **Fulfillment Management:** View only sub-orders assigned to the vendor, update fulfillment states (`PLACED` -> `CONFIRMED` -> `PACKED` -> `SHIPPED` -> `DELIVERED`).
- **Earnings & Commission Telemetry:** Financial transparency showing Gross Sales, Platform Commission Deductions (10-12%), Net Vendor Earnings, and Recharts monthly revenue graphs.

### 👑 Administrator Console
- **Executive Metrics:** Aggregate platform GMV revenue, platform commission earnings, total orders, customers, and active vendors.
- **Vendor Governance:** Review pending store applications; Approve, Reject, or Suspend vendors; configure custom commission rates.
- **Customer Control:** Audit consumer accounts with active/deactivation toggles.
- **Marketplace Orders Audit:** Inspect all marketplace checkout transactions across all merchant stores.
- **Promotional Coupons:** Create promo codes with percentage or flat discounts, usage caps, and validity dates.
- **Financial Commission Audit:** Detailed accounting ledger of every platform commission deduction per vendor order.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Tailwind CSS, Lucide React, Recharts, Axios, Vite |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, Helmet, CORS, Multer, PDFKit |
| **Database** | MongoDB, Mongoose (14 normalized/referenced schemas) |
| **Adapters & Fallbacks** | In-Memory / Redis Cache, MongoDB Full-Text / Elasticsearch Search, Local / AWS S3 Storage |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`), Vite Build Engine |

---

## 📁 Monorepo Structure

```
VENDORA/
├── frontend/                     # React 18 Single Page Application
│   ├── src/
│   │   ├── components/           # Common, Customer, Vendor, and Admin UI components
│   │   ├── context/              # AuthContext and CartContext state providers
│   │   ├── layouts/              # MainLayout, VendorLayout, AdminLayout
│   │   ├── pages/                # Customer, Vendor, Admin, and Auth pages
│   │   ├── services/             # Axios API client with JWT interceptors
│   │   ├── utils/                # Formatters (currency, dates, status badges)
│   │   ├── App.jsx               # Client routes configuration
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/                      # Node.js & Express REST API Server
│   ├── config/                   # MongoDB connection with embedded fallback
│   ├── controllers/              # Auth, Vendor, Product, Cart, Order, Review, Admin
│   ├── middleware/               # Auth, Roles, ErrorHandler, Multer Upload
│   ├── models/                   # 14 MongoDB Mongoose Schemas
│   ├── routes/                   # REST API route endpoints
│   ├── services/                 # Cache, Search, Storage, Payment, Invoice services
│   ├── tests/                    # Automated integration test suite
│   ├── utils/                    # Data seeder with realistic catalogs
│   ├── server.js                 # Express server entry point
│   └── package.json
│
├── docs/                         # Comprehensive Internship Deliverables
│   ├── architecture.md           # High-level architecture & diagrams
│   ├── database-schema.md        # Database schema specifications (14 models)
│   ├── api-documentation.md      # Full REST API endpoints & payloads
│   ├── testing-report.md         # Actual test execution results (100% pass)
│   ├── demo-guide.md             # 10-Minute live demo & recording script
│   ├── deployment-guide.md       # Manual production deployment guide
│   ├── presentation.md           # 10-Minute slide presentation content
│   └── project-reflection.md     # Personal learning reflection template
│
├── .gitignore
├── docker-compose.yml            # Docker services for Mongo, Redis, Elasticsearch
└── README.md
```

---

## ⚡ Quick Start Guide (Local Development)

### Prerequisites
- Node.js (v18+) & npm

### 1. Clone & Setup Workspace
```bash
cd VENDORA
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
*The server will start on `http://localhost:5000` and automatically seed realistic demo data on first launch.*

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The React app will launch at `http://localhost:5173`.*

---

## 👥 Default Demo Accounts

For testing all three user roles, the database includes pre-configured credentials:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **👑 Platform Admin** | `admin@vendora.com` | `adminPassword123` | Full access to Admin Console & Stats |
| **🏪 Approved Vendor** | `apex@vendora.com` | `vendorPassword123` | Apex Audio & Electronics (10% commission) |
| **🏪 Approved Vendor** | `luxe@vendora.com` | `vendorPassword123` | Urban Luxe Fashion (12% commission) |
| **🏪 Approved Vendor** | `eco@vendora.com` | `vendorPassword123` | EcoLiving Essentials (8% commission) |
| **⏳ Pending Vendor** | `swift@vendora.com` | `vendorPassword123` | Swift Tech (For testing admin approval) |
| **🛍️ Customer** | `customer@vendora.com` | `customerPassword123` | Priya Sharma (Order history & reviews) |

*You can also click any of the 1-Click quick login buttons on the `/login` screen.*

---

## 🧪 Running Automated Tests

Run the backend integration test suite:
```bash
cd backend
npm test
```
**Results:** 8 tests passed, 0 failed, 100% success rate in under 2 seconds.

Test frontend production compilation:
```bash
cd frontend
npm run build
```
**Results:** Compiled 2,093 modules in 2.25 seconds with 0 errors.

---

## 📄 License & Attribution

Developed as an Internship Capstone Project for **Nexvia Technologies**.  
All rights reserved © 2026.
