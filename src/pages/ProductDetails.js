import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Button, Rating, Chip,
  Divider, Alert, Breadcrumbs, Link, Snackbar, LinearProgress,
} from '@mui/material';
import { AddShoppingCart, ArrowBack, VerifiedUser, Autorenew } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/products';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

const GRADE_COLORS = { A: '#2e7d32', B: '#1565c0', C: '#e65100', D: '#c62828' };
const GRADE_LABELS = { A: 'Like New', B: 'Good', C: 'Fair', D: 'Acceptable' };

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(res => setProduct(res.data.data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      price: Number(product.rematchPrice ?? product.originalPrice),
      image: product.imageUrl,
    };
    for (let i = 0; i < qty; i++) addToCart(cartItem);
    setSnackOpen(true);
  };

  if (loading) return <Loader />;
  if (error)   return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!product) return null;

  const price     = Number(product.rematchPrice ?? product.originalPrice);
  const origPrice = Number(product.originalPrice);
  const discount  = product.discountPercent ?? 0;
  const grade     = product.conditionGrade;
  const lifeScore = product.lifeScore ?? 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>Home</Link>
        <Link
          underline="hover" color="inherit" sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
          onClick={() => navigate(`/?category=${encodeURIComponent(product.category)}&page=1`)}
        >
          {product.category}
        </Link>
        <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>{product.title}</Typography>
      </Breadcrumbs>

      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, color: '#007185', textTransform: 'none' }}>
        Back to results
      </Button>

      <Grid container spacing={4}>
        {/* Image */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              bgcolor: '#f8f8f8', borderRadius: 2, p: 4,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              minHeight: 400, border: '1px solid #e0e0e0', position: 'relative',
            }}
          >
            {product.aiVerified && (
              <Chip
                icon={<VerifiedUser sx={{ fontSize: '0.8rem !important' }} />}
                label="AI Verified"
                size="small"
                sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#e8f5e9', color: '#2e7d32' }}
              />
            )}
            <img
              src={product.imageUrl || '/placeholder.png'}
              alt={product.title}
              style={{ maxHeight: 380, maxWidth: '100%', objectFit: 'contain' }}
            />
          </Box>
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip label={product.category} size="small" sx={{ textTransform: 'capitalize', bgcolor: '#e8f4f8' }} />
            {product.conditionType && (
              <Chip
                icon={<Autorenew sx={{ fontSize: '0.8rem !important' }} />}
                label={product.conditionType}
                size="small"
                sx={{ bgcolor: '#fff3e0' }}
              />
            )}
            {grade && (
              <Chip
                label={`Grade ${grade} — ${GRADE_LABELS[grade] || ''}`}
                size="small"
                sx={{ bgcolor: GRADE_COLORS[grade], color: '#fff', fontWeight: 700 }}
              />
            )}
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}>
            {product.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating value={product.rating ? Number(product.rating) : 0} precision={0.1} readOnly />
            <Typography variant="body2" color="primary">
              {product.reviewCount ?? 0} ratings
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Pricing */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="h4" sx={{ color: '#B12704', fontWeight: 700 }}>
              ₹{price.toFixed(2)}
            </Typography>
            {discount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#888' }}>
                  M.R.P: ₹{origPrice.toFixed(2)}
                </Typography>
                <Chip label={`${discount}% off`} size="small" sx={{ bgcolor: '#B12704', color: '#fff', fontWeight: 700 }} />
              </Box>
            )}
          </Box>

          <Typography variant="body2" sx={{ color: '#007600', fontWeight: 600, mb: 2 }}>
            ✓ {product.available ? 'In Stock' : 'Out of Stock'}
          </Typography>

          {/* Life Score */}
          {lifeScore > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Life Score</Typography>
                <Typography variant="body2" sx={{ color: lifeScore >= 70 ? '#2e7d32' : lifeScore >= 40 ? '#e65100' : '#c62828', fontWeight: 700 }}>
                  {lifeScore}/100
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate" value={lifeScore}
                sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': { bgcolor: lifeScore >= 70 ? '#4caf50' : lifeScore >= 40 ? '#ff9800' : '#f44336' } }}
              />
            </Box>
          )}

          {product.aiAssessmentSummary && (
            <Box sx={{ bgcolor: '#f9fbe7', p: 1.5, borderRadius: 1, border: '1px solid #c5e1a5', mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#33691e' }}>🤖 AI Assessment</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: '#555' }}>{product.aiAssessmentSummary}</Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {product.description}
          </Typography>
        </Grid>

        {/* Buy Box */}
        <Grid item xs={12} md={3}>
          <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2.5, position: { md: 'sticky' }, top: 80 }}>
            <Typography variant="h5" sx={{ color: '#B12704', fontWeight: 700, mb: 0.5 }}>
              ₹{price.toFixed(2)}
            </Typography>
            {discount > 0 && (
              <Typography variant="caption" sx={{ color: '#B12704' }}>Save ₹{(origPrice - price).toFixed(2)} ({discount}%)</Typography>
            )}
            <Typography variant="body2" sx={{ color: '#007600', mt: 0.5, mb: 1 }}>
              ✓ {product.available ? 'In Stock' : 'Out of Stock'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>FREE Delivery</strong> Tomorrow
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="body2">Qty:</Typography>
              <Box
                component="select" value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                sx={{ border: '1px solid #ccc', borderRadius: 1, p: 0.5, cursor: 'pointer' }}
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </Box>
            </Box>
            <Button
              fullWidth variant="contained" onClick={handleAddToCart}
              disabled={!product.available}
              startIcon={<AddShoppingCart />}
              sx={{ bgcolor: '#FF9900', color: '#131921', fontWeight: 700, textTransform: 'none', borderRadius: '20px', mb: 1, '&:hover': { bgcolor: '#e68a00' } }}
            >
              Add to Cart
            </Button>
            <Button
              fullWidth variant="contained"
              disabled={!product.available}
              onClick={() => { handleAddToCart(); navigate('/cart'); }}
              sx={{ bgcolor: '#FF5722', textTransform: 'none', borderRadius: '20px', '&:hover': { bgcolor: '#e64a19' } }}
            >
              Buy Now
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message={`"${product.title.slice(0, 40)}…" added to cart`}
      />
    </Box>
  );
};

export default ProductDetails;
