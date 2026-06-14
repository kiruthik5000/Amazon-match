import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert,
  CircularProgress, Link, Divider, InputAdornment, IconButton, Chip,
} from '@mui/material';
import {
  Visibility, VisibilityOff, MyLocation, LocationOn,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import backendApi from '../api/backendAxios';

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Required';
  if (!form.email.includes('@')) errors.email = 'Invalid email';
  if (form.password.length < 6) errors.password = 'Min 6 characters';
  if (form.password !== form.confirm) errors.confirm = 'Passwords do not match';
  return errors;
};

// Reverse-geocode lat/lon using OpenStreetMap Nominatim (free, no API key)
const reverseGeocode = async (lat, lon) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const addr = data.address || {};
  return {
    city: addr.city || addr.town || addr.village || addr.county || '',
    state: addr.state || '',
    country: addr.country || '',
  };
};

const LocationSection = ({ location, onDetect, onClear, geoStatus, form, onChange, errors }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#131921' }}>
        Location
      </Typography>
      {location.detected ? (
        <Chip
          icon={<LocationOn sx={{ fontSize: '0.9rem !important' }} />}
          label="Location detected"
          size="small"
          onDelete={onClear}
          sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontSize: '0.72rem' }}
        />
      ) : (
        <Button
          size="small"
          startIcon={geoStatus === 'loading' ? <CircularProgress size={12} /> : <MyLocation sx={{ fontSize: '1rem' }} />}
          onClick={onDetect}
          disabled={geoStatus === 'loading'}
          sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#007185' }}
        >
          {geoStatus === 'loading' ? 'Detecting…' : 'Use my location'}
        </Button>
      )}
    </Box>

    {geoStatus === 'denied' && (
      <Alert severity="warning" sx={{ mb: 1, py: 0.3, fontSize: '0.75rem' }}>
        Location access denied — enter manually below.
      </Alert>
    )}
    {geoStatus === 'error' && (
      <Alert severity="error" sx={{ mb: 1, py: 0.3, fontSize: '0.75rem' }}>
        Could not detect location — enter manually below.
      </Alert>
    )}

    {location.detected && (
      <Alert severity="success" icon={<LocationOn fontSize="small" />} sx={{ mb: 1, py: 0.3, fontSize: '0.75rem' }}>
        {`${location.city}, ${location.state}, ${location.country} (${location.lat.toFixed(4)}, ${location.lon.toFixed(4)})`}
      </Alert>
    )}

    <Box sx={{ display: 'flex', gap: 1 }}>
      <TextField
        fullWidth label="City" name="city" size="small"
        value={form.city} onChange={onChange}
        error={!!errors.city} helperText={errors.city}
        InputProps={location.detected ? { readOnly: true } : {}}
        sx={{ bgcolor: location.detected ? '#f9fbe7' : 'inherit' }}
      />
      <TextField
        fullWidth label="State" name="state" size="small"
        value={form.state} onChange={onChange}
        InputProps={location.detected ? { readOnly: true } : {}}
        sx={{ bgcolor: location.detected ? '#f9fbe7' : 'inherit' }}
      />
    </Box>
    <TextField
      fullWidth label="Country" name="country" size="small"
      value={form.country} onChange={onChange}
      InputProps={location.detected ? { readOnly: true } : {}}
      sx={{ mt: 1, bgcolor: location.detected ? '#f9fbe7' : 'inherit' }}
    />
  </Box>
);

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', phone: '',
    city: '', state: '', country: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | detected | denied | error
  const [location, setLocation] = useState({ detected: false, lat: null, lon: null, city: '', state: '', country: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const geo = await reverseGeocode(lat, lon);
          setLocation({ detected: true, lat, lon, ...geo });
          setForm((f) => ({ ...f, city: geo.city, state: geo.state, country: geo.country }));
          setGeoStatus('detected');
        } catch {
          // Geocoding failed — store coords but let user fill fields manually
          setLocation({ detected: true, lat, lon, city: '', state: '', country: '' });
          setGeoStatus('detected');
        }
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setLocation({ detected: false, lat: null, lon: null, city: '', state: '', country: '' });
    setForm((f) => ({ ...f, city: '', state: '', country: '' }));
    setGeoStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      setServerError('');
      const { confirm, ...payload } = form;
      if (location.detected) {
        payload.latitude = location.lat;
        payload.longitude = location.lon;
      }
      const res = await backendApi.post('/auth/register', payload);
      const { token, ...userData } = res.data;
      login(userData, token);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', px: 2, py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: '#131921', fontFamily: 'Georgia, serif' }}>
            amazon
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Create account</Typography>
          {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Name */}
            <TextField
              fullWidth label="Your name" name="name" value={form.name}
              onChange={handleChange} error={!!errors.name} helperText={errors.name}
              size="small" sx={{ mb: 2 }} autoComplete="name"
            />

            {/* Email */}
            <TextField
              fullWidth label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} error={!!errors.email} helperText={errors.email}
              size="small" sx={{ mb: 2 }} autoComplete="email"
            />

            {/* Phone */}
            <TextField
              fullWidth label="Phone (optional)" name="phone" type="tel" value={form.phone}
              onChange={handleChange} size="small" sx={{ mb: 2 }} autoComplete="tel"
            />

            {/* Location */}
            <LocationSection
              location={location}
              onDetect={handleDetectLocation}
              onClear={handleClearLocation}
              geoStatus={geoStatus}
              form={form}
              onChange={handleChange}
              errors={errors}
            />

            {/* Password */}
            <TextField
              fullWidth label="Password" name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password} onChange={handleChange}
              error={!!errors.password} helperText={errors.password || 'At least 6 characters'}
              size="small" sx={{ mb: 2 }} autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password */}
            <TextField
              fullWidth label="Re-enter password" name="confirm" type="password"
              value={form.confirm} onChange={handleChange}
              error={!!errors.confirm} helperText={errors.confirm}
              size="small" sx={{ mb: 2 }} autoComplete="new-password"
            />

            <Button
              type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ bgcolor: '#FF9900', color: '#131921', fontWeight: 700, textTransform: 'none', borderRadius: '20px', mb: 1.5, '&:hover': { bgcolor: '#e68a00' } }}
            >
              {loading
                ? <CircularProgress size={22} sx={{ color: '#131921' }} />
                : 'Create your Amazon account'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            By creating an account, you agree to Amazon's{' '}
            <Link href="#" underline="hover">Conditions of Use</Link> and{' '}
            <Link href="#" underline="hover">Privacy Notice</Link>.
          </Typography>
        </Paper>

        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ color: '#007185' }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
