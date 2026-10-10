import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import Layout from '../Layout/layout';
import { formatMoney, bidIncrement } from '../../utils/money';
import './lotPage.css';

const pad = (n) => String(n).padStart(2, '0');

const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

// Lot state from the clock: pending, live or ended.
const useClock = (start, end) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = start ? new Date(start).getTime() : 0;
  const e = end ? new Date(end).getTime() : 0;
  const parts = (ms) => ({
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  });
  if (now < s) return { state: 'pending', parts: parts(s - now), urgent: false };
  if (now > e) return { state: 'ended', parts: null, urgent: false };
  return { state: 'live', parts: parts(e - now), urgent: e - now < 3600000 };
};

// ----- gallery -----
const Gallery = ({ images, name }) => {
  const list = useMemo(() => {
    if (!images) return ['/placeholder.jpg'];
    if (Array.isArray(images)) return images.length ? images : ['/placeholder.jpg'];
    return [images];
  }, [images]);
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [list.length]);

  return (
    <div className="lp-gallery">
      {list.length > 1 && (
        <div className="lp-thumbs">
          {list.map((src, i) => (
            <button key={src + i} className={active === i ? 'is-on' : ''} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
      <div className="lp-gallery__main">
        <img src={list[active]} alt={name} />
      </div>
    </div>
  );
};

// ----- page -----
const BiddingProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidders, setBidders] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'error' });

  const showSnack = (msg, severity = 'error') => setSnack({ open: true, msg, severity });

  const fetchBidders = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/bid/${id}`);
      const data = await res.json();
      if (Array.isArray(data)) setBidders(data);
    } catch (e) {
      console.error('Error fetching bidders:', e);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/${id}`);
        setProduct(await res.json());
      } catch (e) {
        console.error('Error fetching product:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    fetchBidders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // More lots from the same collection (falls back to any other lots).
  useEffect(() => {
    if (!product) return;
    (async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`);
        const all = await res.json();
        if (!Array.isArray(all)) return;
        const others = all.filter((l) => l._id !== id && l.images?.[0]);
        const same = others.filter((l) => product.lotCollection && l.lotCollection === product.lotCollection);
        const rest = others.filter((l) => !same.includes(l));
        setRelated([...same, ...rest].slice(0, 4));
      } catch (e) {
        console.error('Error fetching related lots:', e);
      }
    })();
  }, [product, id]);

  const clock = useClock(product?.bidStartTime, product?.bidEndTime);
  const isLive = clock.state === 'live';
  const isEnded = clock.state === 'ended';

  const highestBid = bidders.length > 0 ? bidders[0].bidAmount : null;
  const currentBid = highestBid || product?.startingPrice || 0;
  const inc = bidIncrement(currentBid);
  const minNextBid = highestBid ? currentBid + inc : product?.startingPrice || 1;
  const quick = [minNextBid, minNextBid + inc, minNextBid + inc * 4];

  const handlePlaceBid = async () => {
    if (!localStorage.getItem('token')) {
      showSnack('Log in to place a bid');
      return;
    }
    if (!bidAmount) {
      showSnack('Enter a bid amount');
      return;
    }
    if (Number(bidAmount) < minNextBid) {
      showSnack(`Bid must be at least ${formatMoney(minNextBid)}`);
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: localStorage.getItem('token') },
        body: JSON.stringify({ productId: id, bidAmount: Number(bidAmount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        showSnack(data.message || 'Failed to place bid');
        return;
      }
      setBidAmount('');
      showSnack('Bid placed. You are the high bidder.', 'success');
      fetchBidders();
    } catch (e) {
      console.error('Error placing bid:', e);
      showSnack('Something went wrong. Try again.');
    }
  };

  if (loading || !product) {
    return (
      <Layout>
        <div className="lp-loading">Loading lot…</div>
      </Layout>
    );
  }

  const highestBidderOnly = product.biddingModel === 'Highest Bidder';
  const leaders = highestBidderOnly ? bidders.slice(0, 1) : bidders.slice(0, 3);
  const provenance = product.provenance ? product.provenance.replace(/^Sample lot\.\s*/i, '') : '';
  const hasEstimate = product.estimateLow && product.estimateHigh;

  return (
    <Layout>
      <div className="lp-page">
        <nav className="lp-crumbs" aria-label="Breadcrumb">
          <Link to="/bidProduct">Auctions</Link>
          <span>/</span>
          {product.lotCollection && (<><span>{product.lotCollection}</span><span>/</span></>)}
          <b>{product.name}</b>
        </nav>

        <div className="lp-grid">
          <Gallery images={product.images} name={product.name} />

          <aside className="lp-panel" aria-label="Bidding">
            <div className="lp-panel__top">
              <span className="lp-lotno">{product.lotCollection || 'Lot'}</span>
            </div>
            <h1>{product.name}</h1>
            {provenance && (
              <p className="lp-prov"><span>Provenance</span>{provenance}</p>
            )}

            <dl className="lp-price">
              {hasEstimate && (<><dt>Estimate</dt><dd>{formatMoney(product.estimateLow)} &ndash; {formatMoney(product.estimateHigh)}</dd></>)}
              <dt>{isEnded && product.soldFor ? 'Sold for' : highestBid ? 'Current bid' : 'Opening bid'}</dt>
              <dd className="lp-price__big">{formatMoney(isEnded && product.soldFor ? product.soldFor : currentBid)}</dd>
            </dl>

            {clock.parts && (
              <div className={`lp-clock ${clock.urgent ? 'is-urgent' : ''}`} aria-label={isLive ? 'Time left' : 'Starts in'}>
                <p>{isLive ? 'Closes in' : 'Opens in'}</p>
                <div>
                  {[['d', 'days'], ['h', 'hrs'], ['m', 'min'], ['s', 'sec']].map(([k, label]) => (
                    <span key={k}><b>{pad(clock.parts[k])}</b><small>{label}</small></span>
                  ))}
                </div>
              </div>
            )}

            {isEnded ? (
              <p className="lp-closed">This lot has closed.{product.soldFor ? ' It sold at the price shown above.' : ''}</p>
            ) : (
              <div className="lp-bid">
                <div className="lp-quick">
                  {quick.map((amt) => (
                    <button key={amt} onClick={() => setBidAmount(String(amt))} disabled={!isLive}>{formatMoney(amt)}</button>
                  ))}
                </div>
                <div className="lp-bid__row">
                  <label htmlFor="bid" className="lp-bid__field">
                    <span>$</span>
                    <input
                      id="bid"
                      inputMode="numeric"
                      placeholder={`${minNextBid} or more`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      disabled={!isLive}
                    />
                  </label>
                  <button className="lp-bid__go" onClick={handlePlaceBid} disabled={!isLive}>
                    {isLive ? 'Place bid' : 'Not started'}
                  </button>
                </div>
                <p className="lp-hint">
                  {bidders.length} {bidders.length === 1 ? 'bid' : 'bids'} so far &middot; {highestBidderOnly ? 'Highest bidder wins' : 'Top 3 bidders win'}
                </p>
              </div>
            )}

            {leaders.length > 0 && (
              <ol className="lp-leaders" aria-label={highestBidderOnly ? 'Leading bidder' : 'Leading bidders'}>
                {leaders.map((b, i) => (
                  <li key={b._id || i}>
                    <span className="lp-leaders__av">{b.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    <span>{b.name}<small>{i === 0 ? 'Leading' : `Rank #${i + 1}`}</small></span>
                    <b>{formatMoney(b.bidAmount)}</b>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>

        <section className="lp-essay" aria-label="Lot details">
          <div>
            <h2>About this lot</h2>
            <p>{product.description || 'No description provided.'}</p>
          </div>
          <dl className="lp-report">
            {product.condition && (<><dt>Condition report</dt><dd>{product.condition}</dd></>)}
            {product.authenticity && (<><dt>Authenticity</dt><dd>{product.authenticity}</dd></>)}
            {provenance && (<><dt>Provenance</dt><dd>{provenance}</dd></>)}
            <dt>Opens</dt><dd>{formatDateTime(product.bidStartTime)}</dd>
            <dt>Closes</dt><dd>{formatDateTime(product.bidEndTime)}</dd>
            <dt>Format</dt><dd>{product.biddingModel || 'Standard'}</dd>
          </dl>
        </section>

        {related.length > 0 && (
          <section className="lp-related" aria-label="More lots">
            <h2>More from {product.lotCollection || 'the catalogue'}</h2>
            <div className="lp-related__grid">
              {related.map((l) => (
                <Link key={l._id} to={`/biddingProduct/${l._id}`} className="lp-rel">
                  <span className="lp-rel__photo"><img src={l.images[0]} alt={l.name} loading="lazy" decoding="async" /></span>
                  <span className="lp-rel__meta">
                    <b>{l.name}</b>
                    <small>{l.estimateLow ? `${formatMoney(l.estimateLow)} – ${formatMoney(l.estimateHigh)}` : formatMoney(l.startingPrice)}</small>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </div>
    </Layout>
  );
};

export default BiddingProduct;
