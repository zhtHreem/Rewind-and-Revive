import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  IconButton, 
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import axios from 'axios';

const MatchOutfitModal = ({ open, onClose, product }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [matchingItems, setMatchingItems] = useState([
    { id: 1, image: "/api/placeholder/200/200", alt: "Black pants" },
    { id: 2, image: "/api/placeholder/200/200", alt: "Purple scarf" },
    { id: 3, image: "/api/placeholder/200/200", alt: "White top" },
    { id: 4, image: "/api/placeholder/200/200", alt: "Blue dress" }
  ]);

  const peopleAlsoBuy = [
    { id: 1, image: "/api/placeholder/200/200", alt: "Related Item 1" },
    { id: 2, image: "/api/placeholder/200/200", alt: "Related Item 2" },
    { id: 3, image: "/api/placeholder/200/200", alt: "Related Item 3" },
    { id: 4, image: "/api/placeholder/200/200", alt: "Related Item 4" },
    { id: 5, image: "/api/placeholder/200/200", alt: "Related Item 5" },
    { id: 6, image: "/api/placeholder/200/200", alt: "Related Item 6" }
  ];

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (open && product?._id) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_LOCAL_URL}/api/product/recommendations/${product._id}`,
            { 
              params: { 
                topK: 6, 
                matchType: false, 
                matchMaterials: false
              }
            }
          );
              console.log('API Response:', response.data);
              console.log("Fetching recommendations for product ID:", product?._id);


          const recommendations = response.data.recommendations;
          
          const matchItems = recommendations.map(rec => ({
            id: rec.product._id,
            image: rec.product.images[0],
            alt: rec.product.name,
            name: rec.product.name
          }));

          setMatchingItems(matchItems.length > 0 ? matchItems : matchingItems);
        } catch (error) {
          console.error('Failed to fetch recommendations', error);
        }
      }
    };

    fetchRecommendations();
  }, [open, product?._id]);

  const getSlidesPerView = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    return 4;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}  
      maxWidth="xl" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          borderRadius: "12px", 
          background: "#fff", 
          position: 'relative', 
          m: { xs: 1, sm: 2 },  
          maxHeight: { xs: '95vh', sm: 'calc(100% - 32px)' }, 
          overflowY: 'hidden' 
        } 
      }}
    >
      <IconButton 
        onClick={onClose}  
        sx={{ 
          position: "absolute", 
          right: { xs: 8, sm: 16 }, 
          top: { xs: 8, sm: 16 }, 
          color: "#000", 
          zIndex: 1, 
          p: 1
        }}
      >
        <Close />
      </IconButton>

      <Typography 
        variant="h6"  
        sx={{  
          textAlign: 'center',  
          pt: { xs: 2, sm: 3 },
          pb: { xs: 1, sm: 2 },
          fontWeight: 400 
        }}
      >
        Match My Outfit
      </Typography>

      <DialogContent 
        sx={{    
          display: 'flex',   
          flexDirection: { xs: 'column', md: 'row' },   
          p: 0,   
          height: { xs: 'auto', md: '600px' } 
        }} 
      >
        {/* Left side - Main Product */}
        <Box 
          sx={{  
            width: { xs: '100%', md: '300px' },  
            minWidth: { md: '400px' },  
            height: { xs: 'auto', md: '87%' },  
            bgcolor: '#f5f5f5',  
            display: 'flex',  
            flexDirection: 'column',  
            alignItems: 'center',  
            p: { xs: 2, sm: 4 } 
          }}
        >
          <Box 
            component="img" 
            src={product?.images?.[0] || "/api/placeholder/300/400"}  
            alt={product?.name || "Product"}   
            sx={{    
              width: '100%',  
              height: '87%', 
              maxWidth: { xs: 200, sm: 300 },
              objectFit: "contain" 
            }}
          />
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            {product?.name}
          </Typography>
        </Box>

        {/* Right side - Matching Items & People also Buy */}
        <Box 
          sx={{  
            flex: 1, 
            display: 'flex',
            flexDirection: 'column',   
            p: { xs: 2, sm: 4 }, 
            gap: { xs: 2, sm: 4 },  
            overflowY: 'auto'  
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ mb: { xs: 1, sm: 2 } }}>
              See Matching Items
            </Typography>
            <Swiper 
              modules={[Navigation]} 
              navigation={true}   
              slidesPerView={getSlidesPerView()}  
              spaceBetween={16}   
              style={{ width: '100%' ,height: '80%' ,backgroundColor:"black"}} 
            
            >
              {matchingItems.map((item) => (
                <SwiperSlide key={item.id}>
                  <Box  
                    sx={{  
                      width: '100%', 
                      height: { xs: 80, sm: 200 }, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: '8px',   
                      overflow: 'hidden'  
                    }}
                  >
                    <Box  
                      component="img"  
                      src={item.image}   
                      alt={item.alt} 
                      sx={{
                        width: '100%',   
                        height: '70%', 
                        objectFit: 'cover'  
                      }}  
                    />
                    <Typography variant="h6" sx={{ textAlign: 'center', display: 'block' }}>
                      {item.name || item.alt}
                    </Typography>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          <Box sx={{ mt: { xs: 2, sm: 4 } }}>
            <Typography variant="h6" sx={{ mb: { xs: 1, sm: 2 } }}>
              People also Buy
            </Typography>
            <Swiper 
              modules={[Navigation]}  
              navigation={true} 
              slidesPerView={getSlidesPerView()} 
              spaceBetween={16}   
              style={{ width: '100%' }} 
            >
              {peopleAlsoBuy.map((item) => (
                <SwiperSlide key={item.id}>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: { xs: 160, sm: 200 },  
                      bgcolor: '#f5f5f5',
                      borderRadius: '8px', 
                      overflow: 'hidden'  
                    }} 
                  >
                    <Box  
                      component="img" 
                      src={item.image}  
                      alt={item.alt} 
                      sx={{ 
                        width: '100%',   
                        height: '100%',  
                        objectFit: 'cover' 
                      }} 
                    />
                    <Typography variant="caption" sx={{ textAlign: 'center', display: 'block' }}>
                      {item.alt}
                    </Typography>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MatchOutfitModal;