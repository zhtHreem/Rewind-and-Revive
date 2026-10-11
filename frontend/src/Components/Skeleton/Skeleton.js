import React from 'react';
import './skeleton.css';

// Reusable loading placeholders. Every one is built from the same sizes as the real
// thing it stands in for, so the page doesn't jump when the data arrives.

// ---------- primitives ----------
export const Skel = ({ w, h, r, circle = false, dark = false, className = '', style }) => (
  <span
    className={`skel ${circle ? 'skel--circle' : ''} ${dark ? 'skel--dark' : ''} ${className}`}
    style={{ width: w, height: h, borderRadius: circle ? '50%' : r, ...style }}
    aria-hidden="true"
  />
);

// Wraps a loading area so screen readers know the content is on its way.
export const SkelRegion = ({ label = 'Loading', className = '', children }) => (
  <div className={className} role="status" aria-busy="true">
    <span className="sk-sr">{label}</span>
    {children}
  </div>
);

export const SkelLines = ({ widths = ['100%', '82%', '60%'], h = 14, dark = false }) => (
  <div className="sk-lines">
    {widths.map((w, i) => (
      <Skel key={i} w={w} h={h} dark={dark} />
    ))}
  </div>
);

// ---------- cards and grids ----------
export const ProductCardSkeleton = () => (
  <div className="sk-card" aria-hidden="true">
    <Skel className="sk-card__photo" r={0} />
    <div className="sk-card__body">
      <Skel w="78%" h={17} />
      <Skel w="34%" h={15} />
      <div className="sk-row">
        <Skel circle w={20} h={20} />
        <Skel w="42%" h={12} />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8, label = 'Loading pieces' }) => (
  <SkelRegion label={label} className="sk-grid">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </SkelRegion>
);

export const LotCardSkeleton = () => (
  <div className="sk-card" aria-hidden="true">
    <Skel className="sk-card__photo" r={0} />
    <div className="sk-card__body">
      <Skel w="40%" h={11} />
      <Skel w="82%" h={19} />
      <SkelLines widths={['100%', '70%']} h={12} />
      <div className="sk-row sk-row--between">
        <Skel w="46%" h={16} />
        <Skel w={64} h={32} r={999} />
      </div>
    </div>
  </div>
);

export const LotGridSkeleton = ({ count = 8 }) => (
  <SkelRegion label="Loading lots" className="sk-grid">
    {Array.from({ length: count }).map((_, i) => (
      <LotCardSkeleton key={i} />
    ))}
  </SkelRegion>
);

// ---------- page sections ----------
export const AuctionFeatureSkeleton = () => (
  <SkelRegion label="Loading the featured lot" className="sk-feature">
    <Skel className="sk-feature__photo" r={0} />
    <div className="sk-feature__body">
      <Skel w="30%" h={12} />
      <Skel w="85%" h={46} />
      <Skel w="70%" h={46} />
      <SkelLines widths={['100%', '88%']} h={16} />
      <div className="sk-row">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel key={i} w={68} h={62} r={8} />
        ))}
      </div>
      <Skel w={190} h={52} r={999} />
    </div>
  </SkelRegion>
);

// The dark auction band on the home page: one big lot and four tiles.
export const AuctionBandSkeleton = () => (
  <SkelRegion label="Loading auctions" className="sk-band">
    <Skel dark className="sk-band__feature" />
    <div className="sk-band__grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="sk-band__tile">
          <Skel dark className="sk-band__photo" r={0} />
          <div className="sk-band__meta">
            <Skel dark w="60%" h={16} />
            <Skel dark w="22%" h={14} />
          </div>
        </div>
      ))}
    </div>
  </SkelRegion>
);

export const SpotlightSkeleton = ({ compact = false }) => (
  <SkelRegion label="Loading pieces" className={`sk-spot ${compact ? 'sk-spot--compact' : ''}`}>
    <Skel dark className="sk-spot__fill" r={0} />
  </SkelRegion>
);

// ---------- whole pages ----------
export const ProductPageSkeleton = () => (
  <SkelRegion label="Loading this piece" className="sk-product">
    <div className="sk-product__gallery">
      <div className="sk-product__thumbs">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel key={i} w={64} h={80} r={8} />
        ))}
      </div>
      <Skel className="sk-product__main" r={14} />
    </div>
    <div className="sk-product__info">
      <Skel w={150} h={32} r={999} />
      <Skel w="35%" h={12} />
      <Skel w="90%" h={44} />
      <Skel w="55%" h={44} />
      <Skel w="30%" h={30} />
      <SkelLines widths={['100%', '92%', '70%']} h={14} />
      <div className="sk-row">
        <Skel w="48%" h={54} r={999} />
        <Skel w="48%" h={54} r={999} />
      </div>
      <Skel w="100%" h={90} r={12} />
    </div>
  </SkelRegion>
);

export const LotPageSkeleton = () => (
  <SkelRegion label="Loading this lot" className="sk-lot">
    <Skel className="sk-lot__photo" r={0} />
    <div className="sk-lot__panel">
      <Skel dark w="30%" h={12} />
      <Skel dark w="85%" h={40} />
      <SkelLines widths={['100%', '75%']} h={15} dark />
      <Skel dark w="50%" h={44} />
      <div className="sk-row">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel dark key={i} w="22%" h={58} r={8} />
        ))}
      </div>
      <Skel dark w="100%" h={52} r={999} />
    </div>
  </SkelRegion>
);

export const ProfileSkeleton = () => (
  <SkelRegion label="Loading profile" className="sk-profile">
    <div className="sk-profile__head">
      <Skel circle w={120} h={120} />
      <div className="sk-profile__text">
        <Skel w={90} h={12} />
        <Skel w="50%" h={44} />
        <Skel w="38%" h={14} />
        <div className="sk-row">
          <Skel w={56} h={40} r={8} />
          <Skel w={56} h={40} r={8} />
          <Skel w={56} h={40} r={8} />
        </div>
      </div>
    </div>
    <div className="sk-row sk-profile__tabs">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skel key={i} w={110} h={38} r={999} />
      ))}
    </div>
    <div className="sk-grid sk-grid--4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </SkelRegion>
);

// Shown while a page's code is still downloading (route changes).
export const PageSkeleton = () => (
  <SkelRegion label="Loading page" className="sk-page">
    <div className="sk-page__nav">
      <Skel w={170} h={30} />
      <div className="sk-page__links">
        <Skel w={44} h={14} />
        <Skel w={44} h={14} />
        <Skel w={72} h={14} />
        <Skel w={44} h={14} />
      </div>
      <Skel w={86} h={38} r={999} />
    </div>
    <div className="sk-page__hero">
      <Skel w={120} h={12} />
      <Skel w="min(560px, 80%)" h={52} />
      <Skel w="min(380px, 60%)" h={16} />
    </div>
    <div className="sk-page__body">
      <div className="sk-grid sk-grid--4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </SkelRegion>
);
