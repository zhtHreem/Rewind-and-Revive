import React from 'react';
import './receipt.css';

export const rs = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

export const ReceiptPaper = ({ title = 'Rewind & Revive', subtitle, children, className = '' }) => (
  <div className={`rr-receipt ${className}`}>
    <h2 className="rr-receipt__title">{title}</h2>
    {subtitle && <p className="rr-receipt__sub">{subtitle}</p>}
    {children}
  </div>
);

export const ReceiptRule = () => <hr className="rr-receipt__rule" />;

export const ReceiptRow = ({ left, right, strong, children, onClick }) => (
  <div className={`rr-receipt__row ${strong ? 'is-strong' : ''}`} onClick={onClick}>
    <span>{left}</span>
    <span className="rr-receipt__dots" />
    <span>{right}</span>
    {children}
  </div>
);

export const ReceiptBarcode = () => <div className="rr-receipt__barcode" aria-hidden="true" />;

export const ReceiptNote = ({ children }) => <p className="rr-receipt__note">{children}</p>;

export const todayStamp = () =>
  new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
