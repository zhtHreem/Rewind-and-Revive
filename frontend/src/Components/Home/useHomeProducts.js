import { useEffect, useState } from 'react';
import axios from 'axios';

import fallbackA from '../Header/images/a.jpg';
import fallbackR from '../Header/images/r.jpg';
import fallback1 from '../Product/images/1.jpg';
import fallback2 from '../Product/images/2.jpg';
import fallback3 from '../Product/images/3.jpg';

export const FALLBACK_IMAGES = [fallbackA, fallbackR, fallback1, fallback2, fallback3];

// One shared request per endpoint for every home section that needs photos.
let cachedProducts = null;
let cachedAuctions = null;

const loadProducts = () => {
  if (!cachedProducts) {
    cachedProducts = axios
      .get(`${process.env.REACT_APP_LOCAL_URL}/api/product/catalogue?limit=24`)
      .then((res) => (Array.isArray(res.data) ? res.data : res.data.products || []))
      .catch(() => {
        cachedProducts = null;
        return [];
      });
  }
  return cachedProducts;
};

const loadAuctions = () => {
  if (!cachedAuctions) {
    cachedAuctions = axios
      .get(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`)
      .then((res) => (Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        cachedAuctions = null;
        return [];
      });
  }
  return cachedAuctions;
};

// Normalises fixed-price products and auction lots into one shape so the
// home sections can mix them (clothes + jewellery + accessories).
const fromProduct = (p) => ({
  id: p._id,
  name: p.name,
  image: p.images[0],
  price: p.price,
  category: p.category,
  kind: p.type === 'accessories' ? 'accessory' : p.type || 'piece',
  to: `/product/${p._id}`,
});

const fromAuction = (b) => ({
  id: b._id,
  name: b.name,
  image: b.images[0],
  price: b.startingPrice,
  kind: 'auction',
  to: `/biddingProduct/${b._id}`,
});

export default function useHomeItems() {
  const [state, setState] = useState({ products: [], auctions: [], loading: true });

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadProducts(), loadAuctions()]).then(([products, auctions]) => {
      if (cancelled) return;
      setState({
        products: products.filter((p) => p.images && p.images[0]).map(fromProduct),
        auctions: auctions.filter((b) => b.images && b.images[0]).map(fromAuction),
        loading: false,
      });
    });
    return () => { cancelled = true; };
  }, []);

  return state;
}

// Interleave so the first few items show a mix of clothes, accessories and auction lots.
export const mixItems = (products, auctions) => {
  const out = [];
  const max = Math.max(products.length, auctions.length);
  for (let i = 0; i < max; i += 1) {
    if (products[i]) out.push(products[i]);
    if (products[i + 1] && i % 2 === 0) out.push(products[i + 1]);
    if (auctions[i]) out.push(auctions[i]);
  }
  return [...new Map(out.map((item) => [item.to, item])).values()];
};
