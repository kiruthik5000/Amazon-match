import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button,
  Divider, Alert, CircularProgress, Link,
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import backendApi from '../api/backendAxios';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    try {
      setLoading(true);
      setError('');
      const res = await backendApi.post('/auth/login', form);
      const { token, ...userData } = res.data;
      login(userData, token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 380 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: '#131921', fontFamily: 'Georgia, serif' }}>
            amazon
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Sign in</Typography>
          {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" name="email" type="email"
              value={form.email} onChange={handleChange}
              size="small" sx={{ mb: 2 }} autoComplete="email"
            />
            <TextField
              fullWidth label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              size="small" sx={{ mb: 2 }} autoComplete="current-password"
            />
            <Button
              type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ bgcolor: '#FF9900', color: '#131921', fontWeight: 700, textTransform: 'none', borderRadius: '20px', mb: 1.5, '&:hover': { bgcolor: '#e68a00' } }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#131921' }} /> : 'Continue'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            By continuing, you agree to Amazon's{' '}
            <Link href="#" underline="hover">Conditions of Use</Link> and{' '}
            <Link href="#" underline="hover">Privacy Notice</Link>.
          </Typography>
        </Paper>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">New to Amazon?</Typography>
        </Divider>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
          <Button
            fullWidth variant="outlined" component={RouterLink} to="/register"
            sx={{ textTransform: 'none', borderRadius: '20px', borderColor: '#ccc', color: '#131921' }}
          >
            Create your Amazon account
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
