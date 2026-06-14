import React from 'react';
import {
  Box, Typography, Button, Grid, Divider,
  IconButton, Paper, Alert,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 6, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>🛒 Your cart is empty</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Looks like you haven't added anything yet.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ bgcolor: '#FF9900', color: '#131921', fontWeight: 700, textTransform: 'none', borderRadius: '20px', '&:hover': { bgcolor: '#e68a00' } }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Shopping Cart</Typography>
      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            {cart.map((item, idx) => (
              <Box key={item.id}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box
                    onClick={() => navigate(`/product/${item.id}`)}
                    sx={{ cursor: 'pointer', flexShrink: 0 }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: 100, height: 100, objectFit: 'contain', background: '#f8f8f8', borderRadius: 8, padding: 8 }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, mb: 0.5, cursor: 'pointer', '&:hover': { color: '#007185' } }}
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: '#007600', fontSize: '0.85rem', mb: 1 }}>✓ In Stock</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => item.qty > 1 ? updateQty(item.id, item.qty - 1) : removeFromCart(item.id)}
                        sx={{ border: '1px solid #ccc', borderRadius: 1 }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.qty}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        sx={{ border: '1px solid #ccc', borderRadius: 1 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                      <Button
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => removeFromCart(item.id)}
                        sx={{ color: '#B12704', textTransform: 'none', ml: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#B12704', flexShrink: 0 }}>
                    ₹{(item.price * item.qty).toFixed(2)}
                  </Typography>
                </Box>
                {idx < cart.length - 1 && <Divider />}
              </Box>
            ))}
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography color="text.secondary">
                Subtotal ({totalItems} items): <strong style={{ color: '#B12704' }}>₹{totalPrice.toFixed(2)}</strong>
              </Typography>
              <Button
                size="small"
                onClick={clearCart}
                sx={{ color: '#B12704', textTransform: 'none' }}
              >
                Clear cart
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, position: { md: 'sticky' }, top: 80 }}>
            <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }}>
              Your order qualifies for FREE Delivery!
            </Alert>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Subtotal ({totalItems} items):{' '}
              <strong style={{ color: '#B12704' }}>₹{totalPrice.toFixed(2)}</strong>
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/orders')}
              sx={{
                bgcolor: '#FF9900',
                color: '#131921',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '20px',
                mb: 1,
                '&:hover': { bgcolor: '#e68a00' },
              }}
            >
              Proceed to Checkout
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ textTransform: 'none', borderRadius: '20px', borderColor: '#FF9900', color: '#131921' }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cart;
