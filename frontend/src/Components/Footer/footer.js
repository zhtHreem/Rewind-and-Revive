import React from 'react';
import { Link } from 'react-router-dom';
import logoDark from '../../assets/brand/logo-dark.svg';
import './footer.css';

const GROUPS = [
  {
    title: 'Shop',
    links: [
      { to: '/catalogue', label: 'All pieces' },
      { to: '/catalogue?category=women', label: 'Women' },
      { to: '/catalogue?category=men', label: 'Men' },
      { to: '/catalogue?type=accessories', label: 'Jewellery & accessories' },
      { to: '/bidProduct', label: 'Auctions' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { to: '/createproduct', label: 'List an item' },
      { to: '/create', label: 'Create an auction' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/AboutUs', label: 'About us' },
      { to: '/contact', label: 'Contact' },
      { to: '/privacy', label: 'Privacy & terms' },
    ],
  },
];

const Footer = () => (
  <footer className="rf">
    <div className="rf__in">
      <div className="rf__brand">
        <Link to="/" aria-label="Rewind & Revive home">
          <img src={logoDark} alt="Rewind & Revive" />
        </Link>
        <p>One-of-a-kind pre-loved fashion. Buy it, bid on it, or pass it on.</p>
      </div>

      {GROUPS.map((group) => (
        <nav key={group.title} className="rf__group" aria-label={group.title}>
          <h3>{group.title}</h3>
          <ul>
            {group.links.map((l) => (
              <li key={l.to + l.label}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>

    <div className="rf__bar">
      <span>&copy; {new Date().getFullYear()} Rewind &amp; Revive</span>
      <span>Every piece, one of a kind.</span>
    </div>
  </footer>
);

export default Footer;
