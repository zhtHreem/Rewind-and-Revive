import React, { useState } from 'react';
import { requestLogin } from '../../utils/authEvents';
import './sellerChatGate.css';

export const draftKey = (productId) => `rr_chat_draft:${productId}`;

// Shown instead of the seller chat while logged out. The visitor can write their
// message first; it is kept safely and is waiting in the chat once they log in.
const SellerChatGate = ({ productId, sellerName, onClose }) => {
  const [draft, setDraft] = useState(() => {
    try { return sessionStorage.getItem(draftKey(productId)) || ''; } catch { return ''; }
  });

  const change = (value) => {
    setDraft(value);
    try {
      if (value) sessionStorage.setItem(draftKey(productId), value);
      else sessionStorage.removeItem(draftKey(productId));
    } catch { /* storage unavailable: the text just won't be kept */ }
  };

  return (
    <div className="scg">
      <header className="scg-head">
        <span className="scg-avatar" aria-hidden="true">{(sellerName || 'S').charAt(0).toUpperCase()}</span>
        <div>
          <b>Message {sellerName || 'the seller'}</b>
          <small>Ask about fit, condition or shipping</small>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat">&times;</button>
      </header>

      <div className="scg-body">
        <label htmlFor="scg-draft">Your message</label>
        <textarea
          id="scg-draft"
          rows={5}
          maxLength={1000}
          placeholder="Hi! Is this still available? Could you tell me about the fit?"
          value={draft}
          onChange={(e) => change(e.target.value)}
        />
        <p className="scg-note">
          To send this message to the seller, you need to log in.
          {draft && ' Your message is saved, and it will be waiting for you here.'}
        </p>
      </div>

      <footer className="scg-foot">
        <button type="button" className="scg-btn" onClick={requestLogin}>Log in to send</button>
      </footer>
    </div>
  );
};

export default SellerChatGate;
