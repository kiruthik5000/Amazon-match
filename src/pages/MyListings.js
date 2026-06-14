import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, Button,
  Divider, Menu, MenuItem, IconButton, Tooltip, CircularProgress, Alert,
} from '@mui/material';
import {
  Autorenew, StorefrontRounded, AddRounded,
  MoreVertRounded, VisibilityRounded, DeleteRounded,
  CheckCircleRounded, HourglassTopRounded, LocalOfferRounded,
  CancelRounded, EmojiEventsRounded, AutoAwesomeRounded,
  TrendingUpRounded, InventoryRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import backendApi from '../api/backendAxios';
import { useAuth } from '../context/AuthContext';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS = {
  'Pending Review': { color: '#e65100', bg: '#fff3e0', border: '#ffcc80', icon: <HourglassTopRounded sx={{ fontSize: 13 }} /> },
  'Approved':       { color: '#1565c0', bg: '#e3f2fd', border: '#90caf9', icon: <CheckCircleRounded  sx={{ fontSize: 13 }} /> },
  'Listed':         { color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', icon: <LocalOfferRounded   sx={{ fontSize: 13 }} /> },
  'Sold':           { color: '#6a1b9a', bg: '#f3e5f5', border: '#ce93d8', icon: <EmojiEventsRounded  sx={{ fontSize: 13 }} /> },
  'Rejected':       { color: '#b71c1c', bg: '#ffebee', border: '#ef9a9a', icon: <CancelRounded        sx={{ fontSize: 13 }} /> },
};

const GRADE_COLOR = { A: '#2e7d32', B: '#1565c0', C: '#e65100', D: '#b71c1c' };

const STATUS_MAP = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  LISTED: 'Listed',
  SOLD: 'Sold',
  REJECTED: 'Rejected',
};

// ─── Mock listings ────────────────────────────────────────────────────────────

const MOCK_LISTINGS = [
  {
    id: 'l1',
    name: 'Sony WH-1000XM4 Headphones',
    category: 'Electronics',
    brand: 'Sony',
    image: 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg',
    originalPrice: 34999,
    askingPrice: 18500,
    status: 'Listed',
    grade: 'A',
    lifeScore: 91,
    confidence: 95,
    submittedAt: '12 Jun 2025',
    views: 142,
    interested: 8,
  },
  {
    id: 'l2',
    name: 'Samsung 49" CHG90 Gaming Monitor',
    category: 'Electronics',
    brand: 'Samsung',
    image: 'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg',
    originalPrice: 59999,
    askingPrice: 38000,
    status: 'Approved',
    grade: 'B',
    lifeScore: 78,
    confidence: 88,
    submittedAt: '10 Jun 2025',
    views: 64,
    interested: 3,
  },
  {
    id: 'l3',
    name: 'Fjallraven Kanken Mini Backpack',
    category: "Women's Clothing",
    brand: 'Fjallraven',
    image: 'https://fakestoreapi.com/img/81fAn0HKldL._AC_UY879_.jpg',
    originalPrice: 7999,
    askingPrice: 4200,
    status: 'Sold',
    grade: 'A',
    lifeScore: 88,
    confidence: 92,
    submittedAt: '2 Jun 2025',
    views: 310,
    interested: 21,
  },
  {
    id: 'l4',
    name: 'Mens Cotton Jacket',
    category: "Men's Clothing",
    brand: 'Levis',
    image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
    originalPrice: 8999,
    askingPrice: 3500,
    status: 'Pending Review',
    grade: 'B',
    lifeScore: 72,
    confidence: 81,
    submittedAt: '14 Jun 2025',
    views: 0,
    interested: 0,
  },
  {
    id: 'l5',
    name: 'White Gold Diamond Stud Earrings',
    category: 'Jewellery',
    brand: 'Malabar Gold',
    image: 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_FMwebp_QL65_.jpg',
    originalPrice: 49999,
    askingPrice: 28000,
    status: 'Rejected',
    grade: 'C',
    lifeScore: 55,
    confidence: 62,
    submittedAt: '8 Jun 2025',
    views: 0,
    interested: 0,
    rejectReason: 'Insufficient image quality. Please resubmit with clearer photos.',
  },
  {
    id: 'l6',
    name: 'WD 4TB Gaming Drive External HDD',
    category: 'Electronics',
    brand: 'Western Digital',
    image: 'https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg',
    originalPrice: 10999,
    askingPrice: 6800,
    status: 'Listed',
    grade: 'A',
    lifeScore: 94,
    confidence: 97,
    submittedAt: '5 Jun 2025',
    views: 87,
    interested: 5,
  },
];

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, value, label, color }) => (
  <Box sx={{
    bgcolor: '#fff', borderRadius: '14px', border: '1px solid #e8e8e8',
    p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)', flex: 1, minWidth: 140,
  }}>
    <Box sx={{
      width: 44, height: 44, borderRadius: '12px',
      bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0F1111', lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#888', mt: 0.3 }}>{label}</Typography>
    </Box>
  </Box>
);

// ─── Listing card ─────────────────────────────────────────────────────────────

const ListingCard = ({ listing, onDelete }) => {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const st = STATUS[listing.status];
  const discount = Math.round((1 - listing.askingPrice / listing.originalPrice) * 100);

  return (
    <Box sx={{
      bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e8e8',
      overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      '&:hover': { boxShadow: '0 8px 28px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
    }}>
      {/* Image + status strip */}
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={listing.image}
          alt={listing.name}
          sx={{ width: '100%', height: 180, objectFit: 'contain', bgcolor: '#f8f8f8', display: 'block', p: 1 }}
        />
        {/* Status badge */}
        <Chip
          icon={<Box sx={{ color: `${st.color} !important`, display: 'flex', ml: '6px !important' }}>{st.icon}</Box>}
          label={listing.status}
          size="small"
          sx={{
            position: 'absolute', top: 10, left: 10,
            bgcolor: st.bg, color: st.color,
            border: `1px solid ${st.border}`,
            fontWeight: 700, fontSize: '0.68rem', height: 24,
          }}
        />
        {/* Grade badge */}
        <Box sx={{
          position: 'absolute', top: 10, right: 10,
          width: 28, height: 28, borderRadius: '8px',
          bgcolor: GRADE_COLOR[listing.grade],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${GRADE_COLOR[listing.grade]}60`,
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.8rem', color: '#fff' }}>{listing.grade}</Typography>
        </Box>
        {/* Kebab menu */}
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            position: 'absolute', bottom: 8, right: 8,
            bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', width: 28, height: 28,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}
        >
          <MoreVertRounded sx={{ fontSize: 16 }} />
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem onClick={() => { setAnchor(null); navigate('/rematch/evaluation'); }}>
            <VisibilityRounded sx={{ fontSize: 16, mr: 1, color: '#1565c0' }} /> View Evaluation
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setAnchor(null); onDelete(listing.id); }} sx={{ color: '#d32f2f' }}>
            <DeleteRounded sx={{ fontSize: 16, mr: 1 }} /> Remove Listing
          </MenuItem>
        </Menu>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F1111', lineHeight: 1.4, mb: 0.5 }} noWrap>
          {listing.name}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#888', mb: 1.2 }}>
          {listing.brand} · {listing.category}
        </Typography>

        {/* Prices */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0F1111' }}>
            ₹{listing.askingPrice.toLocaleString('en-IN')}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#999', textDecoration: 'line-through' }}>
            ₹{listing.originalPrice.toLocaleString('en-IN')}
          </Typography>
          <Chip label={`${discount}% off`} size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: '0.62rem', height: 18 }}
          />
        </Box>

        {/* Rejection reason */}
        {listing.status === 'Rejected' && listing.rejectReason && (
          <Box sx={{ bgcolor: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '8px', p: 1, mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#b71c1c', lineHeight: 1.5 }}>
              ⚠ {listing.rejectReason}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 1.5 }} />

        {/* Meta row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Tooltip title="Views">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <VisibilityRounded sx={{ fontSize: 13, color: '#aaa' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#666', fontWeight: 600 }}>{listing.views}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Interested buyers">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <TrendingUpRounded sx={{ fontSize: 13, color: '#aaa' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#666', fontWeight: 600 }}>{listing.interested}</Typography>
              </Box>
            </Tooltip>
          </Box>
          <Typography sx={{ fontSize: '0.68rem', color: '#bbb' }}>{listing.submittedAt}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTERS = ['All', ...Object.keys(STATUS)];

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = user?.id ? `?sellerId=${user.id}` : '';
    backendApi.get(`/rematch/listings${params}`)
      .then((res) => {
        const data = res.data?.data;
        setListings(Array.isArray(data) ? data.map((l) => ({
          id: String(l.id),
          name: l.productName,
          category: l.category,
          brand: l.brand,
          image: l.imageUrls?.[0] || '',
          originalPrice: Number(l.originalPrice),
          askingPrice: Number(l.expectedPrice),
          status: STATUS_MAP[l.status] || 'Pending Review',
          grade: l.conditionGrade || 'B',
          lifeScore: l.lifeScore || 0,
          confidence: l.confidenceScore || 0,
          submittedAt: l.submittedAt ? new Date(l.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
          views: 0,
          interested: 0,
          rejectReason: l.rejectionReason,
        })) : MOCK_LISTINGS);
      })
      .catch(() => {
        setListings(MOCK_LISTINGS);
        setError('Could not load listings from server — showing demo data.');
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleDelete = (id) => setListings((prev) => prev.filter((l) => l.id !== id));

  const filtered = activeFilter === 'All' ? listings : listings.filter((l) => l.status === activeFilter);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress sx={{ color: '#FF9900' }} /></Box>;

  const counts = Object.fromEntries(
    Object.keys(STATUS).map((s) => [s, listings.filter((l) => l.status === s).length])
  );

  const totalViews    = listings.reduce((s, l) => s + l.views, 0);
  const totalInterest = listings.reduce((s, l) => s + l.interested, 0);
  const soldCount     = counts['Sold'] ?? 0;

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2f45 40%, #071424 100%)',
        px: { xs: 3, md: 8 }, py: { xs: 4, md: 5 },
        position: 'relative', overflow: 'hidden',
      }}>
        {[260, 160, 80].map((size, i) => (
          <Box key={i} sx={{
            position: 'absolute', right: -size / 3, top: -size / 3,
            width: size, height: size, borderRadius: '50%',
            border: `1.5px solid rgba(255,153,0,${0.06 + i * 0.04})`,
            pointerEvents: 'none',
          }} />
        ))}

        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
              <Box sx={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
                <Autorenew sx={{ fontSize: 36, color: '#FF9900' }} />
                <Box sx={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: 11, height: 11, bgcolor: '#FF9900', borderRadius: '3px',
                }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontWeight: 900, color: '#FF9900', fontFamily: 'Georgia, serif',
                  fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.5px', lineHeight: 1,
                }}>
                  My Listings
                </Typography>
                <Typography sx={{ color: '#8ba7be', fontSize: '0.82rem', mt: 0.3, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 300 }}>
                  Seller Dashboard · Amazon ReMatch
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ color: '#7fa3bf', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 460 }}>
              Track your submitted products, monitor status updates, and manage your ReMatch listings.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate('/rematch/sell')}
            sx={{
              bgcolor: '#FF9900', color: '#131921', fontWeight: 800,
              textTransform: 'none', borderRadius: '8px', px: 3, py: 1.2,
              alignSelf: 'flex-start',
              boxShadow: '0 4px 15px rgba(255,153,0,0.35)',
              '&:hover': { bgcolor: '#e68a00' },
            }}
          >
            New Listing
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, md: 4 } }}>

        {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

        {/* ── Summary Stats ── */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <StatCard icon={<InventoryRounded sx={{ fontSize: 22 }} />}   value={listings.length} label="Total Submitted"  color="#FF9900" />
          <StatCard icon={<LocalOfferRounded sx={{ fontSize: 22 }} />}  value={counts['Listed'] ?? 0}  label="Currently Listed"  color="#2e7d32" />
          <StatCard icon={<EmojiEventsRounded sx={{ fontSize: 22 }} />} value={soldCount}        label="Sold"             color="#6a1b9a" />
          <StatCard icon={<TrendingUpRounded sx={{ fontSize: 22 }} />}  value={totalViews}       label="Total Views"      color="#1565c0" />
          <StatCard icon={<AutoAwesomeRounded sx={{ fontSize: 22 }} />} value={totalInterest}    label="Buyer Interest"   color="#e65100" />
        </Box>

        {/* ── Status Filter Tabs ── */}
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3,
          bgcolor: '#fff', p: 1.5, borderRadius: '12px',
          border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            const st = STATUS[f];
            const count = f === 'All' ? listings.length : (counts[f] ?? 0);
            return (
              <Chip
                key={f}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    {st && <Box sx={{ display: 'flex', color: isActive ? st.color : '#aaa' }}>{st.icon}</Box>}
                    <span>{f}</span>
                    <Box sx={{
                      minWidth: 18, height: 18, borderRadius: '9px', px: 0.6,
                      bgcolor: isActive ? (st?.color ?? '#FF9900') : '#eee',
                      color: isActive ? '#fff' : '#999',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.62rem', fontWeight: 800,
                    }}>
                      {count}
                    </Box>
                  </Box>
                }
                onClick={() => setActiveFilter(f)}
                sx={{
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                  height: 34, px: 0.5,
                  bgcolor: isActive ? (st?.bg ?? '#fff8e1') : '#fafafa',
                  color: isActive ? (st?.color ?? '#FF9900') : '#555',
                  border: `1px solid ${isActive ? (st?.border ?? '#FF9900') : '#e0e0e0'}`,
                  '&:hover': { bgcolor: st?.bg ?? '#fff8e1' },
                }}
              />
            );
          })}
        </Box>

        {/* ── Listings Grid ── */}
        {filtered.length === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 8, px: 3,
            border: '2px dashed #e8e8e8', borderRadius: '16px', bgcolor: '#fff',
          }}>
            <StorefrontRounded sx={{ fontSize: 48, color: '#ddd', mb: 1.5 }} />
            <Typography sx={{ fontWeight: 700, color: '#555', mb: 0.5 }}>
              No {activeFilter === 'All' ? '' : activeFilter} listings
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#aaa', mb: 3 }}>
              {activeFilter === 'All'
                ? 'You haven\'t submitted any products yet.'
                : `You have no listings with status "${activeFilter}".`}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => navigate('/rematch/sell')}
              sx={{
                bgcolor: '#FF9900', color: '#131921', fontWeight: 800,
                textTransform: 'none', borderRadius: '8px', px: 3,
                '&:hover': { bgcolor: '#e68a00' },
              }}
            >
              Submit a Product
            </Button>
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: 'repeat(4, 1fr)' },
            gap: 2.5,
          }}>
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onDelete={handleDelete} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MyListings;
