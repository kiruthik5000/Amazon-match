import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Rating, Box, Chip,
} from '@mui/material';
import { AddShoppingCart, VerifiedUser } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const price      = product.rematchPrice   ?? product.originalPrice;
  const origPrice  = product.originalPrice;
  const discount   = product.discountPercent;
  const image      = product.imageUrl;
  const ratingVal  = product.rating != null ? Number(product.rating) : 0;
  const ratingCount = product.reviewCount ?? 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart({ ...product, price: Number(price) });
  };

  return (
    <Card
      onClick={() => navigate(`/product/${product.id}`)}
      sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        cursor: 'pointer', transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 6 }, borderRadius: 2,
      }}
    >
      {/* Image */}
      <Box sx={{ p: 2, bgcolor: '#f8f8f8', display: 'flex', justifyContent: 'center', height: 200, position: 'relative' }}>
        {product.aiVerified && (
          <Chip
            icon={<VerifiedUser sx={{ fontSize: '0.75rem !important' }} />}
            label="AI Verified"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8, bgcolor: '#e8f5e9', color: '#2e7d32', fontSize: '0.65rem' }}
          />
        )}
        {discount > 0 && (
          <Chip
            label={`-${discount}%`}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#B12704', color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}
          />
        )}
        <CardMedia
          component="img"
          image={image || '/placeholder.png'}
          alt={product.title}
          sx={{ height: '100%', width: 'auto', objectFit: 'contain' }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, pb: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600, mb: 0.5, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', lineHeight: 1.4,
          }}
        >
          {product.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Rating value={ratingVal} precision={0.1} readOnly size="small" />
          <Typography variant="caption" color="text.secondary">({ratingCount})</Typography>
        </Box>

        <Chip
          label={product.category}
          size="small"
          sx={{ fontSize: '0.65rem', mb: 0.5, textTransform: 'capitalize' }}
        />

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#B12704' }}>
            ₹{Number(price).toFixed(2)}
          </Typography>
          {discount > 0 && (
            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#888' }}>
              ₹{Number(origPrice).toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 1 }}>
        <Button
          fullWidth variant="contained" size="small"
          startIcon={<AddShoppingCart />} onClick={handleAdd}
          sx={{ bgcolor: '#FF9900', color: '#131921', fontWeight: 700, textTransform: 'none', borderRadius: '20px', '&:hover': { bgcolor: '#e68a00' } }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
