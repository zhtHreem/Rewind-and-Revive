import Product from '../models/product.js';
import BiddingProduct from '../models/biddingProduct.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Every typed word must start a word somewhere in the field ("den jac" -> "Denim Jacket").
// Anchoring to word starts keeps matches relevant and the regex cheap.
const wordPrefixes = (terms) => terms.map((t) => new RegExp(`(^|[\\s/&-])${escapeRegex(t)}`, 'i'));

const SHOP_LIMIT = 6;
const LOT_LIMIT = 4;

// GET /api/product/suggest?q=denim
// Tiny payload for the navbar dropdown: a few projected fields, hard-limited, no populate.
export const suggest = async (req, res) => {
  try {
    const terms = String(req.query.q || '').toLowerCase().split(/\s+/).filter(Boolean).slice(0, 4);
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    if (!terms.length) return res.json([]);

    const patterns = wordPrefixes(terms);
    const shopFilter = {
      isSold: false,
      $and: patterns.map((re) => ({ $or: [{ name: re }, { category: re }, { categories: re }] })),
    };
    const lotFilter = {
      $and: patterns.map((re) => ({ $or: [{ name: re }, { lotCollection: re }] })),
    };

    const [shop, lots] = await Promise.all([
      Product.find(shopFilter)
        .sort({ createdAt: -1 })
        .limit(SHOP_LIMIT)
        .select({ name: 1, price: 1, category: 1, type: 1, images: { $slice: 1 } })
        .lean(),
      BiddingProduct.find(lotFilter)
        .sort({ bidEndTime: -1 })
        .limit(LOT_LIMIT)
        .select({ name: 1, startingPrice: 1, lotCollection: 1, images: { $slice: 1 } })
        .lean(),
    ]);

    const startsWith = (n) => n.toLowerCase().startsWith(terms[0]);
    const results = [
      ...shop.map((p) => ({ kind: 'Shop', _id: p._id, name: p.name, sub: [p.category, p.type].filter(Boolean).join(' · '), price: p.price, image: p.images && p.images[0] })),
      ...lots.map((l) => ({ kind: 'Auction', _id: l._id, name: l.name, sub: l.lotCollection || 'Auction lot', price: l.startingPrice, image: l.images && l.images[0] })),
    ]
      .sort((a, b) => Number(startsWith(b.name)) - Number(startsWith(a.name)))
      .slice(0, 6);

    res.json(results);
  } catch (error) {
    console.error('Error in search suggest:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
