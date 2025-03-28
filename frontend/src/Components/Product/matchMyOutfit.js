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
import { useNavigate } from 'react-router-dom';
import { Close } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import axios from 'axios';
import myMyo from './images/myo.jpg';

import SkeletonLoader from '../Utils/skeletonLoader';
const MatchOutfitModal = ({ open, onClose, product }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [isLoading, setIsLoading] = useState(true);
  const [matchingItems, setMatchingItems] = useState([]);
  const [peopleAlsoBuy, setPeopleAlsoBuy] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      if (product?._id) {
        setIsLoading(true);
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
          
          if (isMounted) {
            console.log('API Response:', response.data);
            const recommendations = response.data.recommendations;
            
            const matchItems = recommendations.map(rec => ({
              id: rec.product._id,
              price: rec.product.price,
              image: rec.product.images[0],
              alt: rec.product.name,
              name: rec.product.name,
              owner: rec.product.owner,
              averageRating : rec.product.owner.averageRating
            }));
            

            setMatchingItems(matchItems);
            setPeopleAlsoBuy(matchItems.slice(0, 6)); // Using same items for people also buy section
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Failed to fetch recommendations', error);
          if (isMounted) {
            setMatchingItems([]);
            setPeopleAlsoBuy([]);
            setIsLoading(false);
          }
        }
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [ product?._id]);

  const getSlidesPerView = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    return 4;
  };

  const ProductSkeleton = () => (
    <Box sx={{ width: '100%', height: '100%' }}>
      <SkeletonLoader.Card height="160px" />
      <Box sx={{ mt: 1 }}>
        <SkeletonLoader.Text lines={1} />
      </Box>
    </Box>
  );



  return (
    <Dialog  open={open}   onClose={onClose}  maxWidth="xl"  fullWidth  PaperProps={{   sx: {   borderRadius: "12px",  background: "#fff",    position: 'relative',   m: { xs: 1, sm: 2 },   maxHeight: { xs: '95vh', sm: 'calc(100% - 32px)' },   overflowY: 'hidden'   }  }} >
      <IconButton  onClick={onClose} sx={{   position: "absolute",   right: { xs: 8, sm: 16 },   top: { xs: 8, sm: 16 }, color: "#000", zIndex: 1,  p: 1}}>
        <Close />
      </IconButton>

      <Typography   variant="h6"  sx={{   textAlign: 'center', pt: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 },fontWeight: 400    }}  >
        Match My Outfit
      </Typography>

      <DialogContent  sx={{    display: 'flex', flexDirection: { xs: 'column', md: 'row' },    p: 0,  height: { xs: 'auto', md: '600px' } }} >
        {/* Left side - Main Product */}
        <Box   sx={{   width: { xs: '100%', md: '300px' }, minWidth: { md: '400px' },   height: { xs: 'auto', md: '87%' }, backgroundImage: `url(${myMyo})`,   display: 'flex',   flexDirection: 'column',   alignItems: 'center',   p: { xs: 2, sm: 4 }  }}  >
          
            <>
              <Box   component="img"    src={product?.images?.[0] || "/api/placeholder/300/400"}   alt={product?.name || "Product"}   sx={{   position:"relative",  width: '100%',   height: '95%',  maxWidth: { xs: 200, sm: 300 }, objectFit: "cover", boxShadow: 10}} />
              <Typography    sx={{ mt: 2, textAlign: 'center' ,display: 'block',   cursor: 'pointer',  color: 'primary.main', transition: 'all 0.2s ease-in-out', '&:hover': {     color: 'primary.dark', textDecoration: 'underline', transform: 'scale(1.02)' }}}   onClick={() => navigate(`/product/${product?._id}`)} >
                {product?.name}   
              </Typography>
              <Typography  variant='body2' sx={{color: 'darkblue'}} >
                 Rs. {product?.price}
              </Typography>
             
               <Typography variant="body2" sx={{ color: 'black',backgroundColor: '#f5f5f5', padding: '4px 8px', fontWeight: 'bold' }}>
                          Seller: <Typography component="span" sx={{ color: 'blue', fontWeight: 'normal', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }} onClick={() => navigate(`/profile/${product.owner?._id}`)}>{product.owner?.username}</Typography>
               </Typography>  
               {/* <Typography variant="body2" sx={{ color: 'black',    padding: '4px 8px', fontWeight: 'bold' }}>
                  Seller rating: <Typography  component="span" sx={{color: 'gray', fontSize: '0.8rem', marginLeft: '8px' }}>
                    ⭐ {product.owner?.averageRating?.toFixed(1) || "N/A"}
                      </Typography>
                </Typography> */}
            </>
        
        </Box>

        {/* Right side - Matching Items & People also Buy */}
        <Box   sx={{   flex: 1,  display: 'flex', flexDirection: 'column',   p: { xs: 1}, px:{xs:2,sm:4},  gap: { xs: 2, sm: 2 },  overflowY: 'auto'    }} >
          <Box>
            <Typography variant="h6" sx={{ mb: { xs: 1, sm: 2 } }}>
              See Matching Items
            </Typography>
            <Swiper  modules={[Navigation]} navigation={true}    slidesPerView={getSlidesPerView()}    spaceBetween={16}  style={{ width: '100%', height: 450 }} >
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <SwiperSlide key={`skeleton-${index}`} style={{ padding: 6 }}>
                    <ProductSkeleton />
                  </SwiperSlide>
                ))
              ) : matchingItems.length > 0 ? (
                matchingItems.map((item) => (
                  <SwiperSlide key={item.id} style={{ padding: 6 }}>
                    <Box   sx={{  position: 'relative',  width: '100%', height: { xs: "100%", sm: "100%" }, bgcolor: '#f5f5f5',  overflow: 'hidden'  }} >
                      <Box   component="img"  src={item.image} alt={item.alt} sx={{  width: '100%', height:'80%',objectFit: 'cover'}}   />
                      <Typography  variant="h6"   sx={{ textAlign: 'center', display: 'block',   cursor: 'pointer',  color: 'primary.main', transition: 'all 0.2s ease-in-out', '&:hover': {     color: 'primary.dark', textDecoration: 'underline', transform: 'scale(1.02)' } }}  onClick={() => navigate(`/product/${item?.id}`)} >
                       {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'black', position: 'absolute', backgroundColor: '#f5f5f5', bottom: 30, right: 0, left: 0, padding: '4px 8px', fontWeight: 'bold' }}>
                          Seller: <Typography component="span" sx={{ color: 'blue', fontWeight: 'normal', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }} onClick={() => navigate(`/profile/${item.owner?._id}`)}>{item.owner?.username}</Typography>
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'black', position: 'absolute', backgroundColor: '#f5f5f5', bottom: 0, right: 0, left: 0, padding: '4px 8px', fontWeight: 'bold' }}>
                        Rating: <Typography  component="span" sx={{color: 'gray', fontSize: '0.8rem', marginLeft: '8px' }}>
                         ⭐ {item.owner?.averageRating?.toFixed(1) || "N/A"}
                         </Typography>
                        </Typography>
                      <Typography  variant='body2' sx={{color: 'white',position: 'absolute',backgroundColor: 'rgba(0, 0, 0, 0.5)',top: 0,right:0,left:0 }} >
                        Rs.{item.price}
                      </Typography>
                 
                    </Box>
                  </SwiperSlide>
                ))
            ) : (
                <SwiperSlide>
                  <Typography sx={{ textAlign: 'center', py: 4 }}>
                    No matching items found
                  </Typography>
                </SwiperSlide>
              )}
            </Swiper>
          </Box>
        
        
         
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MatchOutfitModal;