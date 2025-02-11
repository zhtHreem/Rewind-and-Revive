import React from "react";
import { Grid, Container } from "@mui/material";
import AuctionCard from "./AuctionCard";

const auctionData = [
  {
    id: 1,
    title: "Contemporary Horizons",
    company: "Robinhood Auctions",
    startTime: "Tue, Feb 11, 11:00PM PKT",
    image: require('./assets/artwork.jpg'),
    hoursLeft: 1,
  },
  {
    id: 2,
    title: "Antique Camera Auction",
    company: "Lion and Unicorn",
    startTime: "Wed, Feb 12, 02:00AM PKT",
    image: require('./assets/cameras.jpg'),
    hoursLeft: 3,
  },
  {
    id: 3,
    title: "Coin Auction",
    company: "Lion and Unicorn",
    startTime: "Wed, Feb 12, 08:00PM PKT",
    image: require('./assets/coin.jpg'),
    hoursLeft: 5,
  },
];

const AuctionList = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {auctionData.map((auction) => (
          <Grid item xs={12} sm={6} md={4} key={auction.id}>
            <AuctionCard auction={auction} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AuctionList;
