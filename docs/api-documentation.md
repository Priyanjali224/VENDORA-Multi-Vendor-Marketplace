# VENDORA REST API Documentation

Base URL: `http://localhost:5000/api` (Development)

All request bodies and responses are formatted as JSON (`Content-Type: application/json`). Authenticated endpoints require a Bearer token in the `Authorization` header: `Authorization: Bearer <JWT_TOKEN>`.

Financial figures are integer-safe in Indian Paise (₹100 = 10,000 paise).

---

## 1. Authentication Endpoints

### 1.1 Customer Registration
- **Method:** `POST`
- **Route:** `/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Priya Sharma",
  "email": "customer@vendora.com",
  "password": "customerPassword123",
  "phone": "+91 98765 11111"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6732f...",
    "name": "Priya Sharma",
    "email": "customer@vendora.com",
    "role": "customer"
  },
  "message": "Customer account created successfully."
}
```

### 1.2 Vendor Registration & Store Application
- **Method:** `POST`
- **Route:** `/auth/register-vendor`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Vikram Mehta",
  "email": "apex@vendora.com",
  "password": "vendorPassword123",
  "phone": "+91 98765 33333",
  "storeName": "Apex Audio & Electronics",
  "description": "Premium acoustic studio gear and headphones."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "Vikram Mehta", "role": "vendor" },
  "vendor": {
    "id": "...",
    "storeName": "Apex Audio & Electronics",
    "slug": "apex-audio-electronics",
    "status": "pending"
  },
  "message": "Vendor registered successfully. Your store application is pending administrator approval."
}
```

### 1.3 User Authentication (Login)
- **Method:** `POST`
- **Route:** `/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "admin@vendora.com",
  "password": "adminPassword123"
}
```
- **Response (200 OK):** Returns JWT token, user object, and associated vendor profile if role is `vendor`.

### 1.4 Get Profile
- **Method:** `GET`
- **Route:** `/auth/me`
- **Access:** Protected (`customer`, `vendor`, `admin`)

---

## 2. Product & Catalog Endpoints

### 2.1 Search & Filter Products
- **Method:** `GET`
- **Route:** `/products`
- **Access:** Public
- **Query Parameters:**
  - `search` / `q`: Full-text search term
  - `category`: Category slug (e.g., `electronics`, `fashion`)
  - `minPrice`: Minimum price in paise
  - `maxPrice`: Maximum price in paise
  - `rating`: Minimum average rating filter (e.g., `4`)
  - `sort`: `newest`, `price_asc`, `price_desc`, `rating`, `popular`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)
- **Response (200 OK):**
```json
{
  "success": true,
  "products": [...],
  "pagination": { "total": 24, "page": 1, "limit": 12, "pages": 2 },
  "source": "mongodb",
  "fromCache": false
}
```

### 2.2 Get Product Details
- **Method:** `GET`
- **Route:** `/products/:slug`
- **Access:** Public
- **Response:** Returns product object, vendor store profile, verified reviews array, and related products in same category.

### 2.3 Upload Media Image
- **Method:** `POST`
- **Route:** `/upload`
- **Access:** Protected (Vendor / Admin)
- **Payload:** `multipart/form-data` with field `image`
- **Response:** `{ "success": true, "url": "/uploads/image-1731...webp" }`

---

## 3. Shopping Cart Endpoints

### 3.1 Get Cart
- **Method:** `GET`
- **Route:** `/cart`
- **Access:** Protected (`customer`)
- **Response (200 OK):**
```json
{
  "success": true,
  "cart": {
    "items": [...],
    "subtotal": 2399800,
    "discount": 239980,
    "tax": 388768,
    "deliveryFee": 0,
    "totalAmount": 2548588,
    "couponApplied": { "code": "VENDORA10", "discountAmount": 239980 }
  }
}
```

### 3.2 Add / Update / Remove Cart Items
- `POST /cart/items` `{ "productId": "...", "quantity": 1 }`
- `PUT /cart/items/:productId` `{ "quantity": 3 }`
- `DELETE /cart/items/:productId`
- `POST /cart/apply-coupon` `{ "code": "VENDORA10" }`

---

## 4. Multi-Vendor Order & Checkout Endpoints

### 4.1 Multi-Vendor Checkout
- **Method:** `POST`
- **Route:** `/orders/checkout`
- **Access:** Protected (`customer`)
- **Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "Priya Sharma",
    "phone": "+91 98765 11111",
    "addressLine1": "Flat 402, Lotus Heights",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400076",
    "country": "India"
  },
  "paymentMethod": "razorpay"
}
```
- **Execution Mechanism:**
  1. Validates stock availability.
  2. Creates master parent `Order` (`VEN-XXXXXX-XXXX`).
  3. Partitions items by `vendor` and generates isolated `VendorOrder` sub-orders.
  4. Calculates integer-safe platform commissions ($C = \lfloor \frac{\text{subtotal} \times \text{rate}}{100} \rfloor$).
  5. Creates ledger entries in `Commission` collection.
  6. Atomically decrements product inventory.
  7. Clears user cart.
- **Response (201 Created):** Returns created parent `Order` and gateway payload.

### 4.2 Verify Payment Signature
- **Method:** `POST`
- **Route:** `/orders/:id/verify-payment`
- **Access:** Protected (`customer`)
- **Request Body:**
```json
{
  "providerOrderId": "order_mock_123",
  "providerPaymentId": "pay_mock_456",
  "providerSignature": "sig_mock_789"
}
```
- **Response:** Verifies signature, logs `Payment` transaction with idempotency protection, sets order paymentStatus to `paid`, and orderStatus to `CONFIRMED`.

### 4.3 Download PDF Invoice
- **Method:** `GET`
- **Route:** `/orders/:id/invoice`
- **Access:** Protected (`customer`, `admin`)
- **Response:** PDF stream with header `Content-Disposition: attachment; filename=invoice-VEN-XXXX.pdf`.

---

## 5. Vendor Dashboard Endpoints

- `GET /vendor/profile`: Store profile and current approval status.
- `PUT /vendor/profile`: Edit store name, description, logo, banner, and bank account for payouts.
- `GET /vendor/products`: Vendor's product catalog.
- `POST /vendor/products`: Create new product and inventory record.
- `PUT /vendor/products/:id`: Edit product details or restock quantity.
- `DELETE /vendor/products/:id`: Remove product and inventory record.
- `GET /vendor/inventory`: Real-time stock monitor and low-stock alerts.
- `GET /vendor/orders`: Incoming vendor sub-orders.
- `PUT /vendor/orders/:id/status`: Transition order status (`PLACED` -> `CONFIRMED` -> `PACKED` -> `SHIPPED` -> `DELIVERED`).
- `GET /vendor/analytics`: Gross sales, net vendor earnings, platform commission deductions, and monthly sales trend.

---

## 6. Administrator Console Endpoints

- `GET /admin/dashboard-stats`: Aggregate platform GMV revenue, platform commissions collected, total orders, customers, and merchants.
- `GET /admin/vendors`: Searchable table of all vendor applications with status filter.
- `PUT /admin/vendors/:id/status`: Approve, reject, or suspend vendor; update custom commission percentage.
- `GET /admin/customers`: Customer directory with search.
- `PUT /admin/customers/:id/toggle-active`: Activate or deactivate consumer accounts.
- `GET /admin/orders`: Platform-wide transaction list with merchant breakdown.
- `GET /admin/coupons` & `POST /admin/coupons`: Create and manage promotional discount codes.
- `GET /admin/commissions`: Audit ledger of all platform commission deductions.
