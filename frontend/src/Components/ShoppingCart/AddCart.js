import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ReceiptPaper,
  ReceiptRule,
  ReceiptRow,
  ReceiptBarcode,
  ReceiptNote,
  rs,
  todayStamp,
} from '../Receipt/Receipt';

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

const AddCart = ({ onClose }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(readCart);

  // Refresh each saved item with the latest product details (price, photos).
  useEffect(() => {
    if (cart.length === 0) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const fresh = await Promise.all(
          cart.map(async (item) => {
            const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/${item.id}`);
            return { ...item, ...response.data };
          })
        );
        if (cancelled) return;
        setCart(fresh);
        localStorage.setItem('cart', JSON.stringify(fresh));
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every piece is one of a kind, so there is no quantity: just keep it or remove it.
  const remove = (id) => {
    const next = cart.filter((item) => (item.id || item._id) !== id);
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);

  const close = () => {
    if (onClose) onClose();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const checkout = () => {
    if (onClose) onClose();
    navigate('/payment');
  };

  return (
    <aside className="rr-cart" aria-label="Your bag">
      <div className="rr-cart__top">
        <span>Your bag · {cart.length} {cart.length === 1 ? 'piece' : 'pieces'}</span>
        <button className="rr-cart__close" onClick={close} aria-label="Close bag">&times;</button>
      </div>

      <div className="rr-cart__scroll">
        <ReceiptPaper subtitle={`pre-loved goods · ${todayStamp()}`}>
          <ReceiptRule />
          {cart.length === 0 ? (
            <p className="rr-empty">Nothing here yet.<br />Go find a piece with a past.</p>
          ) : (
            cart.map((item, i) => {
              const id = item.id || item._id;
              return (
                <div className="rr-line" key={id}>
                  {item.images?.[0] && <img src={item.images[0]} alt="" />}
                  <div className="rr-line__name">
                    <b>{String(i + 1).padStart(2, '0')} {item.name}</b>
                    <small>1 of 1</small>
                  </div>
                  <span className="rr-line__price">{rs(item.price)}</span>
                  <button className="rr-line__x" onClick={() => remove(id)} aria-label={`Remove ${item.name}`}>&times;</button>
                </div>
              );
            })
          )}
          <ReceiptRule />
          <ReceiptRow left="SUBTOTAL" right={`Rs ${rs(total)}`} />
          <ReceiptRow left="NEW CLOTHES MADE" right="0" />
          <ReceiptRow left="SECOND LIVES GIVEN" right={cart.length} />
          <ReceiptRule />
          <ReceiptRow strong left="TOTAL" right={`Rs ${rs(total)}`} />
          <ReceiptNote>Thank you for not buying new</ReceiptNote>
          <ReceiptBarcode />
        </ReceiptPaper>
      </div>

      <div className="rr-cart__actions">
        <button className="is-ghost" onClick={close}>Keep browsing</button>
        <button className="is-solid" onClick={checkout} disabled={cart.length === 0}>Checkout</button>
      </div>
    </aside>
  );
};

export default AddCart;
