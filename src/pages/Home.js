import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, CardMedia, CardActions, Button, Rating, Chip, CardActionArea } from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { useCart } from '../context/CartContext';

const CATEGORY_ICONS = {
  'Electronics': '📱', 'Jewellery': '💍', "Men's Clothing": '👔',
  "Women's Clothing": '👗', 'Home & Kitchen': '🏠', 'Sports': '⚽', 'Beauty': '💄',
};

const CATEGORIES = ['Electronics', "Men's Clothing", "Women's Clothing", 'Jewellery', 'Home & Kitchen', 'Sports', 'Beauty'];

const ALL_PRODUCTS = [
  { id: 's1',  title: 'Samsung Galaxy S24 5G 256GB',       category: 'Electronics',      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',   price: 79999,  rating: 4.6, reviewCount: 3421  },
  { id: 's2',  title: 'Apple iPhone 15 128GB',             category: 'Electronics',      imageUrl: 'https://images.unsplash.com/photo-1512499617640-c2f99912b0c0?auto=format&fit=crop&w=800&q=80',   price: 79900,  rating: 4.7, reviewCount: 5210  },
  { id: 's3',  title: 'Sony Bravia 55" 4K OLED TV',        category: 'Electronics',      imageUrl: 'https://images.unsplash.com/photo-1512447838451-1d1c7f0f8d50?auto=format&fit=crop&w=800&q=80',   price: 129990, rating: 4.5, reviewCount: 987   },
  { id: 's4',  title: 'Dell Inspiron 15 Laptop i5 16GB',   category: 'Electronics',      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',   price: 62990,  rating: 4.4, reviewCount: 1543  },
  { id: 's5',  title: 'boAt Airdopes 141 TWS Earbuds',     category: 'Electronics',      imageUrl: 'https://images.unsplash.com/photo-1512316232505-d13ff7d538b2?auto=format&fit=crop&w=800&q=80',   price: 1299,   rating: 4.1, reviewCount: 89432 },
  { id: 's6',  title: "Levi's Men's 511 Slim Jeans",       category: "Men's Clothing",   imageUrl: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=800&q=80',   price: 2999,   rating: 4.3, reviewCount: 6721  },
  { id: 's7',  title: "Allen Solly Men's Formal Shirt",    category: "Men's Clothing",   imageUrl: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80',   price: 1299,   rating: 4.2, reviewCount: 3102  },
  { id: 's8',  title: "Zara Women's Floral Wrap Dress",    category: "Women's Clothing", imageUrl: 'https://images.unsplash.com/photo-1520962914068-066b5ff96258?auto=format&fit=crop&w=800&q=80',   price: 3490,   rating: 4.4, reviewCount: 1892  },
  { id: 's9',  title: "W Women's Straight Kurta Set",      category: "Women's Clothing", imageUrl: 'https://images.unsplash.com/photo-1520975698515-68c0efb9f1b1?auto=format&fit=crop&w=800&q=80',   price: 1799,   rating: 4.5, reviewCount: 4312  },
  { id: 's10', title: "Titan Analog Men's Watch",          category: 'Jewellery',        imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de4cb8a?auto=format&fit=crop&w=800&q=80',   price: 3995,   rating: 4.6, reviewCount: 2341  },
  { id: 's11', title: 'Fastrack Casual Analog Watch',      category: 'Jewellery',        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',   price: 1995,   rating: 4.3, reviewCount: 5678  },
  { id: 's12', title: 'Prestige 750W Mixer Grinder',       category: 'Home & Kitchen',   imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',   price: 2695,   rating: 4.4, reviewCount: 12043 },
  { id: 's13', title: 'Philips 1.5L Electric Kettle',      category: 'Home & Kitchen',   imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',   price: 1299,   rating: 4.3, reviewCount: 8921  },
  { id: 's14', title: 'Nike Revolution 6 Running Shoes',   category: 'Sports',           imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',   price: 3995,   rating: 4.2, reviewCount: 4321  },
  { id: 's15', title: 'Wildcraft 45L Rucksack Backpack',   category: 'Sports',           imageUrl: 'https://images.unsplash.com/photo-1510097467427-4c71377c7f44?auto=format&fit=crop&w=800&q=80',   price: 2495,   rating: 4.3, reviewCount: 3210  },
  { id: 's16', title: 'Himalaya Neem Face Wash 200ml',     category: 'Beauty',           imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',   price: 199,    rating: 4.5, reviewCount: 45231 },
  { id: 's17', title: 'Mamaearth Vitamin C Face Serum',    category: 'Beauty',           imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',   price: 599,    rating: 4.4, reviewCount: 18432 },
  { id: 's18', title: 'Milton Thermosteel Flask 1L',       category: 'Sports',           imageUrl: 'https://images.unsplash.com/photo-1495121605193-b116b5b09a19?auto=format&fit=crop&w=800&q=80',   price: 699,    rating: 4.6, reviewCount: 23412 },
  { id: 's19', title: 'Canon EOS R50 Mirrorless Camera',   category: 'Electronics',      imageUrl: 'https://images.unsplash.com/photo-1519183071298-a2962f0f5c42?auto=format&fit=crop&w=800&q=80',   price: 74995,  rating: 4.8, reviewCount: 445   },
  { id: 's20', title: 'Noise ColorFit Pro 5 Smartwatch',   category: 'Electronics',      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9f8a6fb9?auto=format&fit=crop&w=800&q=80',   price: 4499,   rating: 4.3, reviewCount: 15621 },
];

const HERO_SLIDES = [
  { bg: 'linear-gradient(135deg, #131921 0%, #232F3E 100%)', title: 'Mega Sale is Live!',    subtitle: 'Up to 70% off on top brands',    cta: 'Shop Now', color: '#FF9900' },
  { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', title: 'New Electronics',       subtitle: 'Discover the latest gadgets',     cta: 'Explore',  color: '#00d4ff' },
  { bg: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)', title: 'Fashion Week',          subtitle: 'Trending styles for everyone',    cta: 'Browse',   color: '#fff'    },
];

const Home = () => {
  const { addToCart } = useCart();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setInterval(() => setActiveSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const slide = HERO_SLIDES[activeSlide];

  return (
    <Box>
      {/* Hero Banner */}
      <Box sx={{
        background: slide.bg, minHeight: 280, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', textAlign: 'center',
        p: 4, position: 'relative', overflow: 'hidden', transition: 'background 0.8s ease',
      }}>
        <Typography variant="h3" sx={{ color: slide.color, fontWeight: 900, mb: 1 }}>{slide.title}</Typography>
        <Typography variant="h6" sx={{ color: '#ccc', mb: 3 }}>{slide.subtitle}</Typography>
        <Box sx={{ bgcolor: '#FF9900', color: '#131921', fontWeight: 700, px: 4, py: 1.5, borderRadius: '25px', cursor: 'pointer', '&:hover': { bgcolor: '#e68a00' } }}>
          {slide.cta}
        </Box>
        <Box sx={{ position: 'absolute', bottom: 16, display: 'flex', gap: 1 }}>
          {HERO_SLIDES.map((_, i) => (
            <Box key={i} onClick={() => setActiveSlide(i)}
              sx={{ width: i === activeSlide ? 24 : 8, height: 8, borderRadius: '4px', bgcolor: i === activeSlide ? '#FF9900' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: 2, py: 3 }}>

        {/* Search */}
        <Box component="input"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{
            width: '100%', mb: 3, px: 2, py: 1.2, fontSize: '0.95rem',
            border: '1.5px solid #e0e0e0', borderRadius: '25px', outline: 'none',
            '&:focus': { borderColor: '#FF9900' },
          }}
        />

        {/* Categories */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Shop by Category</Typography>
          <Grid container spacing={2}>
            {['All', ...CATEGORIES].map(cat => (
              <Grid item xs={4} sm={3} md={2} key={cat}>
                <Card
                  onClick={() => setActiveCategory(cat)}
                  sx={{ cursor: 'pointer', borderRadius: 2, border: activeCategory === cat ? '2px solid #FF9900' : '1px solid #e0e0e0', '&:hover': { boxShadow: 4 } }}
                >
                  <CardActionArea>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography sx={{ fontSize: '1.8rem' }}>{CATEGORY_ICONS[cat] || '🛍️'}</Typography>
                      <Typography sx={{ fontWeight: 600, mt: 0.5, fontSize: '0.75rem' }}>{cat}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Products */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {activeCategory === 'All' ? 'Featured Products' : activeCategory}
          <Chip label={`${filtered.length} items`} size="small" sx={{ ml: 1.5, bgcolor: '#fff8e1', color: '#e65100', fontWeight: 700 }} />
        </Typography>

        <Grid container spacing={2}>
          {filtered.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
                <Box sx={{ p: 2, bgcolor: '#f8f8f8', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardMedia component="img" image={product.imageUrl || product.image || 'https://via.placeholder.com/200x200?text=No+Image'} alt={product.title}
                    sx={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                    onError={e => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }}
                  />
                </Box>
                <CardContent sx={{ flex: 1, pb: 0 }}>
                  <Chip label={product.category} size="small" sx={{ fontSize: '0.6rem', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Rating value={product.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">({product.reviewCount.toLocaleString('en-IN')})</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#B12704' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 1 }}>
                  <Button fullWidth variant="contained" size="small" startIcon={<AddShoppingCart />}
                    onClick={() => addToCart({ ...product, price: product.price })}
                    sx={{ bgcolor: '#FF9900', color: '#131921', fontWeight: 700, textTransform: 'none', borderRadius: '20px', '&:hover': { bgcolor: '#e68a00' } }}>
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
