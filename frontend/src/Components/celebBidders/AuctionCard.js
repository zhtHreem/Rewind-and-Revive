import React from "react";
import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LiveTvIcon from "@mui/icons-material/LiveTv";

const AuctionCard = ({ auction }) => {
  return (
    <Card sx={{ maxWidth: 345, borderRadius: 2, boxShadow: 3 }}>
      <Box
        sx={{
          position: "absolute",
          backgroundColor: "green",
          color: "white",
          padding: "5px",
          top: 10,
          left: 10,
          fontSize: "12px",
          fontWeight: "bold",
          borderRadius: "5px",
        }}
      >
       {/* //{auction.hoursLeft} {auction.hoursLeft === 1 ? "Hour" : "Hours"} Left */}
      </Box>

      <CardMedia component="img" height="200" image={auction.image} alt={auction.title} />
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{auction.title}</Typography>
          <Box display="flex" alignItems="center">
            <LiveTvIcon color="success" />
            <Typography color="success.main" sx={{ fontSize: 14, marginLeft: 1 }}>
              Live
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {auction.company}
        </Typography>
        <Typography variant="body2">
          Start: {auction.startTime}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AuctionCard;
