import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import './pagination.css';

export default function Swipe() {
  const navigate = useNavigate();
  const [slidesPerView, setSlidesPerView] = useState(6); // Default value

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setSlidesPerView(3); 
      } else if (window.innerWidth <= 900) {
        setSlidesPerView(5); 
      } else {
        setSlidesPerView(6); 
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSlideClick = (path) => {
    navigate(path); // Navigate to the desired path within your SPA
  };

  return (
    <>
      <Swiper
        slidesPerView={slidesPerView}
        spaceBetween={0}
        slidesOffsetAfter={50}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        <SwiperSlide onClick={() => handleSlideClick('/')}>Men</SwiperSlide>
        <SwiperSlide onClick={() => handleSlideClick('/')}>Women</SwiperSlide>
        <SwiperSlide onClick={() => handleSlideClick('/')}>Kids</SwiperSlide>
        <SwiperSlide onClick={() => handleSlideClick('/')}>Bidding</SwiperSlide>
        <SwiperSlide onClick={() => handleSlideClick('/')}>Collaborators</SwiperSlide>
        <SwiperSlide onClick={() => handleSlideClick('/')}>Slide 6</SwiperSlide>
      </Swiper>
    </>
  );
}
