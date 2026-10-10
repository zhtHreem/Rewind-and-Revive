import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Home/sections.css';
import { formatMoney } from '../../utils/money';

const money = formatMoney;

const useNow = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

// Status chip text: a live countdown while open, "Closed" afterwards.
const status = (endTime, now) => {
  const diff = (endTime ? new Date(endTime).getTime() : 0) - now;
  if (diff <= 0) return { open: false, label: 'Closed', urgent: false };
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return { open: true, label: `${d}d ${h}h left`, urgent: false };
  if (h > 0) return { open: true, label: `${h}h ${m}m left`, urgent: false };
  return { open: true, label: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} left`, urgent: true };
};

const Chip = ({ lot, now }) => {
  const st = status(lot.bidEndTime, now);
  return (
    <span className={`rr-auc__chip ${st.open ? 'is-open' : 'is-closed'} ${st.urgent ? 'is-urgent' : ''}`}>
      {st.open && <i />}
      {st.label}
    </span>
  );
};

const Bidding = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = useNow();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`);
        if (!cancelled) setLots(response.data || []);
      } catch (error) {
        console.error('Error fetching bidding products:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Open lots first (ending soonest), then the most recently closed.
  const shown = useMemo(() => {
    const withImage = lots.filter((l) => l.images && l.images[0]);
    const end = (l) => new Date(l.bidEndTime).getTime();
    const open = withImage.filter((l) => end(l) > now).sort((a, b) => end(a) - end(b));
    const closed = withImage.filter((l) => end(l) <= now).sort((a, b) => end(b) - end(a));
    return [...open, ...closed].slice(0, 5);
  }, [lots, now]);

  if (!loading && shown.length === 0) return null;

  const [feature, ...rest] = shown;
  const anyOpen = shown.some((l) => status(l.bidEndTime, now).open);

  return (
    <section className="rr-sec rr-sec--ink" aria-label="Celebrity and collector auctions">
      <div className="rr-sec__in">
        <header className="rr-auc__head">
          <div>
            <p className="rr-eyebrow rr-eyebrow--lav">The auction issue</p>
            <h2 className="rr-h2 rr-h2--light">
              Celebrity &amp; <em>collector</em> auctions
            </h2>
            <p className="rr-auc__sub">
              Rare pieces with a story. Everyday finds live in the shop at a fixed price.
            </p>
          </div>
          <Link to="/bidProduct" className="rr-auc__all">
            Open the auction issue &rarr;
          </Link>
        </header>

        {loading ? (
          <div className="rr-auc rr-auc--skeleton" aria-hidden="true" />
        ) : (
          <div className="rr-auc">
            <Link to={`/biddingProduct/${feature._id}`} className="rr-auc__feature">
              <img src={feature.images[0]} alt={feature.name} loading="lazy" decoding="async" />
              <span className="rr-auc__shade" />
              <span className="rr-auc__no">Lot 01</span>
              <Chip lot={feature} now={now} />
              <span className="rr-auc__info">
                <b>{feature.name}</b>
                <small>{anyOpen ? 'Opening bid' : 'Final listing'} {money(feature.startingPrice)}</small>
                <span className="rr-auc__cta">View lot &rarr;</span>
              </span>
            </Link>

            <div className="rr-auc__grid">
              {rest.map((lot, i) => (
                <Link key={lot._id} to={`/biddingProduct/${lot._id}`} className="rr-auc__tile">
                  <span className="rr-auc__photo">
                    <img src={lot.images[0]} alt={lot.name} loading="lazy" decoding="async" />
                    <span className="rr-auc__no">Lot {String(i + 2).padStart(2, '0')}</span>
                    <Chip lot={lot} now={now} />
                  </span>
                  <span className="rr-auc__meta">
                    <b>{lot.name}</b>
                    <small>{money(lot.startingPrice)}</small>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Bidding;
