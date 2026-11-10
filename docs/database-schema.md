# VENDORA Database Schema Specifications

Comprehensive MongoDB / Mongoose schema specification for VENDORA Multi-Vendor Marketplace.

---

## Model Index (14 Core Schemas)

1. **User**: Authentication, roles (`customer`, `vendor`, `admin`), personal profile and timestamps.
2. **Vendor**: Store profile, logo, banner, business license/tax identifier, verification status (`pending`, `approved`, `rejected`, `suspended`), custom commission rate, payout bank account details.
3. **Category**: Hierarchical product taxonomy, slug, banner image, isActive status.
4. **Product**: Multi-vendor product catalog, SKU, titles, descriptions, pricing (regular & discount in integer paise), stock, vendor reference, category reference, images array, rating cache, timestamps.
5. **Inventory**: Real-time inventory tracking, low-stock threshold alerting, safety stock reservations.
6. **Cart**: Multi-vendor shopping cart with item quantity, selected variant/options, and cache synchronization.
7. **Wishlist**: Customer saved favorite items reference collection.
8. **Order**: Master parent customer order containing checkout total, tax, shipping, coupon applied, overall status (`PLACED`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`), shipping address, customer reference.
9. **VendorOrder**: Vendor-partitioned sub-order mapping directly to items supplied by that vendor, individual fulfillment tracking, commission breakdown, and delivery timestamps.
10. **Payment**: Payment transaction lifecycle records (Razorpay/Stripe order ID, payment ID, signature, method, currency, status `pending`, `success`, `failed`, `refunded`, amount in paise).
11. **Commission**: Financial ledger tracking platform commission deductions, vendor payout entitlements, settlement date, and reconciliation flags.
12. **Coupon**: Promotional codes (percentage or flat discount), minimum order requirements, maximum usage caps, validity date range, active toggle.
13. **Review**: Customer product ratings (1–5 stars), verified purchase flag, comments, vendor response, moderation status.
14. **Notification**: In-app notifications for order updates, vendor approvals, inventory warnings, and promotions.

---

## Entity Relationship Overview

```
 [User] 1 <---> 1 [Vendor] (Role: vendor)
   |
   | 1 <---> * [Order] 1 <---> * [VendorOrder] * <---> 1 [Vendor]
   |             |                     |
   |             | 1                   *
   |             v                     v
   |         [Payment]            [Product] * <---> 1 [Category]
   |                                   ^
   *                                   |
 [Review] * <--------------------------+
```
