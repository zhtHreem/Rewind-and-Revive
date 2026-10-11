import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import useHomeItems, { mixItems } from './useHomeProducts';
import './home.css';
import { formatMoney } from '../../utils/money';
import { SpotlightSkeleton } from '../Skeleton/Skeleton';

export default function Spotlight({ onlyProducts = false, compact = false }) {
  const ref = useRef(null);
  const { products, auctions, loading } = useHomeItems();
  const items = useMemo(
    () => (onlyProducts ? products : mixItems(products, auctions)).slice(0, 12),
    [products, auctions, onlyProducts]
  );

  // On touch screens there is no cursor, so the light drifts on its own until a finger takes over.
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: none)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf; let held = false; const t0 = performance.now();
    const hold = () => { held = true; clearTimeout(el._rel); el._rel = setTimeout(() => { held = false; }, 2500); };
    el.addEventListener('touchstart', hold, { passive: true });
    el.addEventListener('touchmove', hold, { passive: true });
    const tick = (now) => {
      if (!held) {
        const t = (now - t0) / 1000; const r = el.getBoundingClientRect();
        el.style.setProperty('--x', `${r.width * (0.5 + 0.38 * Math.sin(t * 0.7))}px`);
        el.style.setProperty('--y', `${r.height * (0.5 + 0.34 * Math.sin(t * 0.5 + 1))}px`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(el._rel); el.removeEventListener('touchstart', hold); el.removeEventListener('touchmove', hold); };
  }, [items.length]);

  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  if (loading) return <SpotlightSkeleton compact={compact} />;
  if (items.length < 6) return null;

  return (
    <section className={`rr-spot ${compact ? 'rr-spot--compact' : ''}`} ref={ref} onPointerMove={move} aria-label="Discover pieces">
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
        <p className="rr-eyebrow">
          <span className="rr-spot__hint-mouse">Move your cursor</span>
          <span className="rr-spot__hint-touch">Touch to light it up</span>
        </p>
        <h2>
          Find the one
          <br />
          <em>in the dark.</em>
        </h2>
      </div>
    </section>
  );
}
