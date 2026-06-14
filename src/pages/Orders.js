import React, { useState } from 'react';
import {
  Box, Typography, Paper, Divider, Chip, Button,
  Stepper, Step, StepLabel, Collapse,
} from '@mui/material';
import { ExpandMore, ExpandLess, ShoppingBag } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ORDER_STEPS = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

const MOCK_ORDERS = [
  {
    id: 'AMZ-001-2024',
    date: 'December 15, 2024',
    status: 3,
    total: 129.99,
    items: [
      { title: 'Fjallraven Backpack', image: 'https://fakestoreapi.com/img/81fAn45jrUL._AC_UX679_.jpg', qty: 1, price: 109.95 },
      { title: 'Mens Casual Slim Fit', image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg', qty: 2, price: 22.3 },
    ],
  },
  {
    id: 'AMZ-002-2024',
    date: 'December 10, 2024',
    status: 2,
    total: 55.99,
    items: [
      { title: 'John Hardy Bracelet', image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg', qty: 1, price: 695 },
    ],
  },
];

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#F3F3F3', px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Order Placed</Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.date}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Total</Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{order.total}</Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Order # {order.id}</Typography>
          <Chip
            label={ORDER_STEPS[order.status]}
            size="small"
            color={order.status === 3 ? 'success' : order.status === 2 ? 'warning' : 'info'}
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ px: 2, pt: 2 }}>
        <Stepper activeStep={order.status} alternativeLabel>
          {ORDER_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.7rem' } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Items preview */}
      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {order.items.slice(0, 3).map((item, i) => (
          <img key={i} src={item.image} alt={item.title} style={{ width: 60, height: 60, objectFit: 'contain', background: '#f8f8f8', borderRadius: 8, padding: 4 }} />
        ))}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {order.items[0].title}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setExpanded(!expanded)}
          sx={{ textTransform: 'none', color: '#007185' }}
        >
          {expanded ? 'Hide' : 'Details'}
        </Button>
      </Box>

      {/* Expanded Details */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {order.items.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'center' }}>
              <img src={item.image} alt={item.title} style={{ width: 50, height: 50, objectFit: 'contain', background: '#f8f8f8', borderRadius: 6, padding: 4 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                <Typography variant="caption" color="text.secondary">Qty: {item.qty} × ₹{item.price}</Typography>
              </Box>
            </Box>
          ))}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button size="small" variant="outlined" onClick={() => navigate('/')} sx={{ textTransform: 'none', borderRadius: '20px' }}>
              Buy Again
            </Button>
            <Button size="small" variant="outlined" color="error" sx={{ textTransform: 'none', borderRadius: '20px' }}>
              Return Items
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  const pendingOrder = cart.length > 0 ? {
    id: 'AMZ-PENDING',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    status: 0,
    total: cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2),
    items: cart,
  } : null;

  const allOrders = pendingOrder ? [pendingOrder, ...MOCK_ORDERS] : MOCK_ORDERS;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <ShoppingBag sx={{ color: '#FF9900', fontSize: '2rem' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Your Orders</Typography>
      </Box>

      {allOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>No orders yet</Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: '#FF9900', color: '#131921', textTransform: 'none', borderRadius: '20px', '&:hover': { bgcolor: '#e68a00' } }}>
            Start Shopping
          </Button>
        </Box>
      ) : (
        allOrders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </Box>
  );
};

export default Orders;
