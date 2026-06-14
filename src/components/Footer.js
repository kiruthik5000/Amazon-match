import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => (
  <Box>
    <Box sx={{ bgcolor: '#232F3E', py: 4, mt: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {[
          { title: 'Get to Know Us', links: ['About Us', 'Careers', 'Press Releases'] },
          { title: 'Connect with Us', links: ['Facebook', 'Twitter', 'Instagram'] },
          { title: 'Make Money with Us', links: ['Sell on Amazon', 'Become an Affiliate'] },
          { title: 'Let Us Help You', links: ['Your Account', 'Returns Centre', 'Help'] },
        ].map((section) => (
          <Box key={section.title}>
            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1, fontSize: '0.9rem' }}>
              {section.title}
            </Typography>
            {section.links.map((link) => (
              <Typography
                key={link}
                sx={{ color: '#ccc', fontSize: '0.8rem', mb: 0.5, cursor: 'pointer', '&:hover': { color: '#fff' } }}
              >
                {link}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
    <Box sx={{ bgcolor: '#131921', py: 2, textAlign: 'center' }}>
      <Typography sx={{ color: '#FF9900', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'Georgia, serif' }}>
        amazon
      </Typography>
      <Typography sx={{ color: '#ccc', fontSize: '0.75rem', mt: 0.5 }}>
        © 2024 Amazon. All rights reserved.
      </Typography>
    </Box>
  </Box>
);

export default Footer;
