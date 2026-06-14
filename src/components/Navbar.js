import React, { useState } from 'react';
import {
  AppBar, Toolbar, Box, InputBase, Badge, IconButton,
  Typography, Menu, MenuItem, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Search, ShoppingCart, AccountCircle, LocationOn, Autorenew, EmojiNature,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleAccountMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#131921', zIndex: 1200 }}>
      <Toolbar sx={{ gap: 1, minHeight: '60px !important' }}>
        {/* Logo */}
        <Box
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', mr: 1 }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.4rem',
              color: '#FF9900',
              fontFamily: 'Georgia, serif',
              letterSpacing: '-0.5px',
            }}
          >
            amazon
          </Typography>
        </Box>

        {/* Deliver To */}
        {!isMobile && (
          <Box sx={{ display: 'flex', flexDirection: 'column', color: '#ccc', mr: 1 }}>
            <Typography sx={{ fontSize: '0.65rem' }}>Deliver to</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ fontSize: '0.9rem', color: '#fff' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>India</Typography>
            </Box>
          </Box>
        )}

        {/* Search Bar */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            bgcolor: '#fff',
            borderRadius: '4px',
            overflow: 'hidden',
            maxWidth: 700,
          }}
        >
          <InputBase
            placeholder="Search Amazon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ px: 1.5, flex: 1, fontSize: '0.9rem' }}
          />
          <Box
            onClick={() => search.trim() && navigate(`/?search=${encodeURIComponent(search.trim())}`)}
            sx={{
              bgcolor: '#FF9900',
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#e68a00' },
            }}
          >
            <Search sx={{ color: '#131921' }} />
          </Box>
        </Box>

        {/* Account */}
        <Box
          onClick={handleAccountMenu}
          sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', color: '#fff', px: 1 }}
        >
          {!isMobile && (
            <Typography sx={{ fontSize: '0.65rem', color: '#ccc' }}>
              {user ? `Hello, ${user.name?.split(' ')[0] || 'User'}` : 'Hello, sign in'}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <AccountCircle sx={{ fontSize: isMobile ? '1.8rem' : '1.2rem' }} />
            {!isMobile && (
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Account ▾</Typography>
            )}
          </Box>
        </Box>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          {!user && (
            <MenuItem onClick={() => { handleClose(); navigate('/login'); }}>Sign In</MenuItem>
          )}
          {!user && (
            <MenuItem onClick={() => { handleClose(); navigate('/register'); }}>Register</MenuItem>
          )}
          {user && <MenuItem onClick={() => { handleClose(); navigate('/orders'); }}>My Orders</MenuItem>}
          {user && <MenuItem onClick={() => { handleClose(); navigate('/green-credits'); }}>🌿 Green Credits</MenuItem>}
          {user && <Divider />}
          {user && <MenuItem onClick={handleLogout}>Sign Out</MenuItem>}
        </Menu>

        {/* Orders */}
        {!isMobile && (
          <Box
            onClick={() => navigate('/orders')}
            sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', color: '#fff', px: 1 }}
          >
            <Typography sx={{ fontSize: '0.65rem', color: '#ccc' }}>Returns</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>&amp; Orders</Typography>
          </Box>
        )}

        {/* ReMatch */}
        {!isMobile && (
          <Box
            onClick={() => navigate('/rematch')}
            sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', px: 1 }}
          >
            <Box sx={{ position: 'relative', width: 24, height: 24 }}>
              <Autorenew sx={{ fontSize: 24, color: '#FF9900' }} />
              <Box
                sx={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 8, height: 8, bgcolor: '#FF9900', borderRadius: '2px',
                }}
              />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>ReMatch</Typography>
          </Box>
        )}

        {/* Green Credits */}
        {!isMobile && user && (
          <Box
            onClick={() => navigate('/green-credits')}
            sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', px: 1 }}
          >
            <EmojiNature sx={{ fontSize: 22, color: '#4caf50' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Credits</Typography>
          </Box>
        )}

        {/* Cart */}
        <IconButton onClick={() => navigate('/cart')} sx={{ color: '#fff', position: 'relative' }}>
          <Badge badgeContent={totalItems} color="warning" max={99}>
            <ShoppingCart />
          </Badge>
          {!isMobile && (
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', ml: 0.5 }}>Cart</Typography>
          )}
        </IconButton>
      </Toolbar>

      {/* Sub-navbar */}
      <Box sx={{ bgcolor: '#232F3E', px: 2, py: 0.5, display: 'flex', gap: 2, overflowX: 'auto' }}>
        {['All', 'Today\'s Deals', 'Electronics', 'Jewellery', 'Men\'s Clothing', 'Women\'s Clothing'].map((item) => (
          <Typography
            key={item}
            sx={{
              color: '#fff',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              px: 0.5,
              py: 0.3,
              borderRadius: 1,
              '&:hover': { border: '1px solid #fff' },
            }}
            onClick={() => navigate(item === 'All' ? '/' : `/?category=${encodeURIComponent(item.toLowerCase())}`)}
          >
            {item}
          </Typography>
        ))}
      </Box>
    </AppBar>
  );
};

export default Navbar;
