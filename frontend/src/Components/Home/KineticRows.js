import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useHomeItems, { FALLBACK_IMAGES } from './useHomeProducts';
import { ROW_PHOTOS } from './peoplePhotos';
import './home.css';

// Each row alternates photos and giant words. Photos are links to the real item.
const ROWS = [
  { reverse: false, pattern: ['p', 'p', 'w:Wear', 'p', 'p', 'i:it again', 'p', 'p'] },
  { reverse: true, pattern: ['i:& again', 'p', 'p', 'p', 'w:pre-loved', 'p', 'p', 'p'] },
  { reverse: false, pattern: ['p', 'w:clothes', 'p', 'p', 'i:jewellery', 'p', 'w:accessories', 'p'] },
];

export default function KineticRows() {
  const navigate = useNavigate();
  const { products } = useHomeItems();

  // Everyday pieces only (auctions are celebrity & collector lots with their own page),
  // alternated with people photos so the rows feel lived-in.
  const items = useMemo(() => {
    const things = products.length
      ? products
      : FALLBACK_IMAGES.map((image) => ({ image, name: 'Pre-loved piece', to: '/catalogue' }));
    const mixed = [];
    const total = Math.max(things.length, ROW_PHOTOS.length) * 2;
    for (let i = 0; i < total; i += 1) {
      if (i % 2 === 0) {
        const p = ROW_PHOTOS[(i / 2) % ROW_PHOTOS.length];
        mixed.push({ image: p.image, name: p.name, to: p.to, pos: p.pos });
      } else {
        mixed.push(things[((i - 1) / 2) % things.length]);
      }
    }
    return mixed;
  }, [products]);

  let cursor = 0;
  const nextItem = () => items[cursor++ % items.length];

  const renderRow = (row, rowIndex) => {
    // Build the sequence once, then repeat it so the loop is seamless at -50%.
    const sequence = row.pattern.map((token, idx) => {
      if (token === 'p') {
        const item = nextItem();
        return { key: `${rowIndex}-${idx}`, item };
      }
      const [style, text] = token.split(':');
      return { key: `${rowIndex}-${idx}`, text, italic: style === 'i' };
    });
    return (
      <div className={`rr-kin__row ${row.reverse ? 'is-rev' : ''}`} key={rowIndex}>
        {[0, 1].map((copy) => (
          <div className="rr-kin__set" key={copy} aria-hidden={copy === 1}>
            {sequence.map((s) =>
              s.item ? (
                <Link
                  key={`${s.key}-${copy}`}
                  to={s.item.to}
                  className="rr-kin__photo"
                  tabIndex={copy === 1 ? -1 : 0}
                >
                  <img src={s.item.image} alt={copy === 1 ? '' : s.item.name} style={s.item.pos ? { objectPosition: s.item.pos } : undefined} loading="lazy" decoding="async" />
                </Link>
              ) : (
                <span key={`${s.key}-${copy}`} className={`rr-kin__word ${s.italic ? 'is-italic' : ''}`}>
                  {s.text}
                </span>
              )
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="rr-kin" aria-label="Sell your pieces">
      <div className="rr-kin__card">
        <p className="rr-eyebrow">Wear it again</p>
        <h2>
          Give a good piece a <em>second life.</em>
        </h2>
        <p>Clear out your closet and jewellery box, earn badges, and keep clothes out of landfill.</p>
        <button className="rr-btn rr-btn--solid" onClick={() => navigate('/createproduct')}>
          Start selling
        </button>
      </div>
      <div className="rr-kin__rows" aria-hidden={false}>
        {ROWS.map(renderRow)}
      </div>
    </section>
  );
}
