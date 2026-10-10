import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/layout';
import SkeletonLoader from '../Utils/skeletonLoader';
import './auctionIssue.css';

// ----- countdown hook -----
const useNow = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const countdown = (endTime, now) => {
  const end = endTime ? new Date(endTime).getTime() : 0;
  const diff = Math.max(0, end - now);
  if (diff === 0) return { ended: true, label: 'Ended', urgent: false };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  let label;
  if (days > 0) label = `${days}d ${hours}h left`;
  else if (hours > 0) label = `${hours}h ${mins}m left`;
  else label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} left`;
  return { ended: false, label, urgent: diff < 3600000 };
};

const money = (n) => `Rs ${Number(n || 0).toLocaleString()}`;
const lotNo = (i) => String(i + 1).padStart(2, '0');

// ----- cover -----
const Cover = ({ lots, now }) => {
  const navigate = useNavigate();
  // Cover star: the active lot that ends soonest, otherwise the first lot.
  const featured =
    [...lots]
      .filter((p) => !countdown(p.bidEndTime, now).ended)
      .sort((a, b) => new Date(a.bidEndTime) - new Date(b.bidEndTime))[0] || lots[0];
  if (!featured) return null;
  const cd = countdown(featured.bidEndTime, now);
  const inside = lots.filter((p) => p._id !== featured._id).slice(0, 4);

  return (
    <section className="ai-cover" aria-label="Featured auction">
      <aside className="ai-cover__side ai-cover__side--left">
        <p className="ai-eyebrow">Celebrity &amp; collector auctions</p>
        <h2>
          Where the <em>big names</em> bid.
        </h2>
        <p>
          Auctions are for celebrity-owned and collector pieces: the ones with a story worth
          bidding for. Everyday finds live in the shop at a fixed price.
        </p>
        <Link className="ai-link" to="/catalogue">Shop everyday pieces &rarr;</Link>
      </aside>

      <Link to={`/biddingProduct/${featured._id}`} className="ai-cover__mag">
        <img src={featured.images?.[0]} alt={featured.name} />
        <span className="ai-cover__shade" />
        <span className="ai-cover__mast">
          REWIND
          <br />
          &amp;REVIVE
          <small>The Auction Issue · No. 01</small>
        </span>
        <span className="ai-cover__line">
          {featured.name}
          <em>Opening bid {money(featured.startingPrice)}</em>
        </span>
        <span className={`ai-cover__timer ${cd.urgent ? 'is-urgent' : ''}`}>
          {!cd.ended && <i className="ai-dot" />} {cd.label}
        </span>
        <span className="ai-cover__bar">LOT 01 · BID NOW</span>
      </Link>

      <aside className="ai-cover__side ai-cover__side--right">
        <p className="ai-eyebrow">Inside this issue</p>
        <ol className="ai-toc">
          {inside.map((p, i) => (
            <li key={p._id}>
              <button onClick={() => navigate(`/biddingProduct/${p._id}`)}>
                <span>{lotNo(i + 1)}</span>
                <b>{p.name}</b>
                <i>{money(p.startingPrice)}</i>
              </button>
            </li>
          ))}
        </ol>
        <p className="ai-eyebrow" style={{ marginTop: 22 }}>How to bid</p>
        <p className="ai-how">Pick a lot &middot; bid before the clock ends &middot; the winning bid takes it home.</p>
      </aside>
    </section>
  );
};

// ----- card -----
const LotCard = ({ product, index, now }) => {
  const navigate = useNavigate();
  const cd = countdown(product.bidEndTime, now);
  return (
    <article className="ai-lot" onClick={() => navigate(`/biddingProduct/${product._id}`)}>
      <div className="ai-lot__photo">
        <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} loading="lazy" decoding="async" />
        <span className="ai-lot__no">No. {lotNo(index)}</span>
        <span className={`ai-lot__timer ${cd.ended ? 'is-ended' : cd.urgent ? 'is-urgent' : ''}`}>
          {!cd.ended && <i className="ai-dot" />}{cd.label}
        </span>
      </div>
      <div className="ai-lot__body">
        <h3>{product.name}</h3>
        <p>{product.description || ' '}</p>
        <div className="ai-lot__row">
          <div>
            <small>Starting bid</small>
            <b>{money(product.startingPrice)}</b>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/biddingProduct/${product._id}`);
            }}
          >
            Bid now
          </button>
        </div>
      </div>
    </article>
  );
};

const LotSkeleton = () => (
  <div className="ai-lot">
    <SkeletonLoader height="300px" />
    <div className="ai-lot__body">
      <SkeletonLoader.Text lines={1} width="70%" />
      <SkeletonLoader.Text lines={1} width="40%" />
    </div>
  </div>
);

// ----- page -----
const BidProductHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('ending');
  const now = useNow();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
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
        sorted.sort((a, b) => new Date(a.bidEndTime) - new Date(b.bidEndTime));
        break;
    }
    return sorted;
  }, [products, query, sort]);

  return (
    <Layout>
      <div className="ai-page">
        {!loading && products.length > 0 && <Cover lots={products} now={now} />}

        <section className="ai-contents" aria-label="All lots">
          <div className="ai-contents__head">
            <div>
              <p className="ai-eyebrow">Contents</p>
              <h2>Every lot in this issue</h2>
            </div>
            <div className="ai-tools">
              <span>
                {loading
                  ? 'Loading lots…'
                  : `${visibleProducts.length} ${visibleProducts.length === 1 ? 'lot' : 'lots'}`}
              </span>
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
              Array.from({ length: 8 }).map((_, i) => <LotSkeleton key={i} />)
            ) : visibleProducts.length === 0 ? (
              <p className="ai-empty">
                {query ? `Nothing matches "${query}".` : 'No lots right now. New pieces are listed every day.'}
              </p>
            ) : (
              visibleProducts.map((product, i) => (
                <LotCard key={product._id} product={product} index={i} now={now} />
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default BidProductHome;
