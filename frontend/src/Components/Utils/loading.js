import { useState } from 'react';
import { CircularProgress, Backdrop } from '@mui/material';

const LoadingOverlay = ({ isLoading }) => {
  return (
    <Backdrop
      open={isLoading}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default LoadingOverlay;