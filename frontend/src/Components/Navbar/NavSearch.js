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

// The server does the matching (a few projected rows per query). Answers are kept per query,
// so retyping or backspacing is instant.
const answers = new Map();
const fetchSuggestions = async (q, signal) => {
  if (answers.has(q)) return answers.get(q);
  const base = process.env.REACT_APP_LOCAL_URL;
  const { data } = await axios.get(`${base}/api/product/suggest`, { params: { q }, signal });
  const items = (Array.isArray(data) ? data : []).map((r) => ({
    key: `${r.kind === 'Auction' ? 'a' : 'p'}-${r._id}`,
    kind: r.kind,
    name: r.name,
    sub: r.sub,
    price: formatMoney(r.price),
    image: r.image,
    to: r.kind === 'Auction' ? `/biddingProduct/${r._id}` : `/product/${r._id}`,
  }));
  answers.set(q, items);
  return items;
};

// The search panel that slides over the header. A module-level component, so typing
// never rebuilds it (the old version lived inside the navbar and lost focus on every key).
export default function NavSearch({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState({ q: '', items: [] });
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  // reset when it closes
  useEffect(() => {
    if (!open) { setQuery(''); setActive(-1); }
  }, [open]);

  const terms = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const q = terms.join(' ');

  const results = answer.items;
  const settled = answer.q === q;

  // Debounce keystrokes and cancel the request a newer keystroke makes stale.
  useEffect(() => {
    if (!q) { setAnswer({ q: '', items: [] }); return undefined; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetchSuggestions(q, ctrl.signal).then((items) => setAnswer({ q, items })).catch(() => {});
    }, answers.has(q) ? 0 : 120);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

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

          {terms.length > 0 && settled && results.length === 0 && (
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
