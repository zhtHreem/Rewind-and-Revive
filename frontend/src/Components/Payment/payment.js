import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/layout';
import {
  ReceiptPaper,
  ReceiptRule,
  ReceiptRow,
  ReceiptBarcode,
  ReceiptNote,
  rs,
  todayStamp,
} from '../Receipt/Receipt';

const Payment = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const savedCart = localStorage.getItem('cart');
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];
        const updatedCart = await Promise.all(
          parsedCart.map(async (item) => {
            if (!item.id) {
              console.error('Product ID missing for item:', item);
              return item;
            }
            const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/${item.id}`);
            return { ...item, ...response.data };
          })
        );
        setCart(updatedCart);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchCartProducts();
  }, []);

  const total = cart.reduce((sum, product) => sum + product.price * (product.quantity || 1), 0);

  return (
    <Layout>
      <div className="rr-receipt-page">
        <ReceiptPaper subtitle={`order summary · ${todayStamp()}`}>
          <ReceiptRule />
          {cart.length === 0 ? (
            <p className="rr-empty">Your bag is empty.</p>
          ) : (
            cart.map((product, i) => (
              <div className="rr-line" key={product._id || product.id}>
                {product.images?.[0] && <img src={product.images[0]} alt="" />}
                <div className="rr-line__name">
                  <b>{String(i + 1).padStart(2, '0')} {product.name}</b>
                  <small>{product.quantity || 1} x ${rs(product.price)}</small>
                </div>
                <span className="rr-line__price">${rs(product.price * (product.quantity || 1))}</span>
              </div>
            ))
          )}
          <ReceiptRule />
          <ReceiptRow left="SUBTOTAL" right={`$${rs(total)}`} />
          <ReceiptRow left="SECOND LIVES GIVEN" right={cart.length} />
          <ReceiptRule />
          <ReceiptRow strong left="TOTAL" right={`$${rs(total)}`} />
          <ReceiptNote>Review your bag, then pay</ReceiptNote>
          <ReceiptBarcode />
        </ReceiptPaper>

        <div className="rr-receipt-page__actions">
          <button className="is-ghost" onClick={() => navigate(-1)}>Back to bag</button>
          <button
            className="is-solid"
            disabled={cart.length === 0}
            onClick={() => navigate('/confirmation', { state: { cart } })}
          >
            Pay now
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
