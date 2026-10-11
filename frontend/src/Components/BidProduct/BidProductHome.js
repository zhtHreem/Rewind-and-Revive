import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../Layout/layout';
import { LotCardSkeleton, AuctionFeatureSkeleton } from '../Skeleton/Skeleton';
import './auctionIssue.css';
import { loadAuctions } from '../Home/useHomeProducts';
import { formatMoney } from '../../utils/money';

const useNow = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const pad = (n) => String(n).padStart(2, '0');
const money = formatMoney;
const lotNo = (i) => pad(i + 1);

const timeLeft = (endTime, now) => {
  const diff = (endTime ? new Date(endTime).getTime() : 0) - now;
  if (diff <= 0) return { open: false, label: 'Closed', parts: null, urgent: false };
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const label = d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${pad(m)}:${pad(s)} left`;
  return { open: true, label, parts: { d, h, m, s }, urgent: diff < 3600000 };
};

const estimate = (lot) =>
  lot.estimateLow && lot.estimateHigh ? `${money(lot.estimateLow)} – ${money(lot.estimateHigh)}` : null;

const Chip = ({ lot, now }) => {
  const t = timeLeft(lot.bidEndTime, now);
  return (
    <span className={`ai-chip ${t.open ? '' : 'is-closed'} ${t.urgent ? 'is-urgent' : ''}`}>
      {t.open && <i className="ai-dot" />}
      {t.label}
    </span>
  );
};

// ----- stage-curtain header -----
const Header = ({ openCount, nextClose, now, collections, active, onPick }) => {
  const next = nextClose ? timeLeft(nextClose, now) : null;
  return (
    <header className="ai-hero">
      <div
        className="ai-hero__bg"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/lots/stage-curtain.jpg)` }}
        aria-hidden="true"
      />
      <div className="ai-hero__in">
        <p className="ai-eyebrow ai-eyebrow--lav">The auction issue · No. 01</p>
        <h1>
          Lots with a <em>story.</em>
        </h1>
        <p className="ai-hero__lead">
          Gowns, stage pieces, timepieces and jewels. Every lot lists where it came from, what it
          should fetch and what condition it&rsquo;s in.
        </p>
        <ul className="ai-hero__facts">
          <li><b>{openCount}</b> lots open</li>
          {next && next.open && <li>Next lot closes in <b>{next.label.replace(' left', '')}</b></li>}
          <li>Highest bidder wins</li>
        </ul>
        <div className="ai-chips" role="tablist" aria-label="Collections">
          {['All', ...collections].map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              className={active === c ? 'is-on' : ''}
              onClick={() => onPick(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

// ----- featured lot -----
const Feature = ({ lot, now }) => {
  const navigate = useNavigate();
  const t = timeLeft(lot.bidEndTime, now);
  return (
    <section className="ai-feature" aria-label="Featured lot">
      <Link to={`/biddingProduct/${lot._id}`} className="ai-feature__photo">
        <img src={lot.images?.[0]} alt={lot.name} />
        <span className="ai-tag">Lot 01</span>
      </Link>
      <div className="ai-feature__body">
        <p className="ai-eyebrow">{lot.lotCollection || 'Featured lot'}</p>
        <h2>{lot.name}</h2>
        {lot.provenance && (
          <blockquote>
            <span>Provenance</span>
            {lot.provenance.replace(/^Sample lot\.\s*/i, '')}
          </blockquote>
        )}
        <dl className="ai-facts">
          {estimate(lot) && (<><dt>Estimate</dt><dd>{estimate(lot)}</dd></>)}
          <dt>Opening bid</dt><dd>{money(lot.startingPrice)}</dd>
          {lot.condition && (<><dt>Condition</dt><dd>{lot.condition}</dd></>)}
          {lot.authenticity && (<><dt>Authenticity</dt><dd>{lot.authenticity}</dd></>)}
        </dl>
        {t.open && t.parts && (
          <div className="ai-clock" aria-label={t.label}>
            {[['d', 'days'], ['h', 'hrs'], ['m', 'min'], ['s', 'sec']].map(([k, label]) => (
              <span key={k}><b>{pad(t.parts[k])}</b><small>{label}</small></span>
            ))}
          </div>
        )}
        <button className="ai-btn" onClick={() => navigate(`/biddingProduct/${lot._id}`)}>
          {t.open ? 'Place a bid' : 'View lot'} &rarr;
        </button>
      </div>
    </section>
  );
};

// ----- catalogue card -----
const LotCard = ({ lot, index, now }) => {
  const navigate = useNavigate();
  const t = timeLeft(lot.bidEndTime, now);
  return (
    <article
      className={`ai-lot ${t.open ? '' : 'is-past'}`}
      onClick={() => navigate(`/biddingProduct/${lot._id}`)}
    >
      <div className="ai-lot__photo">
        <img src={lot.images?.[0] || '/placeholder.jpg'} alt={lot.name} loading="lazy" decoding="async" />
        <span className="ai-tag">Lot {lotNo(index)}</span>
        <Chip lot={lot} now={now} />
      </div>
      <div className="ai-lot__body">
        {lot.lotCollection && <p className="ai-lot__coll">{lot.lotCollection}</p>}
        <h3>{lot.name}</h3>
        {lot.provenance ? (
          <p className="ai-lot__prov">{lot.provenance.replace(/^Sample lot\.\s*/i, '')}</p>
        ) : (
          <p className="ai-lot__prov">{lot.description || ' '}</p>
        )}
        <div className="ai-lot__row">
          <div>
            <small>{!t.open && lot.soldFor ? 'Sold for' : estimate(lot) ? 'Estimate' : 'Starting bid'}</small>
            <b>{!t.open && lot.soldFor ? money(lot.soldFor) : estimate(lot) || money(lot.startingPrice)}</b>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/biddingProduct/${lot._id}`);
            }}
          >
            {t.open ? 'Bid' : 'View'}
          </button>
        </div>
      </div>
    </article>
  );
};


// ----- page -----
const BidProductHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('ending');
  const [collection, setCollection] = useState('All');
  const now = useNow();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await loadAuctions();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const end = (p) => new Date(p.bidEndTime).getTime();

  const collections = useMemo(
    () => [...new Set(products.map((p) => p.lotCollection).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    let list = products;
    if (collection !== 'All') list = list.filter((p) => p.lotCollection === collection);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.provenance?.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    switch (sort) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'priceLow':
        sorted.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
        break;
      case 'priceHigh':
        sorted.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
        break;
      case 'ending':
      default:
        sorted.sort((a, b) => end(a) - end(b));
        break;
    }
    return sorted;
  }, [products, query, sort, collection]);

  // Open lots first; closed lots are shown separately as "past lots".
  const open = filtered.filter((p) => end(p) > now);
  const past = filtered.filter((p) => end(p) <= now);
  const allOpen = products.filter((p) => end(p) > now).sort((a, b) => end(a) - end(b));
  const featured = allOpen.find((p) => p.images?.[0] && p.provenance) || allOpen.find((p) => p.images?.[0]);

  return (
    <Layout>
      <div className="ai-page">
        <Header
          openCount={allOpen.length}
          nextClose={allOpen[0]?.bidEndTime}
          now={now}
          collections={collections}
          active={collection}
          onPick={setCollection}
        />

        {loading && <AuctionFeatureSkeleton />}
        {!loading && featured && collection === 'All' && !query && <Feature lot={featured} now={now} />}

        <section className="ai-contents" aria-label="All lots">
          <div className="ai-contents__head">
            <div>
              <p className="ai-eyebrow">Catalogue</p>
              <h2>{collection === 'All' ? 'Every open lot' : collection}</h2>
            </div>
            <div className="ai-tools">
              <span>{loading ? 'Loading lots…' : `${open.length} open · ${past.length} past`}</span>
              <input
                type="search"
                placeholder="Search lots"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search lots"
              />
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort lots">
                <option value="ending">Ending soon</option>
                <option value="newest">Newly listed</option>
                <option value="priceLow">Price: low to high</option>
                <option value="priceHigh">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="ai-grid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <LotCardSkeleton key={i} />)
            ) : open.length === 0 ? (
              <p className="ai-empty">
                {query ? `Nothing matches "${query}".` : 'No open lots right now. New pieces are listed every day.'}
              </p>
            ) : (
              open.map((lot, i) => <LotCard key={lot._id} lot={lot} index={i} now={now} />)
            )}
          </div>

          {!loading && past.length > 0 && (
            <>
              <div className="ai-contents__head ai-contents__head--past">
                <div>
                  <p className="ai-eyebrow">Archive</p>
                  <h2>Past lots</h2>
                </div>
              </div>
              <div className="ai-grid">
                {past.map((lot, i) => (
                  <LotCard key={lot._id} lot={lot} index={open.length + i} now={now} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default BidProductHome;
