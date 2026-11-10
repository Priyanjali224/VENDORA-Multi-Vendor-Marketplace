# VENDORA Manual Deployment Guide

This guide provides end-to-end instructions for manual deployment to production using MongoDB Atlas, Render (Backend API), and Vercel (Frontend Single Page Application).

> [!IMPORTANT]
> In accordance with internship instructions, automated deployment has not been executed. All steps below are designed for manual execution by the engineer.

---

## 1. Local Git & GitHub Setup

1. **Initialize Git Repository:**
   ```bash
   cd VENDORA
   git init
   git add .
   git commit -m "feat: complete portfolio-grade multi-vendor marketplace full-stack project"
   ```

2. **Create Remote Repository on GitHub:**
   - Navigate to [GitHub](https://github.com/new) and create a repository named `vendora-marketplace`.
   - Set visibility to **Private** or **Public**.

3. **Push Source Code:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/vendora-marketplace.git
   git push -u origin main
   ```

---

## 2. MongoDB Atlas Configuration

1. Create a free shared M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user:
   - Username: `vendora_admin`
   - Password: `<STRONG_PASSWORD>`
3. Under **Network Access**, add IP Access List:
   - Allow Access from Anywhere (`0.0.0.0/0`) so Render instances can connect.
4. Retrieve Connection String:
   - Click **Connect** -> **Connect your application** -> **Drivers (Node.js)**.
   - Format: `mongodb+srv://vendora_admin:<PASSWORD>@cluster0.mongodb.net/vendora?retryWrites=true&w=majority`

---

## 3. Backend Deployment on Render

1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `vendora-marketplace`.
4. Configure Build & Runtime:
   - **Name:** `vendora-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Configure Environment Variables in Render Dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `CLIENT_URL`: `https://vendora-frontend.vercel.app` (your frontend domain)
   - `MONGODB_URI`: `mongodb+srv://vendora_admin:<PASSWORD>@cluster0.mongodb.net/vendora?retryWrites=true&w=majority`
   - `JWT_SECRET`: `<GENERATE_RANDOM_64_CHAR_SECRET>`
   - `JWT_EXPIRES_IN`: `7d`
   - `DEFAULT_COMMISSION_PERCENTAGE`: `10`
   - `STORAGE_DRIVER`: `local` (or `s3` if AWS bucket configured)
   - `RAZORPAY_KEY_ID`: `rzp_test_...`
   - `RAZORPAY_KEY_SECRET`: `...`
6. Click **Deploy Web Service**.
7. Note down your backend URL: `https://vendora-api.onrender.com`.

---

## 4. Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import `vendora-marketplace` from GitHub.
4. Configure Framework & Root Directory:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Configure Environment Variables:
   - `VITE_API_URL`: `https://vendora-api.onrender.com/api`
   - `VITE_STORAGE_URL`: `https://vendora-api.onrender.com`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_test_...`
6. Click **Deploy**.
7. Note down your frontend URL: `https://vendora-frontend.vercel.app`.

---

## 5. Post-Deployment Smoke Testing Checklist

1. **Health Check:** Open `https://vendora-api.onrender.com/api/health` and verify `{"status": "healthy"}`.
2. **Demo Accounts Verification:**
   - Log in as Platform Administrator (`admin@vendora.com` / `adminPassword123`).
   - Log in as Vendor (`apex@vendora.com` / `vendorPassword123`).
   - Log in as Customer (`customer@vendora.com` / `customerPassword123`).
3. **Product Catalog:** Verify that product images, category filters, and search respond with 200 OK.
4. **End-to-End Order:** Add items from two vendors to cart, apply `VENDORA10`, checkout, simulate test payment, and verify that both vendor sub-orders and PDF invoice download successfully.
