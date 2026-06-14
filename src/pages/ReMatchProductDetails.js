import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Grid, Typography, Button, Chip, Divider,
  LinearProgress, Tooltip, Rating, Breadcrumbs,
  Link, Snackbar, Alert, Skeleton,
} from '@mui/material';
import {
  VerifiedRounded, FlashOnRounded, AddShoppingCart,
  AutorenewRounded, ArrowBack, CheckCircleRounded,
  WarningAmberRounded, ShieldRounded, LocalShippingRounded,
  ReplayRounded, SmartToyRounded, FavoriteBorderRounded,
  FavoriteRounded, LocalOfferRounded, EmojiNature,
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import creditsApi from '../api/credits';
import { getProduct } from '../api/products';

// ─── Grade config ─────────────────────────────────────────────────────────────

const GRADE_CONFIG = {
  A: { label: 'Grade A', sublabel: 'Like New',       color: '#067D62', bg: '#eaf7f0', border: '#b2dfcc' },
  B: { label: 'Grade B', sublabel: 'Good',           color: '#0066c0', bg: '#e8f4fd', border: '#90caf9' },
  C: { label: 'Grade C', sublabel: 'Acceptable',     color: '#C45500', bg: '#fff4e5', border: '#ffc078' },
  D: { label: 'Grade D', sublabel: 'Parts / Repair', color: '#B12704', bg: '#fdecea', border: '#ef9a9a' },
};
const GRADE_SCORE = { A: 100, B: 75, C: 50, D: 25 };

// ─── Sub-components ───────────────────────────────────────────────────────────

const AIVerifiedBadge = () => (
  <Tooltip title="Condition graded by Amazon's machine learning inspection system" arrow>
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1.2, py: 0.5, borderRadius: '7px',
      background: 'linear-gradient(90deg,#131921,#232F3E)',
      border: '1px solid rgba(255,153,0,0.7)', cursor: 'default',
    }}>
      <VerifiedRounded sx={{ fontSize: 14, color: '#FF9900' }} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF9900', letterSpacing: 0.6 }}>AI VERIFIED</Typography>
    </Box>
  </Tooltip>
);

const LifeScoreRing = ({ score, large = false }) => {
  const r    = large ? 36 : 22;
  const size = large ? 84 : 56;
  const sw   = large ? 6 : 4;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? '#067D62' : score >= 50 ? '#FF9900' : '#B12704';

  return (
    <Tooltip title={`Life Score ${score}/100 — AI-estimated remaining product life`} arrow>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0, cursor: 'default' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ebebeb" strokeWidth={sw} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: large ? '1.1rem' : '0.7rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</Typography>
          <Typography sx={{ fontSize: large ? '0.52rem' : '0.42rem', color: '#aaa', fontWeight: 700, letterSpacing: 0.5 }}>LIFE</Typography>
        </Box>
      </Box>
    </Tooltip>
  );
};

const GradeBar = ({ grade }) => {
  const cfg   = GRADE_CONFIG[grade] || GRADE_CONFIG.B;
  const score = GRADE_SCORE[grade]  || 50;
  return (
    <Box sx={{ p: 1.5, borderRadius: '10px', border: `1px solid ${cfg.border}`, bgcolor: cfg.bg }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Typography sx={{ fontWeight: 800, color: cfg.color, fontSize: '0.88rem' }}>{cfg.label}</Typography>
          <Typography sx={{ color: cfg.color, opacity: 0.75, fontSize: '0.78rem' }}>— {cfg.sublabel}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 700, color: cfg.color, fontSize: '0.78rem' }}>{score}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate" value={score}
        sx={{ height: 6, borderRadius: 3, bgcolor: `${cfg.border}55`,
          '& .MuiLinearProgress-bar': { bgcolor: cfg.color, borderRadius: 3 } }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.7 }}>
        {['D','C','B','A'].map((g) => (
          <Typography key={g} sx={{
            fontSize: '0.6rem', fontWeight: 700,
            color: g === grade ? cfg.color : '#ccc',
            bgcolor: g === grade ? cfg.bg : 'transparent',
            border: `1px solid ${g === grade ? cfg.border : 'transparent'}`,
            px: 0.6, borderRadius: 0.5,
          }}>
            {g}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

// ─── AI Assessment ────────────────────────────────────────────────────────────

const FINDING_ICONS = {
  pass:    <CheckCircleRounded  sx={{ fontSize: 16, color: '#067D62', flexShrink: 0 }} />,
  warning: <WarningAmberRounded sx={{ fontSize: 16, color: '#C45500', flexShrink: 0 }} />,
  fail:    <WarningAmberRounded sx={{ fontSize: 16, color: '#B12704', flexShrink: 0 }} />,
};

const AIAssessment = ({ assessment }) => (
  <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
    <Box sx={{ background: 'linear-gradient(90deg,#131921,#1e2f40)', px: 2.5, py: 1.8, display: 'flex', alignItems: 'center', gap: 1.2 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(255,153,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SmartToyRounded sx={{ color: '#FF9900', fontSize: 18 }} />
      </Box>
      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>AI Assessment Summary</Typography>
      <Box sx={{ ml: 'auto' }}><AIVerifiedBadge /></Box>
    </Box>

    <Box sx={{ px: 2.5, py: 2, bgcolor: '#fdfcfa', borderBottom: '1px solid #f0f0f0' }}>
      <Typography sx={{
        fontSize: '0.88rem', color: '#333', lineHeight: 1.75, fontStyle: 'italic',
        '&::before': { content: '"\\201C"', color: '#FF9900', fontWeight: 900, fontSize: '1.2rem', mr: 0.3 },
        '&::after':  { content: '"\\201D"', color: '#FF9900', fontWeight: 900, fontSize: '1.2rem', ml: 0.3 },
      }}>
        {assessment.summary}
      </Typography>
    </Box>

    <Box sx={{ px: 2.5, py: 2 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#aaa', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Inspection Findings
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {assessment.findings.map(({ status, text }, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, py: 0.3 }}>
            {FINDING_ICONS[status]}
            <Typography sx={{ fontSize: '0.83rem', color: '#333', lineHeight: 1.5 }}>{text}</Typography>
          </Box>
        ))}
      </Box>
    </Box>

    <Box sx={{ px: 2.5, pb: 2.5 }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#555' }}>Overall Condition Score</Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#067D62' }}>{assessment.overallScore}/100</Typography>
      </Box>
      <LinearProgress
        variant="determinate" value={assessment.overallScore}
        sx={{ height: 8, borderRadius: 4, bgcolor: '#ebebeb',
          '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#FF9900,#067D62)', borderRadius: 4 } }}
      />
      <Typography sx={{ fontSize: '0.65rem', color: '#aaa', mt: 0.8 }}>
        Assessed {assessment.assessedAt} · Model v{assessment.modelVersion}
      </Typography>
    </Box>
  </Box>
);

// ─── Trust row ────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: <ShieldRounded        sx={{ color: '#067D62', fontSize: 18 }} />, label: 'Amazon Guarantee',  sub: 'Full buyer protection' },
    { icon: <LocalShippingRounded sx={{ color: '#0066c0', fontSize: 18 }} />, label: 'Free Delivery',     sub: 'On orders over ₹500' },
  { icon: <ReplayRounded        sx={{ color: '#C45500', fontSize: 18 }} />, label: '30-Day Returns',    sub: 'Hassle-free' },
  { icon: <VerifiedRounded      sx={{ color: '#FF9900', fontSize: 18 }} />, label: 'AI Inspected',      sub: 'Every item checked' },
];

// ─── Mock product ─────────────────────────────────────────────────────────────

const MOCK_PRODUCT = {
  id: 'rm-demo-1',
  title: 'Sony WH-1000XM4 Wireless Industry Leading Noise Canceling Overhead Headphones',
  images: [
    'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg',
    'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg',
    'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg',
    'https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg',
  ],
  price: 199.99, originalPrice: 349.99,
  condition: 'Refurbished', grade: 'A', lifeScore: 94, aiVerified: true,
  rating: 4.7, reviews: 2340, category: 'Electronics',
  description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI, coupled with two original Sony algorithms — delivers an unprecedented, exceptional sound quality. Up to 30-hour battery life with quick charging (10 min charge for 5 hours of playback).',
  assessment: {
    summary: 'No visible dents or cracks. Minor cosmetic wear detected on headband padding. All electronic components tested and functioning within original specifications.',
    findings: [
      { status: 'pass',    text: 'No structural damage or cracks detected on housing.' },
      { status: 'pass',    text: 'Audio drivers, ANC, and Bluetooth verified at factory spec.' },
      { status: 'pass',    text: 'Battery holds full charge — 29.5 hrs measured (98% of rated).' },
      { status: 'warning', text: 'Minor surface scuff on left ear cup — non-functional, cosmetic only.' },
      { status: 'pass',    text: 'All controls, touch sensors, and mic tested and operational.' },
      { status: 'pass',    text: 'Original cable and carry case included.' },
    ],
    overallScore: 94, assessedAt: '12 Jun 2025', modelVersion: '3.4.1',
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ReMatchProductDetails = () => {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { id }        = useParams();
  const { addToCart } = useCart();
  const { user }      = useAuth();

  const [product, setProduct] = useState(location.state?.product ?? null);
  const [activeImg, setActiveImg] = useState(0);
  const [wished,    setWished]    = useState(false);
  const [snack,     setSnack]     = useState({ open: false, msg: '', severity: 'success' });

  const awardGreenCredits = useCallback(() => {
    if (user?.id) creditsApi.awardCredits(user.id, product.lifeScore ?? 75, product.title).catch(() => {});
  }, [user, product]);

  useEffect(() => {
    if (product) return;  // already have it from navigation state
    if (!id) { setProduct(MOCK_PRODUCT); return; }
    getProduct(id)
      .then(res => setProduct(res.data?.data ?? MOCK_PRODUCT))
      .catch(() => { setProduct(MOCK_PRODUCT); });
  }, [id, product]);

  if (!product) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Skeleton variant="rounded" width={800} height={500} />
    </Box>
  );

  const images     = product.images ?? (product.imageUrl ? [product.imageUrl] : [product.image]);
  const grade      = product.grade ?? product.conditionGrade ?? 'A';
  const lifeScore  = product.lifeScore  ?? 94;
  const aiVerified = product.aiVerified !== false;
  const discount   = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const cfg        = GRADE_CONFIG[grade] || GRADE_CONFIG.B;

  const cartPayload = {
    ...product, image: images[0],
    rating: { rate: product.rating ?? 4.5, count: product.reviews ?? 0 },
  };

  const handleAddToCart = () => {
    addToCart(cartPayload);
    awardGreenCredits();
    setSnack({ open: true, msg: '🌿 Added to cart & Green Credits awarded!', severity: 'success' });
  };

  const handleBuyNow = () => {
    addToCart(cartPayload);
    awardGreenCredits();
    navigate('/cart');
  };

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1300, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, md: 3 } }}>

        {/* ── Nav ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Button
            startIcon={<ArrowBack sx={{ fontSize: '1rem !important' }} />}
            onClick={() => navigate('/rematch')}
            sx={{ color: '#007185', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', p: 0.5, minWidth: 0 }}
          >
            Back to ReMatch
          </Button>
          <Typography sx={{ color: '#ccc' }}>·</Typography>
          <Breadcrumbs sx={{ fontSize: '0.78rem' }}>
            <Link underline="hover" color="#007185" sx={{ cursor: 'pointer', fontSize: '0.78rem' }} onClick={() => navigate('/')}>Home</Link>
            <Link underline="hover" color="#007185" sx={{ cursor: 'pointer', fontSize: '0.78rem' }} onClick={() => navigate('/rematch')}>ReMatch</Link>
            <Typography color="text.secondary" noWrap sx={{ maxWidth: 200, fontSize: '0.78rem' }}>{product.title}</Typography>
          </Breadcrumbs>
        </Box>

        {/* ── Main white card ── */}
        <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e8e8', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
          <Grid container>

            {/* ── LEFT: Gallery ── */}
            <Grid item xs={12} md={5} sx={{ p: { xs: 2, md: 3 }, borderRight: { md: '1px solid #f0f0f0' } }}>
              {/* Main image */}
              <Box sx={{ position: 'relative', borderRadius: '12px', bgcolor: '#f7f7f7', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360, p: 3, mb: 2, overflow: 'hidden' }}>
                {/* Discount pill */}
                <Box sx={{
                  position: 'absolute', top: 14, left: 14,
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  bgcolor: '#B12704', color: '#fff', fontWeight: 800, fontSize: '0.76rem',
                  px: 1.2, py: 0.5, borderRadius: '20px', boxShadow: '0 2px 8px rgba(177,39,4,0.35)',
                }}>
                  <AutorenewRounded sx={{ fontSize: 12 }} />
                  -{discount}% ReMatch
                </Box>
                {/* Wishlist */}
                <Box
                  onClick={() => setWished((w) => !w)}
                  sx={{
                    position: 'absolute', top: 14, right: 14,
                    bgcolor: '#fff', borderRadius: '50%', width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer',
                    transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.15)' },
                  }}
                >
                  {wished
                    ? <FavoriteRounded sx={{ fontSize: 17, color: '#e53935' }} />
                    : <FavoriteBorderRounded sx={{ fontSize: 17, color: '#aaa' }} />}
                </Box>
                <img
                  src={images[activeImg]}
                  alt={product.title}
                  style={{ maxHeight: 320, maxWidth: '100%', objectFit: 'contain', transition: 'opacity 0.2s' }}
                />
              </Box>
              {/* Thumbnails */}
              {images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {images.map((src, i) => (
                    <Box
                      key={i}
                      onClick={() => setActiveImg(i)}
                      sx={{
                        width: 64, height: 64, borderRadius: '10px',
                        border: `2px solid ${i === activeImg ? '#FF9900' : '#e8e8e8'}`,
                        bgcolor: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', overflow: 'hidden',
                        transition: 'border-color 0.2s, transform 0.15s',
                        '&:hover': { borderColor: '#FF9900', transform: 'scale(1.05)' },
                      }}
                    >
                      <img src={src} alt="" style={{ maxHeight: 52, maxWidth: 52, objectFit: 'contain' }} />
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* ── CENTER: Info ── */}
            <Grid item xs={12} md={4} sx={{ p: { xs: 2, md: 3 }, borderRight: { md: '1px solid #f0f0f0' } }}>
              {/* Badges */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 1.5 }}>
                {aiVerified && <AIVerifiedBadge />}
                <Chip label={product.condition} size="small" sx={{
                  fontWeight: 700, fontSize: '0.68rem', height: 22, borderRadius: '6px',
                  bgcolor: product.condition === 'Refurbished' ? '#eaf7f0' : '#e8f4fd',
                  color:   product.condition === 'Refurbished' ? '#067D62' : '#0066c0',
                }} />
                <Chip label={product.category} size="small" sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, borderRadius: '6px', bgcolor: '#f0f0f0', color: '#555' }} />
              </Box>

              {/* Title */}
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.45, color: '#0F1111', mb: 1.2, fontSize: '1rem' }}>
                {product.title}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Rating value={product.rating ?? 4.5} precision={0.1} readOnly size="small" />
                <Typography sx={{ color: '#007185', fontSize: '0.8rem', cursor: 'pointer' }}>
                  {(product.reviews ?? 0).toLocaleString()} ratings
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Price */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6 }}>ReMatch Price</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 0.3 }}>
                  <Typography sx={{ fontSize: '2.1rem', fontWeight: 900, color: '#B12704', lineHeight: 1 }}>
                    ₹{product.price.toFixed(2)}
                  </Typography>
                  <Box>
                    <Typography sx={{ fontSize: '0.8rem', color: '#aaa', textDecoration: 'line-through' }}>₹{product.originalPrice.toFixed(2)}</Typography>
                    <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#067D62' }}>Save ₹{(product.originalPrice - product.price).toFixed(2)} ({discount}%)</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Life Score + Grade */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', mb: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, border: '1px solid #e8e8e8', borderRadius: '12px', px: 2, py: 1.5, bgcolor: '#fafafa', flexShrink: 0 }}>
                  <LifeScoreRing score={lifeScore} large />
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#888' }}>Life Score</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <GradeBar grade={grade} />
                  <Box sx={{ mt: 1, p: 1.2, borderRadius: '8px', bgcolor: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.6 }}>
                      <strong style={{ color: cfg.color }}>What this means: </strong>
                      {grade === 'A' && 'Product looks and works like new. No functional issues.'}
                      {grade === 'B' && 'Minor wear visible but fully functional. Excellent value.'}
                      {grade === 'C' && 'Noticeable wear or scuffs. All core features work correctly.'}
                      {grade === 'D' && 'Heavy wear or for parts use. May have functional limitations.'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Description */}
              <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.8 }}>
                {product.description}
              </Typography>
            </Grid>

            {/* ── RIGHT: Buy Box ── */}
            <Grid item xs={12} md={3} sx={{ p: { xs: 2, md: 0 } }}>
              <Box sx={{ position: { md: 'sticky' }, top: 80, p: { xs: 0, md: 2.5 } }}>

                {/* Green credit teaser */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  bgcolor: '#eaf7f0', border: '1px solid #b2dfcc',
                  borderRadius: '10px', px: 1.5, py: 1, mb: 2,
                }}>
                  <EmojiNature sx={{ color: '#067D62', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#067D62', fontWeight: 600 }}>
                    Earn <strong>{5 + Math.max(0, Math.round((lifeScore - 50) * 0.5))} Green Credits</strong> with this purchase
                  </Typography>
                </Box>

                {/* Price */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>ReMatch Deal</Typography>
                  <Typography sx={{ fontSize: '1.9rem', fontWeight: 900, color: '#B12704', lineHeight: 1.1 }}>
                    ₹{product.price.toFixed(2)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#aaa', textDecoration: 'line-through' }}>Was ₹{product.originalPrice.toFixed(2)}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#067D62', mt: 0.2 }}>
                    ✓ You save ₹{(product.originalPrice - product.price).toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Condition summary */}
                {[
                  { label: 'Condition',   value: `${cfg.label} — ${cfg.sublabel}`, color: cfg.color },
                  { label: 'Life Score',  value: `${lifeScore}/100`,               color: lifeScore >= 75 ? '#067D62' : '#C45500' },
                  { label: 'AI Verified', value: aiVerified ? '✓ Yes' : '—',       color: aiVerified ? '#067D62' : '#aaa' },
                ].map(({ label, value, color }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.7 }}>
                    <Typography sx={{ fontSize: '0.76rem', color: '#777' }}>{label}</Typography>
                    <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color }}>{value}</Typography>
                  </Box>
                ))}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.8, mt: 0.5 }}>
                  <LocalShippingRounded sx={{ fontSize: 15, color: '#555' }} />
                  <Typography sx={{ fontSize: '0.76rem', color: '#555' }}>
                    <strong>FREE Delivery</strong> — arrives tomorrow
                  </Typography>
                </Box>

                {/* Buttons */}
                <Button
                  fullWidth variant="contained"
                  startIcon={<FlashOnRounded />}
                  onClick={handleBuyNow}
                  sx={{
                    background: 'linear-gradient(90deg,#FF9900,#e68a00)',
                    color: '#131921', fontWeight: 800, textTransform: 'none',
                    borderRadius: '10px', fontSize: '0.92rem', py: 1.2, mb: 1,
                    boxShadow: '0 4px 14px rgba(255,153,0,0.3)',
                    '&:hover': { background: 'linear-gradient(90deg,#e68a00,#cc7a00)', boxShadow: '0 5px 18px rgba(255,153,0,0.45)' },
                  }}
                >
                  Buy Now
                </Button>
                <Button
                  fullWidth variant="outlined"
                  startIcon={<AddShoppingCart />}
                  onClick={handleAddToCart}
                  sx={{
                    borderColor: '#d0d0d0', color: '#131921', fontWeight: 700,
                    textTransform: 'none', borderRadius: '10px', fontSize: '0.88rem', py: 1.1,
                    '&:hover': { borderColor: '#FF9900', bgcolor: '#fff8e1' },
                  }}
                >
                  Add to Cart
                </Button>

                {/* Trust */}
                <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {TRUST_ITEMS.map(({ icon, label, sub }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.2 }}>{label}</Typography>
                        <Typography sx={{ fontSize: '0.64rem', color: '#aaa' }}>{sub}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ── AI Assessment ── */}
        {product.assessment && (
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={8}>
              <AIAssessment assessment={product.assessment} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e8e8e8', borderRadius: '14px', overflow: 'hidden', height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <Box sx={{ bgcolor: '#f7f7f7', px: 2.5, py: 1.5, borderBottom: '1px solid #ebebeb' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferRounded sx={{ fontSize: 16, color: '#FF9900' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#131921' }}>ReMatch Summary</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.4 }}>
                  {[
                    { label: 'ReMatch Price',   value: `₹${product.price.toFixed(2)}`,          color: '#B12704' },
                    { label: 'Original Price',  value: `₹${product.originalPrice.toFixed(2)}`,  color: '#aaa' },
                    { label: 'You Save',        value: `₹${(product.originalPrice - product.price).toFixed(2)} (${discount}%)`, color: '#067D62' },
                    { label: 'Condition Grade', value: `${cfg.label} — ${cfg.sublabel}`,         color: cfg.color },
                    { label: 'Life Score',      value: `${lifeScore}/100`,                       color: lifeScore >= 75 ? '#067D62' : '#C45500' },
                    { label: 'AI Verified',     value: aiVerified ? 'Yes ✓' : 'No',              color: aiVerified ? '#067D62' : '#aaa' },
                    { label: 'Condition Type',  value: product.condition,                        color: '#555' },
                  ].map(({ label, value, color }) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.2, borderBottom: '1px solid #f5f5f5', '&:last-child': { border: 0, pb: 0 } }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#777' }}>{label}</Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={closeSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled" sx={{ fontWeight: 600, borderRadius: '10px' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReMatchProductDetails;
