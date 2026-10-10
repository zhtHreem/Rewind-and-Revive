import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HERO_PHOTOS } from './peoplePhotos';
import './home.css';

// Positions are percentages of the pattern table so it scales with the viewport.
const PIECES = [
  { cls: 'p1', rot: -1.5 },
  { cls: 'p2', rot: 2.5 },
  { cls: 'p3', rot: -2 },
  { cls: 'p4', rot: 2 },
  { cls: 'p5', rot: -3 },
];

export default function PatternHero() {
  const navigate = useNavigate();

  return (
    <section className="rr-pattern" aria-label="Welcome">
      <div className="rr-pattern__copy">
        <p className="rr-eyebrow">Pre-loved fashion · Pattern no. 01</p>
        <h1>
          Your next favourite piece already has a <em>past.</em>
        </h1>
        <p className="rr-pattern__lead">
          Pre-loved clothes, jewellery and accessories from real people. Buy it, bid on a
          rare find, or sell what you no longer wear.
        </p>
        <div className="rr-pattern__cta">
          <button className="rr-btn rr-btn--solid" onClick={() => navigate('/catalogue')}>
            Shop the rack
          </button>
          <button className="rr-btn rr-btn--ghost" onClick={() => navigate('/bidProduct')}>
            <span className="rr-live" /> Live auctions
          </button>
        </div>
        <ul className="rr-pattern__notes">
          <li>one of a kind, never restocked</li>
          <li>bid live on rare finds</li>
          <li>sell what you no longer wear</li>
        </ul>
      </div>

      <div className="rr-pattern__table">
        <span className="rr-pattern__ruler" aria-hidden="true" />
        <span className="rr-pattern__scissors" aria-hidden="true">&#9986; - - - - - -</span>
        {HERO_PHOTOS.map((photo, i) => (
          <Link
            key={photo.image}
            to={photo.to}
            className={`rr-piece rr-piece--${PIECES[i].cls}`}
            style={{ '--rot': `${PIECES[i].rot}deg` }}
          >
            <span className="rr-piece__label">{`Piece ${i + 1} · ${photo.kind}`}</span>
            <img
              src={photo.image}
              alt={photo.name}
              style={{ objectPosition: photo.pos }}
              loading={i < 3 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <span className="rr-piece__name">{photo.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
