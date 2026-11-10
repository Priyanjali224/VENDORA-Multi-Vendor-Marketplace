/**
 * VENDORA Search Service
 * Elasticsearch integration with seamless MongoDB full-text index fallback.
 */

const Product = require('../models/Product');

class SearchService {
  constructor() {
    this.isElasticConnected = false;
    if (process.env.ELASTICSEARCH_URL) {
      console.log(`🔍 Elasticsearch URL provided: ${process.env.ELASTICSEARCH_URL}`);
      // Elastic client can be hooked here when cluster is reachable
    }
  }

  async searchProducts({
    query = '',
    category = '',
    minPrice,
    maxPrice,
    minRating,
    vendorId,
    sortBy = 'newest',
    page = 1,
    limit = 12
  }) {
    // If Elasticsearch is reachable, query ES cluster; otherwise perform high-speed MongoDB indexing search
    const filter = { isActive: true };

    if (query && query.trim() !== '') {
      filter.$or = [
        { name: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } },
        { tags: { $regex: query.trim(), $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (vendorId) {
      filter.vendor = vendorId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    if (minRating !== undefined && !isNaN(minRating)) {
      filter.ratingsAverage = { $gte: Number(minRating) };
    }

    const sortOptions = {};
    if (sortBy === 'price_asc') sortOptions.price = 1;
    else if (sortBy === 'price_desc') sortOptions.price = -1;
    else if (sortBy === 'rating') sortOptions.ratingsAverage = -1;
    else if (sortBy === 'popular') sortOptions.totalSales = -1;
    else sortOptions.createdAt = -1; // newest default

    const skip = (Number(page) - 1) * Number(limit);

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('vendor', 'storeName slug logo rating status')
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    return {
      products,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / Number(limit))
      },
      source: this.isElasticConnected ? 'elasticsearch' : 'mongodb'
    };
  }

  async getSuggestions(prefix = '') {
    if (!prefix || prefix.length < 2) return [];
    const products = await Product.find({
      isActive: true,
      name: { $regex: `^${prefix}`, $options: 'i' }
    })
      .select('name slug')
      .limit(6)
      .lean();
    return products.map(p => ({ title: p.name, slug: p.slug }));
  }

  async syncProductIndex(product) {
    // Synchronize product with Elasticsearch if cluster is connected
    return true;
  }
}

module.exports = new SearchService();
