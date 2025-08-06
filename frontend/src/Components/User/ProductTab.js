import React, { useEffect, useState } from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Link } from '@mui/material';
import axios from 'axios';

const ProductTab = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchOwnedProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/owned`, {
          headers: { Authorization: token },
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchOwnedProducts();
  }, []);

  return (
    <Grid container spacing={3}>
      {products.map((product, index) => (
        <Grid item xs={6} sm={6} md={4} key={index}>
          <Link
            href={`/product/${product._id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card sx={{ height: '100%', cursor: 'pointer' }}>
              <CardMedia sx={{ height: 200 }}>
                <img
                  src={product.images && product.images.length > 0
                    ? product.images[0]
                    : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </CardMedia>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2">Rs.{product.price}</Typography>
                <Typography variant="body2" color="text.secondary">{product.category}</Typography>
                <Typography variant="caption" color="text.secondary">{product.ownerName || "You"}</Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductTab;
