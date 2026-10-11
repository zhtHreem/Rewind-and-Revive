import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { formatMoney } from '../../utils/money';
import './navSearch.css';

const QUICK = [
  { label: 'Women', to: '/catalogue?category=women' },
  { label: 'Men', to: '/catalogue?category=men' },
  { label: 'Jewellery & accessories', to: '/catalogue?type=accessories' },
  { label: 'Live auctions', to: '/bidProduct' },
];

// Data is fetched once per page visit and reused for every keystroke.
let cache = null;
const loadIndex = async () => {
  if (cache) return cache;
  const base = process.env.REACT_APP_LOCAL_URL;
  const [shop, lots] = await Promise.all([
    axios.get(`${base}/api/product/catalogue?limit=60`).catch(() => ({ data: [] })),
    axios.get(`${base}/api/biddingProduct/get`).catch(() => ({ data: [] })),
  ]);
  const products = (Array.isArray(shop.data) ? shop.data : shop.data.products || []).map((p) => ({
    key: `p-${p._id}`,
    kind: 'Shop',
    name: p.name,
    sub: [p.category, p.type].filter(Boolean).join(' · '),
    price: formatMoney(p.price),
    image: p.images && p.images[0],
    to: `/product/${p._id}`,
    haystack: [p.name, p.category, p.type, ...(p.categories || [])].join(' ').toLowerCase(),
  }));
  const auctions = (Array.isArray(lots.data) ? lots.data : []).map((l) => ({
    key: `a-${l._id}`,
    kind: 'Auction',
    name: l.name,
    sub: l.lotCollection || 'Auction lot',
    price: formatMoney(l.startingPrice),
    image: l.images && l.images[0],
    to: `/biddingProduct/${l._id}`,
    haystack: [l.name, l.lotCollection, l.description].join(' ').toLowerCase(),
  }));
  cache = [...products, ...auctions];
  return cache;
};

// The search panel that slides over the header. A module-level component, so typing
// never rebuilds it (the old version lived inside the navbar and lost focus on every key).
export default function NavSearch({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    loadIndex().then((items) => { if (!cancelled) setIndex(items); });
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    return () => { cancelled = true; clearTimeout(t); };
  }, [open]);

  // reset when it closes
  useEffect(() => {
    if (!open) { setQuery(''); setActive(-1); }
  }, [open]);

  const terms = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const results = useMemo(() => {
    if (!terms.length) return [];
    return index
      .filter((item) => terms.every((t) => item.haystack.includes(t)))
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(terms[0])) - Number(a.name.toLowerCase().startsWith(terms[0])))
      .slice(0, 6);
  }, [index, terms]);

  useEffect(() => setActive(-1), [query]);

  const go = (to) => { onClose(); navigate(to); };
  const seeAll = () => query.trim() && go(`/catalogue?search=${encodeURIComponent(query.trim())}`);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) go(results[active].to);
      else seeAll();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="ns-scrim" onClick={onClose} aria-hidden="true" />
      <div className="ns" role="dialog" aria-label="Search">
        <div className="ns__bar">
          <SearchIcon className="ns__icon" />
          <input
            ref={inputRef}
            className="ns__input"
            type="search"
            placeholder="Search pieces, jewellery, auctions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="ns-list"
            aria-autocomplete="list"
            autoComplete="off"
          />
          {query && (
            <button type="button" className="ns__clear" onClick={() => { setQuery(''); inputRef.current && inputRef.current.focus(); }} aria-label="Clear search">
              <CloseIcon fontSize="small" />
            </button>
          )}
          <button type="button" className="ns__close" onClick={onClose}>Close</button>
        </div>

        <div className="ns__panel">
          {!terms.length && (
            <div className="ns__quick">
              <p>Popular right now</p>
              <div>
                {QUICK.map((q) => (
                  <button key={q.label} type="button" onClick={() => go(q.to)}>{q.label}</button>
                ))}
              </div>
            </div>
          )}

          {terms.length > 0 && results.length === 0 && (
            <p className="ns__empty">
              Nothing matches &ldquo;{query}&rdquo; yet. Try a simpler word like &ldquo;denim&rdquo; or &ldquo;pearl&rdquo;.
            </p>
          )}

          {results.length > 0 && (
            <ul id="ns-list" className="ns__list" role="listbox">
              {results.map((r, i) => (
                <li key={r.key} role="option" aria-selected={i === active}>
                  <button type="button" className={i === active ? 'is-active' : ''} onMouseEnter={() => setActive(i)} onClick={() => go(r.to)}>
                    <span className="ns__thumb">{r.image ? <img src={r.image} alt="" decoding="async" /> : null}</span>
                    <span className="ns__text">
                      <b>{r.name}</b>
                      <small>{r.sub}</small>
                    </span>
                    <span className="ns__meta">
                      <i>{r.price}</i>
                      {r.kind === 'Auction' && <em>Auction</em>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {terms.length > 0 && (
            <button type="button" className="ns__all" onClick={seeAll}>
              See all results for &ldquo;{query.trim()}&rdquo; &rarr;
            </button>
          )}
        </div>
      </div>
    </>
  );
}
