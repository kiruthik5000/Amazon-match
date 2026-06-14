import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, Skeleton,
  LinearProgress, Divider, Alert, Tooltip,
} from '@mui/material';
import {
  EmojiNature, Co2, Autorenew, WorkspacePremium, EmojiEvents,
  TrendingUpRounded, ForestRounded, RecyclingRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import creditsApi from '../api/credits';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const DashboardSkeleton = () => (
  <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}>
    <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px', mb: 3 }} animation="wave" />
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[0,1,2,3].map((i) => (
        <Grid item xs={6} sm={3} key={i}>
          <Skeleton variant="rounded" height={110} sx={{ borderRadius: '12px' }} animation="wave" />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rounded" height={160} sx={{ borderRadius: '12px', mb: 3 }} animation="wave" />
    <Skeleton variant="rounded" height={240} sx={{ borderRadius: '12px' }} animation="wave" />
  </Box>
);

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, color, accent }) => (
  <Paper elevation={0} sx={{
    border: '1px solid #ebebeb', borderRadius: '12px', p: 2.5, height: '100%',
    position: 'relative', overflow: 'hidden',
    transition: 'box-shadow 0.2s, transform 0.2s',
    '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
  }}>
    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: `${color}0d`, pointerEvents: 'none' }} />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ width: 34, height: 34, borderRadius: '9px', bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ fontSize: '1.85rem', fontWeight: 900, color, lineHeight: 1, mb: 0.4 }}>{value}</Typography>
    {sub && <Typography sx={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 500 }}>{sub}</Typography>}
  </Paper>
);

// ─── Impact metric ────────────────────────────────────────────────────────────

const ImpactMetric = ({ icon, value, label, desc, color }) => (
  <Box sx={{
    textAlign: 'center', p: 2, borderRadius: '12px',
    bgcolor: `${color}0d`, border: `1px solid ${color}20`,
    transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' },
  }}>
    <Box sx={{ color, display: 'flex', justifyContent: 'center', mb: 0.5 }}>{icon}</Box>
    <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color, mt: 0.4, lineHeight: 1.3 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.64rem', color: '#aaa', mt: 0.3, lineHeight: 1.4 }}>{desc}</Typography>
  </Box>
);

// ─── Badge card ───────────────────────────────────────────────────────────────

const BadgeCard = ({ badge }) => (
  <Tooltip title={badge.description} arrow>
    <Paper elevation={0} sx={{
      border: `2px solid ${badge.earned ? '#FF9900' : '#ebebeb'}`,
      borderRadius: '12px', p: 1.5, textAlign: 'center',
      opacity: badge.earned ? 1 : 0.4,
      transition: 'all 0.2s, transform 0.2s',
      cursor: 'default',
      bgcolor: badge.earned ? '#fffbf0' : '#fafafa',
      '&:hover': badge.earned ? { boxShadow: '0 4px 16px rgba(255,153,0,0.2)', transform: 'translateY(-2px)' } : {},
    }}>
      <Typography sx={{ fontSize: '1.9rem', lineHeight: 1.3 }}>{badge.icon}</Typography>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, mt: 0.5, lineHeight: 1.3, color: badge.earned ? '#131921' : '#aaa' }}>
        {badge.name}
      </Typography>
      {badge.earned
        ? <Chip label="Earned" size="small" sx={{ mt: 0.6, height: 16, fontSize: '0.56rem', bgcolor: '#FF9900', color: '#131921', fontWeight: 800 }} />
        : <Typography sx={{ fontSize: '0.58rem', color: '#ccc', mt: 0.4 }}>Locked</Typography>
      }
    </Paper>
  </Tooltip>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const GreenCredits = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await creditsApi.getCredits(user.id);
      if (!result || !result.credits) throw new Error('Empty response');
      setData(result);
    } catch {
      setError('Could not load your Green Credits. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    load();
  }, [user, navigate, load]);

  if (loading) return <DashboardSkeleton />;

  if (error) return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, px: 2 }}>
      <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>
    </Box>
  );

  const { credits, badges } = data;
  const earnedCount = badges.filter((b) => b.earned).length;
  const co2Display  = credits.co2SavedKg?.toFixed(2) ?? '0.00';
  const treesEquiv  = (credits.co2SavedKg / 21).toFixed(2);
  const progressPct = Math.min((credits.totalCredits / 1000) * 100, 100);

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>

        {/* ── Hero banner ── */}
        <Box sx={{
          background: 'linear-gradient(135deg, #062c12 0%, #0d4a22 50%, #0f5c2a 100%)',
          borderRadius: '18px', p: { xs: 3, md: 4 }, mb: 3,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative rings */}
          {[220, 150].map((size, i) => (
            <Box key={i} sx={{
              position: 'absolute', right: -size / 2.5, top: -size / 2.5,
              width: size, height: size, borderRadius: '50%',
              border: `1.5px solid rgba(76,175,80,${0.1 + i * 0.06})`,
              pointerEvents: 'none',
            }} />
          ))}
          <Box sx={{ position: 'absolute', right: 60, top: 20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,80,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(76,175,80,0.2)', border: '1px solid rgba(76,175,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmojiNature sx={{ fontSize: 28, color: '#4caf50' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.5rem', md: '1.9rem' }, color: '#fff', lineHeight: 1, letterSpacing: '-0.3px' }}>
                  Green Credits
                </Typography>
                <Typography sx={{ color: '#81c784', fontSize: '0.82rem', mt: 0.3 }}>
                  Hello, {user?.name?.split(' ')[0] ?? 'there'} · Your eco-impact dashboard
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography sx={{ color: '#a5d6a7', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Badges Earned</Typography>
              <Typography sx={{ color: '#4caf50', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}>{earnedCount}<span style={{ fontSize: '0.9rem', color: '#555', fontWeight: 500 }}> / {badges.length}</span></Typography>
            </Box>
          </Box>

          {/* Progress bar */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography sx={{ fontSize: '0.74rem', color: '#a5d6a7', fontWeight: 500 }}>
                Progress to Green Millionaire
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#4caf50' }}>
                {credits.totalCredits} / 1,000 credits
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate" value={progressPct}
              sx={{
                height: 9, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#4caf50,#81c784)', borderRadius: 5 },
              }}
            />
            <Typography sx={{ fontSize: '0.66rem', color: '#5a8a5e', mt: 0.8 }}>
              {progressPct < 100
                ? `${1000 - credits.totalCredits} more credits needed to unlock 💎 Green Millionaire badge`
                : '🏆 Green Millionaire unlocked!'}
            </Typography>
          </Box>
        </Box>

        {/* ── Stats ── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<WorkspacePremium sx={{ fontSize: 18 }} />} label="Total Credits" value={credits.totalCredits} sub="Lifetime earned" color="#FF9900" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<TrendingUpRounded sx={{ fontSize: 18 }} />} label="Available" value={credits.availableCredits} sub="Ready to redeem" color="#067D62" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<Co2 sx={{ fontSize: 18 }} />} label="CO₂ Saved" value={`${co2Display} kg`} sub={`≈ ${treesEquiv} trees/yr`} color="#1565c0" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<RecyclingRounded sx={{ fontSize: 18 }} />} label="ReMatched" value={credits.itemsRematched} sub="Products given new life" color="#6a1b9a" />
          </Grid>
        </Grid>

        {/* ── Environmental Impact ── */}
        <Paper elevation={0} sx={{ border: '1px solid #ebebeb', borderRadius: '14px', p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ForestRounded sx={{ fontSize: 18, color: '#067D62' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F1111' }}>Environmental Impact</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#aaa', mb: 2.5 }}>
            Your ReMatch purchases are making a measurable difference.
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
          <Grid container spacing={2}>
            {[
              { icon: <Co2 sx={{ fontSize: 22 }} />,             value: `${co2Display} kg`,         label: 'CO₂ Avoided',       desc: 'vs. buying new',             color: '#1565c0' },
              { icon: <ForestRounded sx={{ fontSize: 22 }} />,   value: `${treesEquiv}`,             label: 'Tree-Year Equiv.',  desc: 'Annual CO₂ absorbed',        color: '#067D62' },
              { icon: <RecyclingRounded sx={{ fontSize: 22 }} />, value: `${credits.itemsRematched}`, label: 'Items Diverted',    desc: 'Kept out of landfill',       color: '#6a1b9a' },
              { icon: <EmojiNature sx={{ fontSize: 22 }} />,     value: credits.redeemedCredits,     label: 'Credits Redeemed',  desc: 'Used toward rewards',        color: '#e65100' },
            ].map(({ icon, value, label, desc, color }) => (
              <Grid item xs={6} md={3} key={label}>
                <ImpactMetric icon={icon} value={value} label={label} desc={desc} color={color} />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* ── Badges ── */}
        <Paper elevation={0} sx={{ border: '1px solid #ebebeb', borderRadius: '14px', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmojiEvents sx={{ fontSize: 18, color: '#FF9900' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F1111' }}>Badges Earned</Typography>
            <Chip
              label={`${earnedCount} / ${badges.length}`}
              size="small"
              sx={{ ml: 'auto', bgcolor: '#FF9900', color: '#131921', fontWeight: 800, fontSize: '0.7rem', height: 22 }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.74rem', color: '#aaa', mb: 2.5 }}>
            Keep purchasing ReMatch products to unlock more badges.
          </Typography>
          <Divider sx={{ mb: 2.5 }} />

          {earnedCount === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#fafafa', borderRadius: '10px', border: '2px dashed #ebebeb' }}>
              <Autorenew sx={{ fontSize: 36, color: '#ddd', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#888', mb: 0.5 }}>No badges yet</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#bbb' }}>Complete your first ReMatch purchase to earn your first badge!</Typography>
            </Box>
          ) : (
            <Grid container spacing={1.5}>
              {badges.map((badge) => (
                <Grid item xs={6} sm={4} md={2.4} key={badge.id}>
                  <BadgeCard badge={badge} />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

      </Box>
    </Box>
  );
};

export default GreenCredits;
