import React, { useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Slider,
  CircularProgress, Alert, Chip, LinearProgress, Divider,
} from '@mui/material';
import {
  TrendingUpRounded, AutoGraphRounded, PriceCheckRounded,
  InfoOutlined,
} from '@mui/icons-material';
import { predictPrice } from '../api/products';

const CATEGORIES = [
  'Electronics', 'Mobile Phones', 'Laptops', "Men's Clothing",
  "Women's Clothing", 'Jewellery', 'Home & Kitchen',
  'Sports & Outdoors', 'Books', 'Toys & Games',
];

const GRADES = [
  { value: 'A', label: 'A — Like New' },
  { value: 'B', label: 'B — Good' },
  { value: 'C', label: 'C — Fair' },
  { value: 'D', label: 'D — Poor' },
];

const GRADE_COLOR = { A: '#2e7d32', B: '#1565c0', C: '#e65100', D: '#b71c1c' };

const Field = (props) => (
  <TextField
    fullWidth size="small" variant="outlined"
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px', bgcolor: '#fff',
        '&:hover fieldset': { borderColor: '#FF9900' },
        '&.Mui-focused fieldset': { borderColor: '#FF9900', borderWidth: 2 },
      },
      '& label.Mui-focused': { color: '#FF9900' },
    }}
    {...props}
  />
);

const INIT = {
  originalPrice: '', productAgeYears: '', conditionGrade: 'A',
  category: '', demandScore: 50,
};

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const pct = (n) => `${Math.round(n * 100)}%`;

const PricePredictor = () => {
  const [form, setForm]       = useState(INIT);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [errors, setErrors]   = useState({});

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
    setResult(null);
  };

  const validate = () => {
    const e = {};
    if (!form.originalPrice || isNaN(form.originalPrice) || +form.originalPrice <= 0)
      e.originalPrice = 'Enter a valid original price';
    if (form.productAgeYears === '' || isNaN(form.productAgeYears) || +form.productAgeYears < 0)
      e.productAgeYears = 'Enter product age in years (0 or more)';
    if (!form.category) e.category = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePredict = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await predictPrice({
        originalPrice:    parseFloat(form.originalPrice),
        productAgeYears:  parseFloat(form.productAgeYears),
        conditionGrade:   form.conditionGrade,
        category:         form.category,
        demandScore:      form.demandScore,
      });
      setResult(res.data?.data ?? res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Price prediction failed. Is the service running?');
    } finally {
      setLoading(false);
    }
  };

  const confidencePct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>

      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2f45 40%, #071424 100%)',
        px: { xs: 3, md: 8 }, py: { xs: 4, md: 5 }, position: 'relative', overflow: 'hidden',
      }}>
        {[260, 160, 80].map((size, i) => (
          <Box key={i} sx={{
            position: 'absolute', right: -size / 3, top: -size / 3,
            width: size, height: size, borderRadius: '50%',
            border: `1.5px solid rgba(255,153,0,${0.06 + i * 0.04})`,
            pointerEvents: 'none',
          }} />
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoGraphRounded sx={{ fontSize: 44, color: '#FF9900' }} />
          <Box>
            <Typography sx={{
              fontWeight: 900, color: '#FF9900', fontFamily: 'Georgia, serif',
              fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1,
            }}>
              ReMatch Price Predictor
            </Typography>
            <Typography sx={{ color: '#8ba7be', fontSize: '0.85rem', mt: 0.4, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 300 }}>
              AI-powered resale price recommendation
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ color: '#7fa3bf', mt: 1.5, maxWidth: 520, fontSize: '0.9rem', lineHeight: 1.7 }}>
          Enter your product details to get an optimal resale price based on condition,
          age, category depreciation curves and live demand signals.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 820, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Input Card */}
        <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e8e8', p: { xs: 3, sm: 4 }, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <PriceCheckRounded sx={{ color: '#FF9900' }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F1111' }}>Product Details</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 160 }}>
                <Field
                  label="Original Price (₹) *"
                  value={form.originalPrice}
                  onChange={set('originalPrice')}
                  error={!!errors.originalPrice}
                  helperText={errors.originalPrice}
                  placeholder="e.g. 25000"
                  type="number"
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 160 }}>
                <Field
                  label="Product Age (years) *"
                  value={form.productAgeYears}
                  onChange={set('productAgeYears')}
                  error={!!errors.productAgeYears}
                  helperText={errors.productAgeYears}
                  placeholder="e.g. 1"
                  type="number"
                  inputProps={{ step: 0.5, min: 0 }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 160 }}>
                <Field
                  select label="Condition Grade *"
                  value={form.conditionGrade}
                  onChange={set('conditionGrade')}
                >
                  {GRADES.map((g) => (
                    <MenuItem key={g.value} value={g.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: GRADE_COLOR[g.value] }} />
                        {g.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Field>
              </Box>
              <Box sx={{ flex: 1, minWidth: 160 }}>
                <Field
                  select label="Category *"
                  value={form.category}
                  onChange={set('category')}
                  error={!!errors.category}
                  helperText={errors.category}
                >
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Field>
              </Box>
            </Box>

            {/* Demand Score Slider */}
            <Box sx={{ px: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>
                  Market Demand Score
                </Typography>
                <Chip
                  label={`${form.demandScore} / 100`}
                  size="small"
                  sx={{
                    bgcolor: form.demandScore >= 70 ? '#e8f5e9' : form.demandScore >= 40 ? '#fff8e1' : '#fce4ec',
                    color: form.demandScore >= 70 ? '#2e7d32' : form.demandScore >= 40 ? '#e65100' : '#c62828',
                    fontWeight: 700, fontSize: '0.72rem',
                  }}
                />
              </Box>
              <Slider
                value={form.demandScore}
                onChange={(_, v) => { setForm((f) => ({ ...f, demandScore: v })); setResult(null); }}
                min={0} max={100} step={1}
                sx={{ color: '#FF9900', '& .MuiSlider-thumb': { width: 18, height: 18 } }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#aaa' }}>Low demand</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#aaa' }}>High demand</Typography>
              </Box>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>{error}</Alert>}

          <Button
            fullWidth
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <TrendingUpRounded />}
            onClick={handlePredict}
            disabled={loading}
            sx={{
              mt: 3, bgcolor: '#FF9900', color: '#131921', fontWeight: 800,
              textTransform: 'none', borderRadius: '8px', py: 1.3, fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(255,153,0,0.3)',
              '&:hover': { bgcolor: '#e68a00' },
              '&.Mui-disabled': { bgcolor: '#ffcc80' },
            }}
          >
            {loading ? 'Predicting…' : 'Get Recommended Price'}
          </Button>
        </Box>

        {/* Result Card */}
        {result && (
          <Box sx={{
            bgcolor: '#fff', borderRadius: '16px', border: '2px solid #FF9900',
            p: { xs: 3, sm: 4 }, boxShadow: '0 8px 32px rgba(255,153,0,0.12)',
            animation: 'fadeIn 0.4s ease',
            '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
          }}>

            {/* Recommended Price — hero number */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Recommended ReMatch Price
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.4rem', md: '3rem' }, color: '#0F1111', lineHeight: 1.1, mt: 0.5 }}>
                {fmt(result.recommendedPrice)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip label={`${Math.round(result.depreciationRate * 100)}% off original`} size="small"
                  sx={{ bgcolor: '#fff8e1', color: '#e65100', fontWeight: 700 }} />
                <Chip label={`Grade ${form.conditionGrade}`} size="small"
                  sx={{ bgcolor: GRADE_COLOR[form.conditionGrade], color: '#fff', fontWeight: 700 }} />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Price range */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#555', mb: 1.5 }}>PRICE RANGE</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#888' }}>Floor (min acceptable)</Typography>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F1111' }}>{fmt(result.priceFloor)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#888' }}>Ceiling (max reasonable)</Typography>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F1111' }}>{fmt(result.priceCeiling)}</Typography>
              </Box>
              {/* Visual range bar */}
              <Box sx={{ position: 'relative', height: 8, bgcolor: '#f0f0f0', borderRadius: 4, mt: 1 }}>
                {(() => {
                  const range   = result.priceCeiling - result.priceFloor;
                  const leftPct = range > 0 ? ((result.recommendedPrice - result.priceFloor) / range) * 100 : 50;
                  return (
                    <>
                      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(leftPct, 100)}%`, bgcolor: '#FF9900', borderRadius: 4 }} />
                      <Box sx={{
                        position: 'absolute', top: '50%', left: `${Math.min(leftPct, 100)}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 14, height: 14, bgcolor: '#FF9900', border: '2px solid #fff',
                        borderRadius: '50%', boxShadow: '0 0 0 2px #FF9900',
                      }} />
                    </>
                  );
                })()}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#bbb' }}>{fmt(result.priceFloor)}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#bbb' }}>{fmt(result.priceCeiling)}</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Factor breakdown */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#555', mb: 1.5 }}>PRICING FACTORS</Typography>
              {[
                { label: 'Condition Multiplier', value: pct(result.conditionMultiplier), bar: result.conditionMultiplier, color: GRADE_COLOR[form.conditionGrade] },
                { label: 'Age Decay Factor', value: pct(result.ageDecayFactor), bar: result.ageDecayFactor, color: '#1565c0' },
                { label: 'Demand Adjustment', value: `${result.demandAdjustment > 1 ? '+' : ''}${((result.demandAdjustment - 1) * 100).toFixed(1)}%`, bar: Math.min(result.demandAdjustment / 1.2, 1), color: result.demandAdjustment >= 1 ? '#2e7d32' : '#e65100' },
              ].map(({ label, value, bar, color }) => (
                <Box key={label} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#555' }}>{label}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color }}>{value}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={Math.max(bar * 100, 2)}
                    sx={{ height: 5, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Confidence */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <InfoOutlined sx={{ fontSize: 15, color: '#888' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#555' }}>Prediction Confidence</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: confidencePct >= 80 ? '#2e7d32' : confidencePct >= 60 ? '#e65100' : '#c62828' }}>
                  {confidencePct}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={confidencePct}
                sx={{ height: 7, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: confidencePct >= 80 ? '#4caf50' : confidencePct >= 60 ? '#FF9900' : '#f44336', borderRadius: 3 } }} />
            </Box>

            {/* Summary */}
            {result.summary && (
              <Box sx={{ bgcolor: '#f8f9fa', borderRadius: '10px', p: 2, border: '1px solid #ebebeb' }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.7 }}>{result.summary}</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PricePredictor;
