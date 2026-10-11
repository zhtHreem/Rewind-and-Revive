import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import mark from '../../assets/brand/mark-dark.svg';
import './chatbot.css';

// The chat window loads only when someone opens it.
const Chatbot = lazy(() => import('./Chatbot'));

// Signals so other chat windows on the page (like the seller chat) and Revi never overlap.
export const OPEN_REVI = 'rr-open-revi';
export const CLOSE_REVI = 'rr-close-revi';
export const CLOSE_SELLER_CHAT = 'rr-close-seller-chat';

// Revi's button and window. It lives in the shared layout, so it appears on every page.
export default function ReviLauncher() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);

  const openRevi = useCallback(() => {
    window.dispatchEvent(new Event(CLOSE_SELLER_CHAT));
    setTeaser(false);
    setOpen(true);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener(OPEN_REVI, openRevi);
    window.addEventListener(CLOSE_REVI, close);
    return () => {
      window.removeEventListener(OPEN_REVI, openRevi);
      window.removeEventListener(CLOSE_REVI, close);
    };
  }, [openRevi]);

  // A friendly nudge, shown once per visit.
  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem('rr_revi_teased'); } catch { /* storage unavailable */ }
    if (seen) return undefined;
    const show = setTimeout(() => setTeaser(true), 2500);
    const hide = setTimeout(() => {
      setTeaser(false);
      try { sessionStorage.setItem('rr_revi_teased', '1'); } catch { /* storage unavailable */ }
    }, 11000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  return (
    <>
      {open && (
        <div className="rv-window">
          <Suspense fallback={<div className="rv-loading">Waking Revi up&hellip;</div>}>
            <Chatbot toggleChatWindow={() => setOpen(false)} />
          </Suspense>
        </div>
      )}
      <div className="rv-launch">
        <button
          type="button"
          className="rv-fab"
          onClick={() => (open ? setOpen(false) : openRevi())}
          aria-label={open ? 'Close Revi' : 'Chat with Revi, your style assistant'}
          aria-expanded={open}
        >
          <img src={mark} alt="" />
        </button>
        {teaser && !open && (
          <button type="button" className="rv-teaser" onClick={openRevi}>
            Hi, I&rsquo;m Revi! Need a style tip?
          </button>
        )}
      </div>
    </>
  );
}
