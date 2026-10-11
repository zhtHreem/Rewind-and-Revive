import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layout/layout';
import './legal.css';

const Privacy = () => (
  <Layout>
    <header className="lg-hero">
      <div className="lg-hero__in">
        <p className="lg-eyebrow">The small print, in plain words</p>
        <h1>Privacy &amp; <em>terms</em></h1>
        <p className="lg-lead">What this site does with your information, and the ground rules for using it. Last updated October 2026.</p>
      </div>
    </header>

    <article className="lg-body">
      <h2>What we collect</h2>
      <ul>
        <li><b>Your account.</b> A username, your email address, and a password. Passwords are stored scrambled, never in readable form. If you sign in with Google, we receive the name and email Google shares with us.</li>
        <li><b>What you do on the site.</b> Items and photos you list, bids you place, messages with sellers, ratings and badges, and a record of each order.</li>
        <li><b>In your browser.</b> Your login, your bag and your favourites are kept in your browser&rsquo;s storage, and a session cookie keeps you signed in. Clearing your browser data removes them.</li>
      </ul>

      <h2>Payments</h2>
      <p>Card payments are handled by Stripe. We never see or store your full card number. We keep a record of each order: the item, the amount, the buyer and the seller.</p>

      <h2>Photos you upload</h2>
      <p>Photos for listings and auctions are stored with an image-hosting service so they can be shown on the site. Please only upload photos you have the right to share.</p>

      <h2>Revi, the style assistant</h2>
      <p>When you chat with Revi, your messages, and a photo if you add one, are sent to Google&rsquo;s Gemini service so it can write a reply. We don&rsquo;t save your chats on our servers. Your recent messages stay in your browser and are sent along with each question so Revi can follow the conversation.</p>
      <p>Revi uses Google&rsquo;s free tier. Under Google&rsquo;s terms for that tier, content sent to it may be used to improve Google&rsquo;s products, and people may review it. <b>So please don&rsquo;t share personal or sensitive information, or photos of identifiable people, with Revi.</b></p>

      <h2>Emails</h2>
      <p>We use your email address to verify your account and to send messages about your account or orders. We don&rsquo;t send marketing newsletters.</p>

      <h2>Who else sees your data</h2>
      <p>We don&rsquo;t sell your data. The services that help run the site can process it on our behalf: Stripe for payments, Google for sign-in and for Revi, a hosted database, and an image host.</p>

      <h2>Your choices</h2>
      <p>You can ask us to correct or delete your account and the information tied to it. <Link to="/contact">Contact us</Link> and we&rsquo;ll take care of it.</p>

      <h2>Ground rules</h2>
      <ul>
        <li><b>Be honest.</b> Describe items accurately and only list things you own and are free to sell.</li>
        <li><b>One of a kind.</b> Each listing is a single piece. Once it is sold, it is gone.</li>
        <li><b>Auctions.</b> A bid is an offer to buy. When an auction closes, the winner is decided by the format shown on that lot. Prices are in US dollars.</li>
        <li><b>Play fair.</b> No fake bids, harassment, scraping, or misuse of Revi.</li>
      </ul>
      <p>We may remove listings or accounts that break these rules.</p>
    </article>
  </Layout>
);

export default Privacy;
