import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Chip, Tabs, Tab, Badge, Button,
} from '@mui/material';
import {
  Autorenew, VerifiedUser, BuildCircle,
  EmojiNature, LocalOfferRounded, ShieldRounded, StarRounded,
  StorefrontRounded, SearchRounded,
} from '@mui/icons-material';
import ReMatchProductCard, { ReMatchProductCardSkeleton } from '../components/ReMatchProductCard';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../api/products';
import backendApi from '../api/backendAxios';
import { useNavigate } from 'react-router-dom';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const IMG = {
  oppo:     '/uploads/oppo-a17.jpeg',
  poco:     '/uploads/poco-phone.jpeg',
  samsung:  '/uploads/samsung-m21.jpeg',
  trimmer:  '/uploads/panasonic-trimmer.jpeg',
  laptop:   '/uploads/hp-laptop.jpeg',
  belt:     '/uploads/belt.jpeg',
  fastrack: '/uploads/fastrack-watch.jpeg',
  headphone:'/uploads/headphone.jpeg',
  qq:       '/uploads/qq-watch.jpeg',
  bottle:   '/uploads/water-bottle.jpeg',
};

const MOCK = {
  recommended: [
    { id: 'r1',  title: 'Oppo A17 Smartphone',          price: 9999,  originalPrice: 15999, image: IMG.oppo,     rating: 4.2, reviews: 1234, condition: 'Refurbished', grade: 'A', lifeScore: 88, aiVerified: true,  badge: '🏆 Top Pick',   category: 'Electronics' },
    { id: 'r2',  title: 'POCO M4 Pro 5G',               price: 12999, originalPrice: 18999, image: IMG.poco,     rating: 4.4, reviews: 987,  condition: 'Returned',    grade: 'A', lifeScore: 91, aiVerified: true,  badge: '🔥 Popular',    category: 'Electronics' },
    { id: 'r3',  title: 'Samsung Galaxy M21',           price: 10499, originalPrice: 16999, image: IMG.samsung,  rating: 4.3, reviews: 2105, condition: 'Refurbished', grade: 'B', lifeScore: 82, aiVerified: true,  badge: '💚 Eco Choice',  category: 'Electronics' },
    { id: 'r4',  title: 'HP 15s Laptop Intel i5',       price: 42999, originalPrice: 65000, image: IMG.laptop,   rating: 4.5, reviews: 892,  condition: 'Returned',    grade: 'A', lifeScore: 87, aiVerified: true,  badge: '💻 Pro Pick',   category: 'Electronics' },
    { id: 'r5',  title: 'Over-Ear Headphone',           price: 1799,  originalPrice: 3990,  image: IMG.headphone,rating: 4.2, reviews: 1034, condition: 'Refurbished', grade: 'B', lifeScore: 76, aiVerified: false, badge: '🎧 Audio Pick',  category: 'Electronics' },
    { id: 'r6',  title: 'Fastrack Analog Watch',        price: 1499,  originalPrice: 2995,  image: IMG.fastrack, rating: 4.3, reviews: 567,  condition: 'Returned',    grade: 'A', lifeScore: 85, aiVerified: true,  badge: '⌚ Best Value',  category: 'Jewellery' },
    { id: 'r7',  title: 'Q&Q Analog Wrist Watch',       price: 649,   originalPrice: 1299,  image: IMG.qq,       rating: 4.1, reviews: 445,  condition: 'Refurbished', grade: 'A', lifeScore: 83, aiVerified: false, badge: '🕶️ Budget',     category: 'Jewellery' },
    { id: 'r8',  title: 'Panasonic Trimmer ER-GB40',    price: 1199,  originalPrice: 2495,  image: IMG.trimmer,  rating: 4.1, reviews: 678,  condition: 'Returned',    grade: 'B', lifeScore: 78, aiVerified: false, badge: '✂️ Grooming',    category: 'Personal Care' },
    { id: 'r9',  title: 'Genuine Leather Belt',         price: 599,   originalPrice: 1499,  image: IMG.belt,     rating: 4.0, reviews: 312,  condition: 'Refurbished', grade: 'B', lifeScore: 72, aiVerified: false, badge: '👟 Style Pick',  category: 'Fashion' },
    { id: 'r10', title: 'Stainless Steel Water Bottle', price: 449,   originalPrice: 999,   image: IMG.bottle,   rating: 4.4, reviews: 789,  condition: 'Returned',    grade: 'A', lifeScore: 90, aiVerified: false, badge: '💧 Eco Pick',    category: 'Sports' },
  ],
  returned: [
    { id: 't1', title: 'POCO M4 Pro 5G',               price: 16499, originalPrice: 18999, image: IMG.poco,     rating: 4.4, reviews: 321,  condition: 'Returned', grade: 'A', lifeScore: 99, aiVerified: true,  category: 'Electronics' },
    { id: 't2', title: 'HP 15s Laptop Intel i5',       price: 57999, originalPrice: 65000, image: IMG.laptop,   rating: 4.5, reviews: 189,  condition: 'Returned', grade: 'A', lifeScore: 98, aiVerified: true,  category: 'Electronics' },
    { id: 't3', title: 'Fastrack Analog Watch',        price: 2499,  originalPrice: 2995,  image: IMG.fastrack, rating: 4.3, reviews: 167,  condition: 'Returned', grade: 'A', lifeScore: 97, aiVerified: false, category: 'Jewellery' },
    { id: 't4', title: 'Panasonic Trimmer ER-GB40',    price: 2099,  originalPrice: 2495,  image: IMG.trimmer,  rating: 4.1, reviews: 234,  condition: 'Returned', grade: 'A', lifeScore: 99, aiVerified: false, category: 'Personal Care' },
    { id: 't5', title: 'Stainless Steel Water Bottle', price: 849,   originalPrice: 999,   image: IMG.bottle,   rating: 4.4, reviews: 321,  condition: 'Returned', grade: 'A', lifeScore: 99, aiVerified: false, category: 'Sports' },
    { id: 't6', title: 'Oppo A17 Smartphone',          price: 13499, originalPrice: 15999, image: IMG.oppo,     rating: 4.2, reviews: 543,  condition: 'Returned', grade: 'A', lifeScore: 97, aiVerified: true,  category: 'Electronics' },
    { id: 't7', title: 'Samsung Galaxy M21',           price: 14299, originalPrice: 16999, image: IMG.samsung,  rating: 4.3, reviews: 876,  condition: 'Returned', grade: 'A', lifeScore: 95, aiVerified: true,  category: 'Electronics' },
    { id: 't8', title: 'Over-Ear Headphone',           price: 3299,  originalPrice: 3990,  image: IMG.headphone,rating: 4.2, reviews: 412,  condition: 'Returned', grade: 'A', lifeScore: 96, aiVerified: true,  category: 'Electronics' },
    { id: 't9', title: 'Q&Q Analog Wrist Watch',       price: 1049,  originalPrice: 1299,  image: IMG.qq,       rating: 4.1, reviews: 88,   condition: 'Returned', grade: 'A', lifeScore: 99, aiVerified: false, category: 'Jewellery' },
    { id: 't10',title: 'Genuine Leather Belt',         price: 1199,  originalPrice: 1499,  image: IMG.belt,     rating: 4.0, reviews: 98,   condition: 'Returned', grade: 'A', lifeScore: 99, aiVerified: false, category: 'Fashion' },
  ],
  refurbished: [
    { id: 'f1', title: 'Oppo A17 Smartphone',          price: 9999,  originalPrice: 15999, image: IMG.oppo,     rating: 4.2, reviews: 1234, condition: 'Refurbished', grade: 'A', lifeScore: 88, aiVerified: true,  category: 'Electronics' },
    { id: 'f2', title: 'Samsung Galaxy M21',           price: 10499, originalPrice: 16999, image: IMG.samsung,  rating: 4.3, reviews: 2105, condition: 'Refurbished', grade: 'B', lifeScore: 82, aiVerified: true,  category: 'Electronics' },
    { id: 'f3', title: 'Over-Ear Headphone',           price: 1799,  originalPrice: 3990,  image: IMG.headphone,rating: 4.2, reviews: 1034, condition: 'Refurbished', grade: 'B', lifeScore: 76, aiVerified: false, category: 'Electronics' },
    { id: 'f4', title: 'Q&Q Analog Wrist Watch',       price: 649,   originalPrice: 1299,  image: IMG.qq,       rating: 4.1, reviews: 445,  condition: 'Refurbished', grade: 'A', lifeScore: 83, aiVerified: false, category: 'Jewellery' },
    { id: 'f5', title: 'Genuine Leather Belt',         price: 599,   originalPrice: 1499,  image: IMG.belt,     rating: 4.0, reviews: 312,  condition: 'Refurbished', grade: 'B', lifeScore: 72, aiVerified: false, category: 'Fashion' },
  ],
};

const SECTIONS = [
  { key: 'recommended', label: 'Recommended',        icon: <VerifiedUser sx={{ fontSize: 16 }} />,  color: '#FF9900' },
  { key: 'returned',    label: 'Returned Products',  icon: <Autorenew sx={{ fontSize: 16 }} />,     color: '#0066c0' },
  { key: 'refurbished', label: 'Refurbished',        icon: <BuildCircle sx={{ fontSize: 16 }} />,   color: '#067D62' },
  { key: 'listed',      label: 'Resold Items',       icon: <StorefrontRounded sx={{ fontSize: 16 }} />, color: '#2e7d32' },
];

const STATS = [
  { icon: <LocalOfferRounded sx={{ fontSize: 20 }} />, value: '12,400+', label: 'Products Listed',    color: '#FF9900' },
  { icon: <ShieldRounded     sx={{ fontSize: 20 }} />, value: '98%',     label: 'AI Verified',        color: '#4caf50' },
  { icon: <StarRounded       sx={{ fontSize: 20 }} />, value: '4.6★',    label: 'Avg. Seller Rating', color: '#FF9900' },
  { icon: <EmojiNature sx={{ fontSize: 20 }} />, value: '30-Day',  label: 'Return Guarantee',   color: '#4caf50' },
];

// ─── Trust pills ──────────────────────────────────────────────────────────────

const TrustPill = ({ icon, text }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 0.6,
    bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px', px: 1.4, py: 0.6,
  }}>
    <Box sx={{ color: '#4caf50', display: 'flex' }}>{icon}</Box>
    <Typography sx={{ color: '#e0e0e0', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{text}</Typography>
  </Box>
);

// ─── Section ──────────────────────────────────────────────────────────────────

const Section = ({ sectionKey, label, icon, color, loading, items }) => {
  const sectionItems = items ?? MOCK[sectionKey];
  const displayedItems = (sectionItems ?? []).slice(
    0,
    ['returned', 'refurbished'].includes(sectionKey) ? 5 : sectionItems?.length ?? 0
  );

  return (
    <Box sx={{ mb: 6 }}>
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '8px',
          bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, flexShrink: 0,
        }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F1111', letterSpacing: '-0.2px' }}>
          {label}
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: '#ebebeb', ml: 0.5 }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color, bgcolor: `${color}15`, px: 1, py: 0.3, borderRadius: '10px', flexShrink: 0 }}>
          {displayedItems.length} items
        </Typography>
      </Box>

      {/* Grid */}
      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <ReMatchProductCardSkeleton />
              </Grid>
            ))
          : !displayedItems.length
            ? (
              <Grid item xs={12}>
                <EmptySection label={label} color={color} />
              </Grid>
            )
            : displayedItems.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ReMatchProductCard product={product} />
              </Grid>
            ))
        }
      </Grid>
    </Box>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptySection = ({ label, color }) => (
  <Box sx={{
    textAlign: 'center', py: 6, px: 3,
    border: '2px dashed #e8e8e8', borderRadius: '16px',
    bgcolor: '#fafafa',
  }}>
    <Autorenew sx={{ fontSize: 40, color: '#ddd', mb: 1 }} />
    <Typography sx={{ fontWeight: 700, color: '#555', mb: 0.5 }}>No {label} yet</Typography>
    <Typography sx={{ fontSize: '0.82rem', color: '#aaa' }}>
      Check back soon — new items are listed daily.
    </Typography>
  </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ReMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [recommendedItems, setRecommendedItems] = useState(MOCK.recommended);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [listedLoading, setListedLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setRecommendedItems(MOCK.recommended);
      setRecommendedLoading(false);
      return;
    }

    setRecommendedLoading(true);
    getRecommendations(user.id)
      .then((response) => {
        const data = response.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setRecommendedItems(data.map((rec) => ({
            ...rec.product,
            matchScore: rec.matchScore,
            matchReasons: rec.matchReasons,
            reason: rec.reason ?? rec.matchReasons?.[0] ?? null,
            distanceKm: rec.distanceKm,
            resolvedAtKm: rec.resolvedAtKm,
            id: rec.product?.id ?? rec.id,
          })));
        } else {
          setRecommendedItems(MOCK.recommended);
        }
      })
      .catch(() => {
        setRecommendedItems(MOCK.recommended);
      })
      .finally(() => setRecommendedLoading(false));
  }, [user?.id]);

  // Fetch public "listed" (resold) items so others can see resold products
  useEffect(() => {
    setListedLoading(true);
    backendApi.get('/rematch/listings?status=LISTED')
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data)) {
          setListedItems(data.map((l) => ({
            id: String(l.id),
            title: l.productName || l.name || l.product?.title || 'Untitled',
            price: Number(l.expectedPrice || l.askingPrice || l.price || 0),
            originalPrice: Number(l.originalPrice || l.mrp || 0),
            image: (l.imageUrls && l.imageUrls[0]) || l.image || '',
            rating: l.rating || 4.0,
            reviews: l.reviewCount || 0,
            condition: l.condition || 'Used',
            grade: l.conditionGrade || 'B',
            lifeScore: l.lifeScore || 80,
            aiVerified: Boolean(l.aiVerified),
            category: l.category || 'General',
          })));
        } else {
          setListedItems([]);
        }
      })
      .catch(() => setListedItems([]))
      .finally(() => setListedLoading(false));
  }, []);

  const getTabBadgeCount = (key) => {
    if (!key) return null;
    if (key === 'recommended') return recommendedLoading ? 0 : recommendedItems.length;
    if (key === 'listed') return listedLoading ? 0 : listedItems.length;
    const items = MOCK[key];
    return items ? (['returned', 'refurbished'].includes(key) ? Math.min(items.length, 5) : items.length) : 0;
  };

  const visibleSections = activeTab === 0 ? SECTIONS : [SECTIONS[activeTab - 1]];

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>

      {/* ══ Hero Banner ══════════════════════════════════════════════════════ */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2f45 40%, #0d2137 70%, #071424 100%)',
        px: { xs: 3, sm: 4, md: 8 }, py: { xs: 5, md: 6 },
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative rings */}
        {[280, 180, 100].map((size, i) => (
          <Box key={i} sx={{
            position: 'absolute', right: -size / 3, top: -size / 3,
            width: size, height: size, borderRadius: '50%',
            border: `1.5px solid rgba(255,153,0,${0.06 + i * 0.04})`,
            pointerEvents: 'none',
          }} />
        ))}
        {/* Subtle glow */}
        <Box sx={{
          position: 'absolute', right: 80, top: 40,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,153,0,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo + title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box sx={{ position: 'relative', width: 50, height: 50, flexShrink: 0 }}>
            <Autorenew sx={{ fontSize: 50, color: '#FF9900' }} />
            <Box sx={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 16, height: 16, bgcolor: '#FF9900', borderRadius: '4px',
            }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{
                fontWeight: 900, lineHeight: 1,
                fontSize: { xs: '1.9rem', md: '2.6rem' },
                color: '#FF9900', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px',
              }}>
                Amazon ReMatch
              </Typography>
            </Box>
            <Typography sx={{
              color: '#8ba7be', fontSize: { xs: '0.85rem', md: '0.95rem' },
              mt: 0.4, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 300,
            }}>
              Give Products a Second Life
            </Typography>
          </Box>
        </Box>

        <Typography sx={{
          color: '#7fa3bf', mt: 1, maxWidth: 520,
          fontSize: { xs: '0.88rem', md: '0.95rem' }, lineHeight: 1.7,
        }}>
          Browse certified returned &amp; refurbished products at unbeatable prices.
          Every item is quality-checked and backed by Amazon's guarantee.
        </Typography>

        {/* CTA Buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SearchRounded />}
            onClick={() => document.getElementById('rematch-content')?.scrollIntoView({ behavior: 'smooth' })}
            sx={{
              bgcolor: '#FF9900', color: '#131921',
              fontWeight: 800, fontSize: '0.9rem',
              px: 3, py: 1.2, borderRadius: '8px',
              textTransform: 'none', boxShadow: '0 4px 15px rgba(255,153,0,0.35)',
              '&:hover': { bgcolor: '#e68a00', boxShadow: '0 6px 20px rgba(255,153,0,0.5)' },
            }}
          >
            Browse Products
          </Button>
          <Button
            variant="outlined"
            startIcon={<StorefrontRounded />}
            onClick={() => navigate('/rematch/sell')}
            sx={{
              borderColor: 'rgba(255,153,0,0.6)', color: '#FF9900',
              fontWeight: 800, fontSize: '0.9rem',
              px: 3, py: 1.2, borderRadius: '8px',
              textTransform: 'none', backdropFilter: 'blur(4px)',
              bgcolor: 'rgba(255,153,0,0.06)',
              '&:hover': {
                bgcolor: 'rgba(255,153,0,0.14)',
                borderColor: '#FF9900',
                boxShadow: '0 4px 15px rgba(255,153,0,0.2)',
              },
            }}
          >
            Sell My Product
          </Button>
        </Box>

        {/* Trust pills */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.5 }}>
          <TrustPill icon={<ShieldRounded sx={{ fontSize: 14 }} />} text="Buyer Protection" />
          <TrustPill icon={<EmojiNature sx={{ fontSize: 14 }} />} text="Eco-Friendly" />
          <TrustPill icon={<LocalOfferRounded sx={{ fontSize: 14 }} />} text="Up to 70% Off" />
          <TrustPill icon={<VerifiedUser  sx={{ fontSize: 14 }} />} text="AI Inspected" />
        </Box>

        {/* Stats row */}
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 4 }, mt: 3.5,
          pt: 3, borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          {STATS.map(({ icon, value, label, color }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color, opacity: 0.9 }}>{icon}</Box>
              <Box>
                <Typography sx={{ color, fontWeight: 900, fontSize: '1.1rem', lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ color: '#6a8fa5', fontSize: '0.7rem', mt: 0.1 }}>{label}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ Tab Bar ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #ebebeb', px: { xs: 1, md: 2 }, position: 'sticky', top: 60, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: '#FF9900', height: 3, borderRadius: '3px 3px 0 0' } }}
          variant="scrollable" scrollButtons="auto"
        >
          {[{ label: 'All Products', key: null }, ...SECTIONS].map(({ label, key }, i) => (
            <Tab
              key={i}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                  {i > 0 && (
                    <Box sx={{ color: activeTab === i ? SECTIONS[i - 1].color : '#aaa', display: 'flex' }}>
                      {SECTIONS[i - 1].icon}
                    </Box>
                  )}
                  <span>{label}</span>
                  {i > 0 && key && (
                    <Badge
                      badgeContent={getTabBadgeCount(key)}
                      sx={{ '& .MuiBadge-badge': { bgcolor: activeTab === i ? SECTIONS[i-1].color : '#ccc', color: '#fff', fontWeight: 700, fontSize: '0.58rem', minWidth: 16, height: 16 }, ml: 0.8 }}
                    />
                  )}
                </Box>
              }
              sx={{
                color: '#666', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                minHeight: 48, px: { xs: 1.5, sm: 2.5 },
                '&.Mui-selected': { color: '#131921', fontWeight: 700 },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* ══ Content ═══════════════════════════════════════════════════════════ */}
      <Box id="rematch-content" sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>
        {visibleSections.map((s) => (
          <Section
            key={s.key}
            {...s}
            loading={s.key === 'recommended' ? recommendedLoading : (s.key === 'listed' ? listedLoading : false)}
            items={s.key === 'recommended' ? recommendedItems : (s.key === 'listed' ? listedItems : undefined)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ReMatch;
