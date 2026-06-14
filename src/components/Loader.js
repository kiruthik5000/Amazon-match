import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const Loader = ({ height = '60vh' }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
    <CircularProgress sx={{ color: '#FF9900' }} />
  </Box>
);

export default Loader;
