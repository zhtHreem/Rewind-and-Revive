import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';

const InventoryPage = ({ userId }) => {
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/product/user/${userId}`,
          {
            headers: { Authorization: token } // Removed 'Bearer' prefix to match your profile page.
          }
        );

        setInventoryItems(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    if (userId) {
      fetchInventoryItems();
    }
  }, [userId]);

  return (
    <Container>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontFamily: 'Arial', color: '#85586F ' }}
      >
        Inventory
      </Typography>
      <Grid container spacing={4}>
        {inventoryItems.map((item) => (
          <Grid item key={item._id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                maxWidth: 345,
                borderRadius: '16px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              {/* Using the first image from the images array */}
              <CardMedia
                component="img"
                height="200"
                image={item.images && item.images.length > 0 ? item.images[0] : '/default-image.jpg'}
                alt={item.name}
              />
              <CardContent>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ fontFamily: 'Arial', color: '#2a0134' }}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: 'Arial' }}
                >
                  {item.description}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontFamily: 'Arial', color: '#2a0134 ' }}
                >
                  ${item.price}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    backgroundColor: '#85586F ',
                    '&:hover': {
                      backgroundColor: '#2a0134',
                    },
                    fontFamily: 'Arial',
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default InventoryPage;
