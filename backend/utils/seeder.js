const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');

const seedDataIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️  Database already contains records. Skipping auto-seed.');
      return;
    }

    console.log('🌱 Empty database detected. Seeding realistic multi-vendor marketplace data...');

    // 1. Admin
    const admin = await User.create({
      name: 'Platform Administrator',
      email: 'admin@vendora.com',
      password: 'adminPassword123',
      role: 'admin',
      phone: '+91 98765 00000',
    });

    // 2. Customers
    const customer1 = await User.create({
      name: 'Priya Sharma',
      email: 'customer@vendora.com',
      password: 'customerPassword123',
      role: 'customer',
      phone: '+91 98765 11111',
      address: {
        addressLine1: 'Flat 402, Lotus Heights, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400076',
        country: 'India',
      },
    });

    const customer2 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@vendora.com',
      password: 'customerPassword123',
      role: 'customer',
      phone: '+91 98765 22222',
      address: {
        addressLine1: 'B-12, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        postalCode: '201301',
        country: 'India',
      },
    });

    // 3. Vendors
    const vendorUser1 = await User.create({
      name: 'Vikram Mehta',
      email: 'apex@vendora.com',
      password: 'vendorPassword123',
      role: 'vendor',
      phone: '+91 98765 33333',
    });

    const vendor1 = await Vendor.create({
      user: vendorUser1._id,
      storeName: 'Apex Audio & Electronics',
      slug: 'apex-audio-electronics',
      description: 'Official flagship distributor of premium acoustics, noise-canceling headphones, and pro studio gear.',
      email: 'apex@vendora.com',
      phone: '+91 98765 33333',
      status: 'approved',
      commissionRate: 10,
      rating: 4.8,
      numReviews: 24,
      logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80',
    });

    const vendorUser2 = await User.create({
      name: 'Aanya Sen',
      email: 'luxe@vendora.com',
      password: 'vendorPassword123',
      role: 'vendor',
      phone: '+91 98765 44444',
    });

    const vendor2 = await Vendor.create({
      user: vendorUser2._id,
      storeName: 'Urban Luxe Fashion',
      slug: 'urban-luxe-fashion',
      description: 'Modern bespoke street-style and everyday luxury fashion curated for modern tastemakers.',
      email: 'luxe@vendora.com',
      phone: '+91 98765 44444',
      status: 'approved',
      commissionRate: 12,
      rating: 4.6,
      numReviews: 18,
      logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80',
    });

    const vendorUser3 = await User.create({
      name: 'Karan Patel',
      email: 'eco@vendora.com',
      password: 'vendorPassword123',
      role: 'vendor',
      phone: '+91 98765 55555',
    });

    const vendor3 = await Vendor.create({
      user: vendorUser3._id,
      storeName: 'EcoLiving Essentials',
      slug: 'ecoliving-essentials',
      description: '100% sustainably harvested organic home essentials, bamboo accessories, and zero-waste kitchenware.',
      email: 'eco@vendora.com',
      phone: '+91 98765 55555',
      status: 'approved',
      commissionRate: 8,
      rating: 4.9,
      numReviews: 31,
      logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&auto=format&fit=crop&q=80',
    });

    // 4. Pending Vendor Application (for Admin Approval Testing)
    const vendorUserPending = await User.create({
      name: 'Devansh Roy',
      email: 'swift@vendora.com',
      password: 'vendorPassword123',
      role: 'vendor',
      phone: '+91 98765 66666',
    });

    await Vendor.create({
      user: vendorUserPending._id,
      storeName: 'Swift Tech Gadgets',
      slug: 'swift-tech-gadgets',
      description: 'High-speed smart accessories and fast chargers.',
      email: 'swift@vendora.com',
      phone: '+91 98765 66666',
      status: 'pending',
      commissionRate: 10,
    });

    // 5. Categories
    const catElectronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Smartphones, noise-canceling headphones, and wearables.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    });

    const catFashion = await Category.create({
      name: 'Fashion & Apparel',
      slug: 'fashion',
      description: 'Premium curated men and women apparel, jackets and timepieces.',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80',
    });

    const catHome = await Category.create({
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Eco-conscious artisanal decor, ceramic dining, and lighting.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    });

    const catBeauty = await Category.create({
      name: 'Beauty & Skincare',
      slug: 'beauty',
      description: 'Pure botanical organic skincare, serums and aromas.',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80',
    });

    // 6. Products (Prices stored in integer paise: ₹1,999 = 199900 paise)
    const productsData = [
      {
        name: 'Acoustic Pro Wireless Studio Headphones',
        slug: 'acoustic-pro-wireless-studio-headphones',
        sku: 'APEX-AUD-001',
        description: 'Industry-leading Active Noise Cancellation (ANC) with 40-hour battery life, high-res audio drivers, and ultra-plush memory foam earpads.',
        vendor: vendor1._id,
        category: catElectronics._id,
        price: 1499900, // ₹14,999
        discountPrice: 1199900, // ₹11,999
        stock: 45,
        lowStockThreshold: 5,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'Driver Size', value: '45mm Neodymium' },
          { key: 'Battery', value: '40 Hours Playback' },
          { key: 'Connectivity', value: 'Bluetooth 5.3 + 3.5mm Aux' },
        ],
        tags: ['audio', 'bluetooth', 'anc', 'headphones'],
        ratingsAverage: 4.8,
        ratingsCount: 14,
        isFeatured: true,
      },
      {
        name: 'Apex Sonic Pulse Waterproof Speaker',
        slug: 'apex-sonic-pulse-waterproof-speaker',
        sku: 'APEX-AUD-002',
        description: 'IP67 waterproof submersible Bluetooth speaker with deep 360-degree bass and 24-hour battery endurance.',
        vendor: vendor1._id,
        category: catElectronics._id,
        price: 499900, // ₹4,999
        discountPrice: 399900, // ₹3,999
        stock: 80,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['speaker', 'audio', 'waterproof', 'outdoor'],
        ratingsAverage: 4.7,
        ratingsCount: 8,
        isFeatured: false,
      },
      {
        name: 'Apex UltraFit Smart Fitness Tracker',
        slug: 'apex-ultrafit-smart-fitness-tracker',
        sku: 'APEX-WR-003',
        description: 'Vibrant AMOLED curved display, SpO2 blood oxygen tracking, GPS workout routes, and 14-day standby.',
        vendor: vendor1._id,
        category: catElectronics._id,
        price: 699900, // ₹6,999
        discountPrice: 499900, // ₹4,999
        stock: 35,
        lowStockThreshold: 5,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['smartwatch', 'fitness', 'wearable', 'gps'],
        ratingsAverage: 4.9,
        ratingsCount: 11,
        isFeatured: true,
      },
      {
        name: 'Urban Tailored Minimalist Wool Overcoat',
        slug: 'urban-tailored-minimalist-wool-overcoat',
        sku: 'LUXE-CL-101',
        description: 'Handcrafted double-faced merino wool trench overcoat designed for timeless seasonal versatility.',
        vendor: vendor2._id,
        category: catFashion._id,
        price: 899900, // ₹8,999
        discountPrice: 699900, // ₹6,999
        stock: 20,
        lowStockThreshold: 3,
        images: [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['fashion', 'coat', 'winter', 'wool'],
        ratingsAverage: 4.7,
        ratingsCount: 9,
        isFeatured: true,
      },
      {
        name: 'Urban Classic Leather Chronograph Timepiece',
        slug: 'urban-classic-leather-chronograph-timepiece',
        sku: 'LUXE-ACC-102',
        description: 'Surgical-grade stainless steel casing with genuine Italian sapphire crystal and vegetable-tanned leather strap.',
        vendor: vendor2._id,
        category: catFashion._id,
        price: 1299900, // ₹12,999
        discountPrice: 949900, // ₹9,499
        stock: 15,
        lowStockThreshold: 4,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['watch', 'luxury', 'leather', 'chronograph'],
        ratingsAverage: 4.8,
        ratingsCount: 7,
        isFeatured: true,
      },
      {
        name: 'Handcrafted Organic Stoneware Ceramic Dinner Set',
        slug: 'handcrafted-organic-stoneware-ceramic-dinner-set',
        sku: 'ECO-HM-201',
        description: '16-piece artisan speckled glazed ceramic tableware, microwave and dishwasher safe, lead-free.',
        vendor: vendor3._id,
        category: catHome._id,
        price: 449900, // ₹4,499
        discountPrice: 349900, // ₹3,499
        stock: 25,
        lowStockThreshold: 5,
        images: [
          'https://images.unsplash.com/photo-1614945417467-36e7a2b21703?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['ceramics', 'home', 'kitchen', 'dining'],
        ratingsAverage: 4.9,
        ratingsCount: 15,
        isFeatured: true,
      },
      {
        name: 'EcoLiving Pure Essential Oil Ultrasonic Diffuser',
        slug: 'ecoliving-pure-essential-oil-ultrasonic-diffuser',
        sku: 'ECO-HM-202',
        description: 'Natural bamboo grain ultrasonic aromatherapy mist diffuser with 7 ambient light settings.',
        vendor: vendor3._id,
        category: catHome._id,
        price: 249900, // ₹2,499
        discountPrice: 189900, // ₹1,899
        stock: 50,
        lowStockThreshold: 10,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['home', 'aromatherapy', 'diffuser', 'wellness'],
        ratingsAverage: 4.6,
        ratingsCount: 6,
        isFeatured: false,
      },
    ];

    for (const pData of productsData) {
      const prod = await Product.create(pData);
      await Inventory.create({
        product: prod._id,
        vendor: prod.vendor,
        quantity: prod.stock,
        lowStockThreshold: prod.lowStockThreshold,
      });

      // Sample verified review
      await Review.create({
        product: prod._id,
        customer: customer1._id,
        rating: 5,
        title: 'Outstanding quality and fast delivery!',
        comment: 'Exceeded all expectations. The packaging was pristine and build quality is remarkable.',
        isVerifiedPurchase: true,
        status: 'approved',
      });
    }

    // 7. Coupons
    await Coupon.create({
      code: 'VENDORA10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 99900, // min ₹999
      maxDiscountAmount: 150000, // max ₹1,500
      usageLimit: 1000,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days validity
      isActive: true,
    });

    await Coupon.create({
      code: 'FESTIVE500',
      discountType: 'fixed',
      discountValue: 50000, // ₹500 off
      minOrderAmount: 250000, // min ₹2,500
      usageLimit: 500,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    console.log('✅ Realistic multi-vendor seed data inserted successfully!');
    console.log('----------------------------------------------------');
    console.log('Credentials Summary:');
    console.log('👑 Admin:     admin@vendora.com / adminPassword123');
    console.log('🛍️ Customer:  customer@vendora.com / customerPassword123');
    console.log('🏪 Vendor 1:  apex@vendora.com / vendorPassword123');
    console.log('🏪 Vendor 2:  luxe@vendora.com / vendorPassword123');
    console.log('🏪 Vendor 3:  eco@vendora.com / vendorPassword123');
    console.log('⏳ Pending:   swift@vendora.com / vendorPassword123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = { seedDataIfEmpty };
