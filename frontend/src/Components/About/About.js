import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/layout';
import '../Home/home.css';
import '../Home/sections.css';
import './about.css';

const STRIP = [
  { src: '/images/people/thrift-chest.jpg', alt: 'Looking through a chest of thrifted clothes', pos: '50% 30%' },
  { src: '/images/people/hanger-smile.jpg', alt: 'Smiling woman holding a shirt on a hanger', pos: '50% 38%' },
  { src: '/images/people/tag-rack.jpg', alt: 'Checking the tag on a pre-loved piece', pos: '50% 40%' },
  { src: '/images/people/scarf-shades.jpg', alt: 'Woman in a silk scarf and sunglasses', pos: '50% 35%' },
  { src: '/images/people/friends-swap.jpg', alt: 'Friends swapping clothes', pos: '50% 30%' },
];

const FEATURES = [
  { n: '01', title: 'One of a kind', text: 'Every listing is a single piece. Once it is gone, it is gone.' },
  { n: '02', title: 'Live auctions', text: 'Rare and collector pieces go to auction with an estimate, a provenance line and a condition report.' },
  { n: '03', title: 'Style tools', text: 'Upload an outfit to find pieces that go with it, or ask the AI stylist what to wear.' },
  { n: '04', title: 'Real people', text: 'Chat with sellers about fit and condition, and earn badges as you buy, sell and bid.' },
];

const PRINCIPLES = [
  { title: 'Honest descriptions', text: 'Clear photos and plain condition notes, so you know what you are getting.' },
  { title: 'Fair prices', text: 'Fixed prices for everyday pieces, and open bidding for rare ones.' },
  { title: 'Less waste', text: 'Every piece that finds a new owner is one less in the bin and one less made new.' },
];

// Live numbers straight from the shop, so the page never goes out of date.
const useShopNumbers = () => {
  const [numbers, setNumbers] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = process.env.REACT_APP_LOCAL_URL;
        const [shop, lots] = await Promise.all([
          axios.get(`${base}/api/product/catalogue?limit=60`),
          axios.get(`${base}/api/biddingProduct/get`),
        ]);
        const products = Array.isArray(shop.data) ? shop.data : shop.data.products || [];
        const now = Date.now();
        if (cancelled) return;
        setNumbers({
          pieces: products.filter((p) => !p.isSold).length,
          sellers: new Set(products.map((p) => p.owner && p.owner._id).filter(Boolean)).size,
          auctions: (lots.data || []).filter((l) => new Date(l.bidEndTime).getTime() > now).length,
        });
      } catch {
        if (!cancelled) setNumbers(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return numbers;
};

const AboutUsPage = () => {
  const navigate = useNavigate();
  const numbers = useShopNumbers();

  return (
    <Layout>
      {/* hero */}
      <section className="ab-hero">
        <div className="ab-hero__in">
          <p className="rr-eyebrow">About Rewind &amp; Revive</p>
          <h1>
            A second life for the clothes <em>already in the world.</em>
          </h1>
          <p className="ab-hero__lead">
            Rewind &amp; Revive is a marketplace for pre-loved fashion: clothes, jewellery and
            accessories, each one of a kind. Buy at a fixed price, bid on rare pieces, or sell
            what you no longer wear.
          </p>
        </div>
        <div className="ab-strip" aria-label="Photos of people shopping pre-loved fashion">
          {STRIP.map((p, i) => (
            <img key={p.src} src={p.src} alt={p.alt} style={{ objectPosition: p.pos }} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
          ))}
        </div>
      </section>

      {/* why */}
      <section className="rr-sec rr-sec--light" aria-label="Why we exist">
        <div className="rr-sec__in ab-why">
          <div>
            <p className="rr-eyebrow">Why it exists</p>
            <h2 className="rr-h2">Good clothes shouldn&rsquo;t sit <em>in the dark.</em></h2>
            <p>
              Most of us own pieces we rarely wear. Donation bins are a guess, and scrolling
              through thousands of near-identical listings is tiring.
            </p>
            <p>
              Rewind &amp; Revive gives each piece a proper listing: clear photos, an honest
              condition note, and a seller you can talk to before you decide. Rare pieces go to
              auction, so the people who want them most can bid for them.
            </p>
            <Link to="/catalogue" className="ab-link">Browse the shop &rarr;</Link>
          </div>
          <figure className="ab-why__photo">
            <img src="/images/people/two-women.jpg" alt="Two friends browsing a thrift shop together" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>

      {/* what's different */}
      <section className="rr-sec rr-sec--paper" aria-label="What makes it different">
        <div className="rr-sec__in">
          <header className="rr-sec__head">
            <p className="rr-eyebrow">What makes it different</p>
            <h2 className="rr-h2">Four things you won&rsquo;t find on <em>a rack.</em></h2>
          </header>
          <ol className="ab-features">
            {FEATURES.map((f) => (
              <li key={f.n}>
                <span>{f.n}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* live numbers */}
      {numbers && (
        <section className="ab-numbers" aria-label="The shop right now">
          <div className="rr-sec__in">
            <p className="rr-eyebrow rr-eyebrow--lav">The shop right now</p>
            <dl>
              <div><dt>Pieces for sale</dt><dd>{numbers.pieces}</dd></div>
              <div><dt>Open auctions</dt><dd>{numbers.auctions}</dd></div>
              <div><dt>Active sellers</dt><dd>{numbers.sellers}</dd></div>
            </dl>
          </div>
        </section>
      )}

      {/* principles */}
      <section className="rr-sec rr-sec--light" aria-label="Our principles">
        <div className="rr-sec__in">
          <header className="rr-sec__head rr-sec__head--center">
            <p className="rr-eyebrow">How we keep it fair</p>
            <h2 className="rr-h2">Three promises, <em>kept simple.</em></h2>
          </header>
          <ul className="ab-principles">
            {PRINCIPLES.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* closing */}
      <section className="ab-cta" aria-label="Get started">
        <div className="ab-cta__in">
          <h2>Find your next favourite piece, <em>or pass one on.</em></h2>
          <div className="ab-cta__buttons">
            <button className="rr-btn rr-btn--light" onClick={() => navigate('/catalogue')}>Shop the rack</button>
            <button className="rr-btn ab-btn-outline" onClick={() => navigate('/bidProduct')}>See live auctions</button>
            <button className="rr-btn ab-btn-outline" onClick={() => navigate('/createproduct')}>Start selling</button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutUsPage;
