import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import './sections.css';

// Highlights the things only this shop does. `onOpenChat` opens the Revi chatbot.
export default function Features({ onOpenChat }) {
  const navigate = useNavigate();

  return (
    <section className="rr-sec rr-sec--tint" aria-label="Shop smarter">
      <div className="rr-sec__in">
        <header className="rr-sec__head">
          <p className="rr-eyebrow">Shop smarter</p>
          <h2 className="rr-h2">Not just a rack. A <em>stylist</em> in your pocket.</h2>
        </header>

        <div className="rr-feat">
          <article className="rr-feat__card rr-feat__match">
            <img src="/images/people/mirror-styling.jpg" alt="Two friends styling outfits in front of a mirror" loading="lazy" decoding="async" />
            <div className="rr-feat__body">
              <p className="rr-eyebrow">Match my outfit</p>
              <h3>Show us what you&rsquo;re wearing. We&rsquo;ll find what goes with it.</h3>
              <p>Open any piece, upload a photo of your outfit, and get matching pieces from the shop.</p>
              <button className="rr-btn rr-btn--solid" onClick={() => navigate('/catalogue')}>Browse the rack</button>
            </div>
          </article>

          <article className="rr-feat__card rr-feat__chat">
            <p className="rr-eyebrow">Meet Revi</p>
            <h3>Ask anything. Get a look.</h3>
            <div className="rr-bubbles" aria-label="Example conversation">
              <span className="rr-bubble rr-bubble--me">What goes with wide-leg jeans?</span>
              <span className="rr-bubble rr-bubble--bot">A tucked-in tee and a cropped jacket. Want me to pull matching pieces?</span>
            </div>
            <button className="rr-btn rr-btn--ghost" onClick={onOpenChat}>Chat with Revi</button>
          </article>

          <article className="rr-feat__card rr-feat__small">
            <ChatBubbleOutlineIcon />
            <h3>Talk to the seller</h3>
            <p>Ask about fit and condition in chat before you decide.</p>
          </article>

          <article className="rr-feat__card rr-feat__small">
            <EmojiEventsOutlinedIcon />
            <h3>Earn badges</h3>
            <p>Buy, sell and bid to unlock badges that show on your profile.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
