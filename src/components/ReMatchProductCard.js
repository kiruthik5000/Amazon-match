import React, { useState } from 'react';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Box, Chip, Tooltip, LinearProgress, Skeleton,
} from '@mui/material';
import {
  AutorenewRounded, VerifiedRounded, FlashOnRounded,
  FavoriteBorderRounded, FavoriteRounded, AddShoppingCartRounded,
  TipsAndUpdatesRounded, CloseRounded,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_CONFIG = {
  A: { label: 'Grade A', sublabel: 'Like New',       color: '#067D62', bg: '#eaf7f0', border: '#b2dfcc' },
  B: { label: 'Grade B', sublabel: 'Good',           color: '#0066c0', bg: '#e8f4fd', border: '#90caf9' },
  C: { label: 'Grade C', sublabel: 'Acceptable',     color: '#C45500', bg: '#fff4e5', border: '#ffc078' },
  D: { label: 'Grade D', sublabel: 'Parts / Repair', color: '#B12704', bg: '#fdecea', border: '#ef9a9a' },
};
const GRADE_SCORE = { A: 100, B: 75, C: 50, D: 25 };

// Match score colour thresholds
const matchColor = (score) =>
  score >= 85 ? '#067D62' : score >= 65 ? '#0066c0' : score >= 45 ? '#C45500' : '#888';

// ─── Sub-components ───────────────────────────────────────────────────────────

const LifeScoreRing = ({ score }) => {
  const r    = 22;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? '#067D62' : score >= 50 ? '#FF9900' : '#B12704';
  return (
    <Tooltip title={`Life Score ${score}/100 — AI-estimated remaining product life`} arrow>
      <Box sx={{ position: 'relative', width: 52, height: 52, flexShrink: 0, cursor: 'default' }}>
        <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="26" cy="26" r={r} fill="none" stroke="#ebebeb" strokeWidth="4" />
          <circle
            cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.7s ease' }}
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</Typography>
          <Typography sx={{ fontSize: '0.42rem', color: '#aaa', fontWeight: 700, letterSpacing: 0.4 }}>LIFE</Typography>
        </Box>
      </Box>
    </Tooltip>
  );
};

const AIBadge = () => (
  <Tooltip title="Condition graded by Amazon's ML inspection system" arrow>
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      px: 0.8, py: 0.3, borderRadius: '5px',
      background: 'linear-gradient(90deg,#131921,#232F3E)',
      border: '1px solid rgba(255,153,0,0.7)', cursor: 'default',
    }}>
      <VerifiedRounded sx={{ fontSize: 10, color: '#FF9900' }} />
      <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#FF9900', letterSpacing: 0.6 }}>AI VERIFIED</Typography>
    </Box>
  </Tooltip>
);

const GradeBar = ({ grade }) => {
  const cfg   = GRADE_CONFIG[grade] || GRADE_CONFIG.B;
  const score = GRADE_SCORE[grade]  || 50;
  return (
    <Box sx={{ px: 1.2, py: 0.9, borderRadius: '8px', border: `1px solid ${cfg.border}`, bgcolor: cfg.bg }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: cfg.color }}>
          {cfg.label} <span style={{ fontWeight: 500, opacity: 0.8 }}>— {cfg.sublabel}</span>
        </Typography>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: cfg.color }}>{score}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate" value={score}
        sx={{ height: 3.5, borderRadius: 2, bgcolor: `${cfg.border}66`,
          '& .MuiLinearProgress-bar': { bgcolor: cfg.color, borderRadius: 2 } }}
      />
    </Box>
  );
};

// ─── Match Score Badge ────────────────────────────────────────────────────────

const MatchScoreBadge = ({ score }) => {
  const color = matchColor(score);
  const circ  = 2 * Math.PI * 10;
  const fill  = (score / 100) * circ;
  return (
    <Tooltip title={`${score}% match score — how well this product fits your preferences`} arrow>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.6,
        bgcolor: '#fff', border: `1.5px solid ${color}22`,
        borderRadius: '20px', px: 0.9, py: 0.35,
        boxShadow: `0 1px 6px ${color}22`, cursor: 'default',
      }}>
        <Box sx={{ position: 'relative', width: 26, height: 26, flexShrink: 0 }}>
          <svg width="26" height="26" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="13" cy="13" r="10" fill="none" stroke="#f0f0f0" strokeWidth="3" />
            <circle cx="13" cy="13" r="10" fill="none" stroke={color} strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${fill} ${circ}`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '0.48rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color, whiteSpace: 'nowrap' }}>
            {score}% Match
          </Typography>
          <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: '#666', letterSpacing: 0.2 }}>
            Match Score
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
};

// ─── Match Reasons Strip ──────────────────────────────────────────────────────

const MatchReasonsStrip = ({ reasons, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);
  if (!reasons?.length) return null;

  const visible = expanded ? reasons : reasons.slice(0, 1);

  return (
    <Box sx={{
      borderTop: '1px solid #f0f0f0', mt: 0,
      bgcolor: '#fafffe', px: 1.5, pt: 1, pb: expanded ? 1 : 0.5,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6, flex: 1, minWidth: 0 }}>
          <TipsAndUpdatesRounded sx={{ fontSize: 12, color: '#067D62', mt: 0.15, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            {visible.map((r, i) => (
              <Typography key={i} sx={{
                fontSize: '0.68rem', color: '#2e7d32', lineHeight: 1.5,
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: expanded ? 'normal' : 'nowrap',
              }}>
                {r}
              </Typography>
            ))}
            {reasons.length > 1 && (
              <Typography
                onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                sx={{ fontSize: '0.62rem', color: '#007185', fontWeight: 700, cursor: 'pointer', mt: 0.2 }}
              >
                {expanded ? 'Show less' : `+${reasons.length - 1} more reason${reasons.length - 1 > 1 ? 's' : ''}`}
              </Typography>
            )}
          </Box>
        </Box>
        {onDismiss && (
          <Tooltip title="Dismiss recommendation" arrow>
            <Box
              onClick={(e) => { e.stopPropagation(); onDismiss(); }}
              sx={{ cursor: 'pointer', color: '#ccc', flexShrink: 0, '&:hover': { color: '#e53935' }, mt: 0.1 }}
            >
              <CloseRounded sx={{ fontSize: 13 }} />
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export const ReMatchProductCardSkeleton = () => (
  <Card sx={{ borderRadius: '14px', border: '1px solid #ebebeb', overflow: 'hidden' }}>
    <Box sx={{ m: 1.5, borderRadius: '10px', overflow: 'hidden', bgcolor: '#f5f5f5', height: 190 }}>
      <Skeleton variant="rectangular" height={190} animation="wave" />
    </Box>
    <CardContent sx={{ pt: 1, px: 2 }}>
      <Skeleton width="40%" height={18} sx={{ mb: 0.5 }} />
      <Skeleton width="95%" height={16} />
      <Skeleton width="75%" height={16} sx={{ mb: 1.5 }} />
      <Skeleton width="50%" height={28} sx={{ mb: 1 }} />
      <Skeleton width="100%" height={32} sx={{ borderRadius: '8px' }} />
    </CardContent>
    <CardActions sx={{ px: 2, pb: 2 }}>
      <Skeleton variant="rounded" width="100%" height={40} />
    </CardActions>
  </Card>
);

// ─── Main Card ────────────────────────────────────────────────────────────────

const ReMatchProductCard = ({ product, onBuyNow, onDismiss }) => {
  const { addToCart } = useCart();
  const navigate      = useNavigate();
  const [wished, setWished] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const price = product.price ?? product.rematchPrice ?? 0;
  const originalPrice = product.originalPrice ?? price;
  const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const grade = product.grade ?? product.conditionGrade ?? 'B';
  const condition = product.condition ?? (product.conditionType === 'REFURBISHED' ? 'Refurbished' : product.conditionType === 'RETURNED' ? 'Returned' : 'Refurbished');
  const lifeScore = product.lifeScore ?? 70;
  const aiVerified = product.aiVerified !== false;
  const matchScore = product.matchScore ?? null;
  const matchReasons = Array.isArray(product.matchReasons)
    ? product.matchReasons
    : typeof product.matchReasons === 'string'
      ? product.matchReasons.split('|||').filter(Boolean)
      : [];
  const recommendationReason = product.reason || (matchReasons.length ? matchReasons[0] : null);
  const imageUrl = product.image ?? product.imageUrl;

  const cartProduct = {
    ...product,
    price,
    originalPrice,
    image: imageUrl,
    rating: { rate: product.rating ?? 4, count: product.reviews ?? product.reviewCount ?? 0 },
  };

  const handleBuyNow    = (e) => { e.stopPropagation(); onBuyNow ? onBuyNow(product) : addToCart(cartProduct); };
  const handleAddCart   = (e) => { e.stopPropagation(); addToCart(cartProduct); };
  const handleCardClick = () => navigate(`/rematch/product/${product.id}`, { state: { product } });

  return (
    <Card
      onClick={handleCardClick}
      elevation={0}
      sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        borderRadius: '14px',
        border: matchScore !== null
          ? `1.5px solid ${matchColor(matchScore)}33`
          : '1px solid #e8e8e8',
        cursor: 'pointer', position: 'relative', overflow: 'visible',
        transition: 'box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          transform: 'translateY(-3px)',
          borderColor: '#d0d0d0',
        },
        bgcolor: '#fff',
      }}
    >
      {/* ── Top ribbon ── */}
      <Box sx={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', px: 1.5, zIndex: 2, pointerEvents: 'none' }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.4,
          bgcolor: '#B12704', color: '#fff', fontWeight: 800, fontSize: '0.68rem',
          px: 0.9, py: 0.35, borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(177,39,4,0.35)', pointerEvents: 'auto',
        }}>
          <AutorenewRounded sx={{ fontSize: 10 }} />
          -{discount}%
        </Box>
        <Box
          onClick={(e) => { e.stopPropagation(); setWished((w) => !w); }}
          sx={{
            pointerEvents: 'auto', cursor: 'pointer',
            bgcolor: '#fff', borderRadius: '50%', width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
            transition: 'transform 0.15s',
            '&:hover': { transform: 'scale(1.2)' },
          }}
        >
          {wished
            ? <FavoriteRounded sx={{ fontSize: 15, color: '#e53935' }} />
            : <FavoriteBorderRounded sx={{ fontSize: 15, color: '#aaa' }} />}
        </Box>
      </Box>

      {/* ── Floating badge / time ── */}
      {(product.badge || product.listedAgo) && (
        <Box sx={{
          position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
          zIndex: 3, bgcolor: product.listedAgo ? '#fff4e5' : '#fff8e1',
          border: `1px solid ${product.listedAgo ? '#e68a00' : '#FF9900'}`,
          color: product.listedAgo ? '#B26000' : '#131921',
          fontSize: '0.6rem', fontWeight: 800,
          px: 1.2, py: 0.3, borderRadius: '10px', whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          {product.listedAgo ? `🕐 ${product.listedAgo}` : product.badge}
        </Box>
      )}

      {/* ── Image ── */}
      <Box sx={{
        mt: 2, mx: 1.5, borderRadius: '10px', bgcolor: '#f7f7f7',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: 186, overflow: 'hidden', flexShrink: 0,
      }}>
        {imgErr ? (
          <Box sx={{ color: '#ccc', fontSize: '0.75rem', textAlign: 'center' }}>
            <AutorenewRounded sx={{ fontSize: 32, color: '#ddd', mb: 0.5 }} /><br />No image
          </Box>
        ) : (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={product.title}
            onError={() => setImgErr(true)}
            sx={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', p: 1.5, transition: 'transform 0.3s ease' }}
          />
        )}
      </Box>

      <CardContent sx={{ flex: 1, pb: 0, pt: 1.5, px: 2 }}>
        {/* Badges row — AI badge + condition + match score */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1, flexWrap: 'wrap' }}>
          {aiVerified && <AIBadge />}
          <Chip
            label={condition}
            size="small"
            sx={{
              fontSize: '0.58rem', fontWeight: 700, height: 17, borderRadius: '4px',
              bgcolor: condition === 'Refurbished' ? '#eaf7f0' : '#e8f4fd',
              color:   condition === 'Refurbished' ? '#067D62' : '#0066c0',
            }}
          />
          {matchScore !== null && <MatchScoreBadge score={matchScore} />}
        </Box>

        {/* Title */}
        <Typography sx={{
          fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.45, mb: 1.5, color: '#0F1111',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {product.title}
        </Typography>

        {recommendationReason && (
          <Typography sx={{
            fontSize: '0.72rem', color: '#555', mb: 1.25, minHeight: '1.24rem',
            lineHeight: 1.4, fontWeight: 600,
          }}>
            {recommendationReason}
          </Typography>
        )}

        {/* Price + Life Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: '0.62rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              ReMatch Price
            </Typography>
            <Typography sx={{ fontWeight: 900, color: '#B12704', fontSize: '1.35rem', lineHeight: 1.1 }}>
              ₹{Number(price).toLocaleString('en-IN')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#aaa', textDecoration: 'line-through' }}>
                ₹{Number(originalPrice).toLocaleString('en-IN')}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#067D62', fontWeight: 700 }}>
                Save ₹{Number(originalPrice - price).toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Box>
          <LifeScoreRing score={lifeScore} />
        </Box>

        {/* Grade bar */}
        <GradeBar grade={grade} />
      </CardContent>

      {/* ── Match Reasons Strip ── */}
      {matchReasons.length > 0 && (
        <MatchReasonsStrip reasons={matchReasons} onDismiss={onDismiss} />
      )}

      {/* ── Actions ── */}
      <CardActions sx={{ px: 2, pb: 2, pt: 1.5, gap: 0.8 }}>
        <Button
          variant="contained"
          startIcon={<FlashOnRounded sx={{ fontSize: '1rem !important' }} />}
          onClick={handleBuyNow}
          sx={{
            flex: 1, background: 'linear-gradient(90deg,#FF9900,#e68a00)',
            color: '#131921', fontWeight: 800, textTransform: 'none',
            borderRadius: '8px', fontSize: '0.84rem', py: 0.9,
            boxShadow: '0 3px 12px rgba(255,153,0,0.3)',
            '&:hover': { background: 'linear-gradient(90deg,#e68a00,#cc7a00)', boxShadow: '0 4px 16px rgba(255,153,0,0.45)' },
          }}
        >
          Buy Now
        </Button>
        <Button
          variant="outlined"
          onClick={handleAddCart}
          sx={{
            minWidth: 38, width: 38, height: 38, p: 0, borderRadius: '8px',
            borderColor: '#ddd', color: '#555',
            '&:hover': { borderColor: '#FF9900', color: '#FF9900', bgcolor: '#fff8e1' },
          }}
        >
          <AddShoppingCartRounded sx={{ fontSize: '1.1rem' }} />
        </Button>
      </CardActions>
    </Card>
  );
};

export default ReMatchProductCard;
