import React from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Chip, Button } from '@mui/material';
import chanel from './images/chanel.jpg';
import LV from './images/LV.jpg';
import prada from './images/prada.jpg';
import NouseenShah from './images/NouseenShah.jpg'
import silverSapphire from './images/silverSapphire.jpg'
import MahnoorBaloch from './images/MahnoorBaloch.jpg'
import red from './images/red.jpg'
import ring from './images/rings.jpg'

const products = [
  {
    id: 1,
    title: 'Nouseen Shah Awards Wear',
    image: NouseenShah,
    currentBid: '$150',
    startingPrice: '$100',
    totalBids: 13,
    onStock: true,
  },
  {
    id: 2,
    title: 'Rubby Red Set',
    image: red,
    currentBid: '$970',
    startingPrice: '$900',
    totalBids: 13,
    onStock: true,
  },
  {
    id: 3,
    title: 'Limited Edition LV',
    image: LV,
    currentBid: '$350',
    startingPrice: '$320',
    totalBids: 8,
    onStock: true,
  },
  {
    id: 4,
    title: 'Classic Silver Sapphire Earrings',
    image: silverSapphire,
    currentBid: '$700',
    startingPrice: '$550',
    totalBids: 15,
    outOfStock: true,
  },
  {
    id: 5,
    title: 'Mahnoor Baloch Award Wear',
    image: MahnoorBaloch,
    currentBid: '$450',
    startingPrice: '$400',
    totalBids: 5,
    onStock: true,
  },
  {
    id: 6,
    title: 'Classic Prada bag',
    image: prada,
    currentBid: '$400',
    startingPrice: '$350',
    totalBids: 9,
    outOfStock: true,
  },
  {
    id: 7,
    title: 'Chanel cream premium',
    image: chanel,
    currentBid: '$150',
    startingPrice: '$100',
    totalBids: 5,
    onStock: true,
  },
  {
    id: 8,
    title: 'Platinum with diamond stone',
    image: ring,
    currentBid: '$350',
    startingPrice: '$300',
    totalBids: 5,
    onStock: true,
  },
];

const ProductCard = ({ product }) => {
  return (
    <Card sx={{ width: 350, position: 'relative' }}>
      <CardMedia
        component="img"
        height="130"
        image={product.image}
        alt={product.title}
      />
      <CardContent>
        <Typography variant="h6">{product.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          Current Bid: {product.currentBid}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Starting Price: {product.startingPrice}
        </Typography>
        {product.totalBids && (
          <Chip
            label={`Total Bids: ${product.totalBids}`}
            color="primary"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}
        {product.onStock && (
          <Chip
            label="On Stock"
            color="success"
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />
        )}
        {product.outOfStock && (
          <Chip
            label="Out of Stock"
            color="success"
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />
        )}
    
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#C3B1E1',
              mt: 2,
              '&:hover': {
                backgroundColor: 'darkblue',
              },
            }}
          >
            Place Your Bid
          </Button>
      
      </CardContent>
    </Card>
  );
};

const BidProduct = () => {
  return (
    <Box sx={{ flexGrow: 1,
        backgroundColor: '#C3B1E1'
     }} >
      <Grid
        container
        spacing={0}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0,
          margin: 0,
        }}
      >
        {products.map((product) => (
          <Grid item key={product.id} sx={{ paddingBottom: 1, paddingTop: 1, paddingLeft:3, paddingRight:3 }}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BidProduct;
