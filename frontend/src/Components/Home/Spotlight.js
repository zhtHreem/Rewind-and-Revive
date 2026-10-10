import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import useHomeItems, { mixItems } from './useHomeProducts';
import './home.css';
import { formatMoney } from '../../utils/money';

export default function Spotlight({ onlyProducts = false, compact = false }) {
  const ref = useRef(null);
  const { products, auctions } = useHomeItems();
  const items = useMemo(
    () => (onlyProducts ? products : mixItems(products, auctions)).slice(0, 12),
    [products, auctions, onlyProducts]
  );

  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  if (items.length < 6) return null;

  return (
    <section className={`rr-spot ${compact ? 'rr-spot--compact' : ''}`} ref={ref} onMouseMove={move} aria-label="Discover pieces">
      <div className="rr-spot__grid">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="rr-spot__tile">
            <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
            <span className="rr-spot__cap">
              {item.name}
              <small>{formatMoney(item.price)}</small>
            </span>
          </Link>
        ))}
      </div>
      <div className="rr-spot__mask" aria-hidden="true" />
      <div className="rr-spot__text">
        <p className="rr-eyebrow">Move your cursor</p>
        <h2>
          Find the one
          <br />
          <em>in the dark.</em>
        </h2>
      </div>
    </section>
  );
}
