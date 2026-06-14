import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Button, Divider } from '@mui/material';
import {
  AutoAwesomeRounded, VerifiedRounded, CurrencyRupeeRounded,
  FavoriteRounded, ShieldRounded, StorefrontRounded,
  ArrowBackRounded, BoltRounded,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── Grade config ─────────────────────────────────────────────────────────────

const GRADE_CONFIG = {
  A: { color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', label: 'Excellent',   description: 'Like-new condition with minimal to no signs of use.' },
  B: { color: '#1565c0', bg: '#e3f2fd', border: '#90caf9', label: 'Good',        description: 'Minor cosmetic wear. Fully functional.' },
  C: { color: '#e65100', bg: '#fff3e0', border: '#ffcc80', label: 'Fair',        description: 'Visible wear. Works as expected with some limitations.' },
  D: { color: '#b71c1c', bg: '#ffebee', border: '#ef9a9a', label: 'Poor',        description: 'Heavy wear or defects. Priced accordingly.' },
};

// ─── Animated counter ─────────────────────────────────────────────────────────

const useCounter = (target, duration = 1200) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
};

// ─── Circular score ring ──────────────────────────────────────────────────────

const ScoreRing = ({ value, max = 100, color, size = 110, label }) => {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress((value / max) * circ), 200);
    return () => clearTimeout(t);
  }, [value, max, circ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={7} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={7}
            strokeDasharray={circ}
            strokeDashoffset={circ - progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color, lineHeight: 1 }}>{value}</Typography>
          <Typography sx={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>/ {max}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#555' }}>{label}</Typography>
    </Box>
  );
};

// ─── Metric bar ───────────────────────────────────────────────────────────────

const MetricBar = ({ label, value, max, color, unit = '' }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth((value / max) * 100), 300);
    return () => clearTimeout(t);
  }, [value, max]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color }}>{value}{unit}</Typography>
      </Box>
      <Box sx={{ height: 7, borderRadius: 4, bgcolor: '#f0f0f0', overflow: 'hidden' }}>
        <Box sx={{
          height: '100%', borderRadius: 4, bgcolor: color,
          width: `${width}%`, transition: 'width 1.2s ease',
        }} />
      </Box>
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const MOCK_RESULT = {
  grade: 'A',
  confidence: 95,
  resaleValue: 18500,
  lifeScore: 91,
  summary: [
    'Minor cosmetic wear detected on outer casing.',
    'All core functions verified and operating normally.',
    'Battery health at 92% — well above resale threshold.',
    'Suitable for resale. Expected to sell within 7–10 days.',
  ],
  product: 'Sony WH-1000XM4 Headphones',
  category: 'Electronics',
  analyzedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  breakdown: [
    { label: 'Cosmetic Condition', value: 93, color: '#2e7d32' },
    { label: 'Functional Integrity', value: 97, color: '#1565c0' },
    { label: 'Market Demand',       value: 88, color: '#FF9900' },
    { label: 'Resale Suitability',  value: 91, color: '#6a1b9a' },
  ],
};

const AIEvaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result ?? MOCK_RESULT;

  const grade  = GRADE_CONFIG[result.grade] ?? GRADE_CONFIG['A'];
  const animatedConfidence = useCounter(result.confidence);
  const animatedLife       = useCounter(result.lifeScore);
  const animatedPrice      = useCounter(result.resaleValue, 1400);

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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AutoAwesomeRounded sx={{ color: '#FF9900', fontSize: 32 }} />
          <Box>
            <Typography sx={{
              fontWeight: 900, color: '#FF9900', fontFamily: 'Georgia, serif',
              fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.5px', lineHeight: 1,
            }}>
              AI Evaluation Result
            </Typography>
            <Typography sx={{ color: '#8ba7be', fontSize: '0.82rem', mt: 0.4, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 300 }}>
              Powered by Amazon ReMatch AI
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ color: '#7fa3bf', mt: 1, fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 480 }}>
          Your product has been analysed. Review the condition grade, market value,
          and AI-generated insights below.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip icon={<BoltRounded sx={{ fontSize: 14, color: '#FF9900 !important' }} />}
            label={result.product}
            sx={{ bgcolor: 'rgba(255,255,255,0.07)', color: '#e0e0e0', fontWeight: 600, fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <Chip label={result.category}
            sx={{ bgcolor: 'rgba(255,153,0,0.12)', color: '#FF9900', fontWeight: 600, fontSize: '0.75rem', border: '1px solid rgba(255,153,0,0.25)' }}
          />
          <Chip label={`Analysed ${result.analyzedAt}`}
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#8ba7be', fontWeight: 500, fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.07)' }}
          />
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ── Grade Card ── */}
        <Box sx={{
          bgcolor: grade.bg, border: `1.5px solid ${grade.border}`,
          borderRadius: '16px', p: { xs: 3, sm: 4 },
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3,
        }}>
          {/* Grade badge */}
          <Box sx={{
            width: 88, height: 88, borderRadius: '20px',
            bgcolor: grade.color, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: `0 8px 24px ${grade.color}40`,
          }}>
            <Typography sx={{ fontWeight: 900, fontSize: '2.8rem', color: '#fff', lineHeight: 1 }}>
              {result.grade}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: grade.color }}>
                Grade {result.grade} — {grade.label}
              </Typography>
              <VerifiedRounded sx={{ color: grade.color, fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.6 }}>
              {grade.description}
            </Typography>
            <Chip
              label="AI Verified"
              size="small"
              icon={<ShieldRounded sx={{ fontSize: 13, color: `${grade.color} !important` }} />}
              sx={{ mt: 1.2, bgcolor: '#fff', color: grade.color, fontWeight: 700, fontSize: '0.7rem', border: `1px solid ${grade.border}` }}
            />
          </Box>
        </Box>

        {/* ── Metrics Row ── */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
        }}>
          {/* Confidence */}
          <Box sx={{
            bgcolor: '#fff', borderRadius: '14px', border: '1px solid #e8e8e8',
            p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            <ScoreRing value={animatedConfidence} color="#1565c0" label="Confidence" />
            <Typography sx={{ fontSize: '0.72rem', color: '#888', textAlign: 'center' }}>
              Model certainty on grade
            </Typography>
          </Box>

          {/* Life Score */}
          <Box sx={{
            bgcolor: '#fff', borderRadius: '14px', border: '1px solid #e8e8e8',
            p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            <ScoreRing value={animatedLife} color="#FF9900" label="Life Score" />
            <Typography sx={{ fontSize: '0.72rem', color: '#888', textAlign: 'center' }}>
              Remaining product life
            </Typography>
          </Box>

          {/* Resale Value */}
          <Box sx={{
            bgcolor: '#fff', borderRadius: '14px', border: '1px solid #e8e8e8',
            p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            gridColumn: { xs: '1 / -1', sm: 'auto' },
          }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '14px',
              bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CurrencyRupeeRounded sx={{ color: '#2e7d32', fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.7rem', color: '#2e7d32', lineHeight: 1 }}>
              ₹{animatedPrice.toLocaleString('en-IN')}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#555' }}>Estimated Resale Value</Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#aaa', textAlign: 'center' }}>
              Based on current market demand
            </Typography>
          </Box>
        </Box>

        {/* ── Breakdown Bars ── */}
        <Box sx={{
          bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e8e8',
          p: { xs: 2.5, sm: 3.5 }, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <FavoriteRounded sx={{ color: '#FF9900', fontSize: 18 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F1111' }}>
              Evaluation Breakdown
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {result.breakdown.map((b) => (
              <MetricBar key={b.label} label={b.label} value={b.value} max={100} color={b.color} unit="%" />
            ))}
          </Box>
        </Box>

        {/* ── AI Summary ── */}
        <Box sx={{
          bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e8e8',
          p: { xs: 2.5, sm: 3.5 }, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesomeRounded sx={{ color: '#FF9900', fontSize: 18 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F1111' }}>
              AI Summary
            </Typography>
            <Chip label="Generated by ReMatch AI" size="small"
              sx={{ ml: 'auto', bgcolor: '#fff8e1', color: '#e65100', fontWeight: 700, fontSize: '0.65rem' }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {result.summary.map((line, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%', bgcolor: '#FF9900',
                  mt: 0.7, flexShrink: 0,
                }} />
                <Typography sx={{ fontSize: '0.88rem', color: '#333', lineHeight: 1.65 }}>
                  {line}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Actions ── */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<StorefrontRounded />}
            onClick={() => navigate('/rematch/sell')}
            sx={{
              bgcolor: '#FF9900', color: '#131921', fontWeight: 800,
              textTransform: 'none', borderRadius: '8px', px: 3, py: 1.2,
              boxShadow: '0 4px 15px rgba(255,153,0,0.35)',
              '&:hover': { bgcolor: '#e68a00', boxShadow: '0 6px 20px rgba(255,153,0,0.5)' },
            }}
          >
            Proceed to List Product
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate('/rematch')}
            sx={{
              borderColor: '#ddd', color: '#555', fontWeight: 700,
              textTransform: 'none', borderRadius: '8px', px: 3, py: 1.2,
              '&:hover': { borderColor: '#FF9900', color: '#FF9900' },
            }}
          >
            Back to ReMatch
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AIEvaluation;
