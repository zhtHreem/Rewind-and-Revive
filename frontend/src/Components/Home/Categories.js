import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useHomeItems from './useHomeProducts';
import './sections.css';

// Wayfinding into the shop. Each tile deep-links to a filtered catalogue.
const TILES = [
  {
    key: 'women',
    title: 'Women',
    to: '/catalogue?category=women',
    photo: '/images/people/mirror-fitting.jpg',
    pos: '50% 30%',
    count: (products) => products.filter((p) => p.category === 'women').length,
    unit: 'pieces',
  },
  {
    key: 'men',
    title: 'Men',
    to: '/catalogue?category=men',
    photo: '/images/people/sherpa-denim.jpg',
    pos: '50% 30%',
    count: (products) => products.filter((p) => p.category === 'men').length,
    unit: 'pieces',
  },
  {
    key: 'accessories',
    title: 'Jewellery & accessories',
    to: '/catalogue?type=accessories',
    photo: '/images/people/earring.jpg',
    pos: '40% 30%',
    count: (products) => products.filter((p) => p.kind === 'accessory').length,
    unit: 'pieces',
  },
  {
    key: 'new',
    title: 'Just listed',
    to: '/catalogue',
    photo: '/images/people/thrift-chest.jpg',
    pos: '50% 30%',
    count: (products) => products.length,
    unit: 'to browse',
  },
  {
    key: 'auctions',
    title: 'Auctions',
    to: '/bidProduct',
    photo: '/images/people/cameo.jpg',
    pos: '50% 30%',
    count: (_products, auctions) => auctions.length,
    unit: 'lots',
  },
];

export default function Categories() {
  const { products, auctions } = useHomeItems();

  const tiles = useMemo(
    () => TILES.map((t) => ({ ...t, n: t.count(products, auctions) })),
    [products, auctions]
  );

  return (
    <section className="rr-sec rr-sec--light" aria-label="Browse by category">
      <div className="rr-sec__in">
        <header className="rr-sec__head">
          <p className="rr-eyebrow">Browse the rack</p>
          <h2 className="rr-h2">Where do you want to <em>start?</em></h2>
        </header>
        <div className="rr-cats">
          {tiles.map((t, i) => (
            <Link key={t.key} to={t.to} className={`rr-cat rr-cat--${i}`}>
              <img src={t.photo} alt="" style={{ objectPosition: t.pos }} loading="lazy" decoding="async" />
              <span className="rr-cat__shade" />
              <span className="rr-cat__label">
                {t.title}
                <small>{t.n ? `${t.n} ${t.unit}` : 'Browse'}</small>
              </span>
              <span className="rr-cat__arrow" aria-hidden="true">&rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
