import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/layout';
import { formatMoney } from '../../utils/money';
import './profile.css';
import { ProfileSkeleton } from '../Skeleton/Skeleton';

const badgeImages = {
  'Starter Seller': require('./badges/startseller.png'),
  'Rising Star': require('./badges/star.png'),
  'Market Leader': require('./badges/marketleader.png'),
  'Popularity Pro': require('./badges/popularitypro.png'),
  'Top Seller': require('./badges/sell.png'),
  'Customer Choice': require('./badges/bestseller.png'),
  'First Purchase': require('./badges/firstpurchase.png'),
  'Frequent Buyer': require('./badges/frequentpurchase.png'),
  'Loyal Shopper': require('./badges/loyalshopper.png'),
  'Big Spender': require('./badges/bigspender.png'),
  'Ultimate Collector': require('./badges/ultimatecollector.png'),
  'Shopping Spree': require('./badges/shoppingspree.png'),
};

const monthYear = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');

// Average of the star counts, computed here so viewing a profile never writes to the database.
const ratingFrom = (reviews = {}) => {
  const counts = [reviews.oneStar, reviews.twoStar, reviews.threeStar, reviews.fourStar, reviews.fiveStar].map((n) => n || 0);
  const total = counts.reduce((a, b) => a + b, 0);
  const sum = counts.reduce((acc, n, i) => acc + n * (i + 1), 0);
  return { total, average: total ? sum / total : 0, counts };
};

const Stars = ({ value }) => (
  <span className="pf-stars" aria-label={`${value.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <i key={n} className={value >= n - 0.25 ? 'is-on' : ''}>&#9733;</i>
    ))}
  </span>
);

// ----- tabs -----
const ProductGrid = ({ items, empty }) =>
  items.length === 0 ? (
    <p className="pf-empty">{empty}</p>
  ) : (
    <div className="pf-grid">
      {items.map((p) => (
        <Link key={p._id} to={`/product/${p._id}`} className={`pf-card ${p.isSold ? 'is-sold' : ''}`}>
          <span className="pf-card__photo">
            <img src={p.images?.[0] || '/placeholder.jpg'} alt={p.name} loading="lazy" decoding="async" />
            {p.isSold && <em>Sold</em>}
          </span>
          <span className="pf-card__meta">
            <b>{p.name}</b>
            <small>{formatMoney(p.price)}</small>
          </span>
        </Link>
      ))}
    </div>
  );

const BadgeGroup = ({ title, badges }) => (
  <section className="pf-badges__group">
    <h3>{title}</h3>
    {badges.length === 0 ? (
      <p className="pf-empty">No badges yet.</p>
    ) : (
      <ul>
        {badges.map((b) => (
          <li key={b.name} className={b.isAchieved ? 'is-on' : ''} title={b.description}>
            <img src={badgeImages[b.name]} alt="" />
            <b>{b.name}</b>
            <small>{b.isAchieved ? 'Unlocked' : b.description || 'Locked'}</small>
          </li>
        ))}
      </ul>
    )}
  </section>
);

// Private numbers, shown only on your own profile.
const Dashboard = ({ stats, rating }) => (
  <div className="pf-dash">
    <dl className="pf-dash__tiles">
      <div><dt>Total earned</dt><dd>{formatMoney(stats.totalEarned)}</dd></div>
      <div><dt>Total spent</dt><dd>{formatMoney(stats.totalSpent)}</dd></div>
      <div><dt>Items bought</dt><dd>{stats.itemsBought || 0}</dd></div>
      <div><dt>Items listed</dt><dd>{stats.totalListed || 0}</dd></div>
    </dl>
    <div className="pf-dash__row">
      <section>
        <h3>Sold vs listed</h3>
        <div className="pf-bar"><span style={{ width: `${stats.totalListed ? Math.min(100, (stats.productsSold / stats.totalListed) * 100) : 0}%` }} /></div>
        <p>{stats.productsSold || 0} of {stats.totalListed || 0} listings sold</p>
      </section>
      <section>
        <h3>Ratings</h3>
        {rating.total === 0 ? (
          <p>No ratings yet.</p>
        ) : (
          [5, 4, 3, 2, 1].map((n) => (
            <div className="pf-rate" key={n}>
              <span>{n}&#9733;</span>
              <div className="pf-bar"><span style={{ width: `${(rating.counts[n - 1] / rating.total) * 100}%` }} /></div>
              <b>{rating.counts[n - 1]}</b>
            </div>
          ))
        )}
      </section>
    </div>
  </div>
);

// ----- page -----
const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState(token ? 'loading' : 'signin');
  const [tab, setTab] = useState('sale');

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    (async () => {
      try {
        setStatus('loading');
        const base = process.env.REACT_APP_LOCAL_URL;
        const [p, list] = await Promise.all([
          axios.get(`${base}/api/user/profile/${id}`, { headers: { Authorization: token } }),
          axios.get(`${base}/api/product/by-owner/${id}`),
        ]);
        if (cancelled) return;
        setProfile(p.data);
        setProducts(list.data || []);
        setStatus('ready');
      } catch (e) {
        if (!cancelled) setStatus(e.response && [401, 403].includes(e.response.status) ? 'signin' : 'error');
      }
    })();
    return () => { cancelled = true; };
  }, [id, token]);

  const forSale = useMemo(() => products.filter((p) => !p.isSold), [products]);
  const sold = useMemo(() => products.filter((p) => p.isSold), [products]);
  const rating = useMemo(() => ratingFrom(profile?.reviewsData), [profile]);

  if (status === 'loading') {
    return (<Layout><ProfileSkeleton /></Layout>);
  }
  if (status === 'signin' || status === 'error') {
    return (
      <Layout>
        <div className="pf-state">
          <h1>{status === 'signin' ? 'Log in to view profiles' : 'We couldn’t load this profile'}</h1>
          <p>{status === 'signin' ? 'Sign in to see sellers, their pieces and their badges.' : 'Please try again in a moment.'}</p>
          <button className="rr-btn rr-btn--solid" onClick={() => navigate(status === 'signin' ? '/login' : '/catalogue')}>
            {status === 'signin' ? 'Log in' : 'Back to the shop'}
          </button>
        </div>
      </Layout>
    );
  }

  const stats = profile.stats || {};
  const tabs = [
    { key: 'sale', label: `For sale (${forSale.length})` },
    { key: 'sold', label: `Sold (${sold.length})` },
    { key: 'badges', label: 'Badges' },
    ...(profile.isOwnProfile ? [{ key: 'dash', label: 'Dashboard' }] : []),
  ];

  return (
    <Layout>
      <header className="pf-hero">
        <div className="pf-hero__in">
          <span className="pf-avatar" aria-hidden="true">{profile.username.charAt(0).toUpperCase()}</span>
          <div className="pf-hero__text">
            <p className="rr-eyebrow">{profile.isOwnProfile ? 'Your profile' : 'Seller'}</p>
            <h1>{profile.username}</h1>
            <p className="pf-meta">
              {profile.memberSince && <>Member since {monthYear(profile.memberSince)}</>}
              <span> &middot; </span>
              {rating.total ? <><Stars value={rating.average} /> {rating.average.toFixed(1)} ({rating.total})</> : 'No reviews yet'}
            </p>
            <dl className="pf-numbers">
              <div><dd>{forSale.length}</dd><dt>For sale</dt></div>
              <div><dd>{stats.productsSold || 0}</dd><dt>Sold</dt></div>
              <div><dd>{stats.likesReceived || 0}</dd><dt>Likes</dt></div>
            </dl>
          </div>
          {profile.isOwnProfile && (
            <div className="pf-actions">
              <button className="rr-btn rr-btn--solid" onClick={() => navigate('/createproduct')}>List an item</button>
              <button className="rr-btn rr-btn--ghost" onClick={() => navigate('/create')}>Create an auction</button>
            </div>
          )}
        </div>
      </header>

      <div className="pf-body">
        <div className="pf-tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'is-on' : ''} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'sale' && <ProductGrid items={forSale} empty={profile.isOwnProfile ? 'You have nothing for sale yet.' : 'Nothing for sale right now.'} />}
        {tab === 'sold' && <ProductGrid items={sold} empty="Nothing sold yet." />}
        {tab === 'badges' && (
          <div className="pf-badges">
            <BadgeGroup title="Seller badges" badges={profile.sellerBadges || []} />
            <BadgeGroup title="Shopper badges" badges={profile.userBadges || []} />
          </div>
        )}
        {tab === 'dash' && profile.isOwnProfile && <Dashboard stats={stats} rating={rating} />}
      </div>
    </Layout>
  );
};

export default UserProfilePage;
