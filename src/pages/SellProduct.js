import React, { useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button,
  Stepper, Step, StepLabel, Chip, LinearProgress,
  IconButton, Tooltip, CircularProgress, Alert,
} from '@mui/material';
import {
  Autorenew, CloudUploadRounded, CheckCircleRounded,
  StorefrontRounded, ArrowForwardRounded, ArrowBackRounded,
  DeleteRounded, AddPhotoAlternateRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createListing } from '../api/products';

const CATEGORIES = [
  "Electronics", "Men's Clothing", "Women's Clothing", "Jewellery", "Home & Kitchen",
  "Sports & Outdoors", "Books", "Toys & Games", "Other",
];

const YEARS = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() - i));

const STEPS = ['Product Info', 'Pricing & Details', 'Photo & Submit'];

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGES = 5;

const Field = (props) => (
  <TextField
    fullWidth
    variant="outlined"
    size="small"
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        bgcolor: '#fff',
        '&:hover fieldset': { borderColor: '#FF9900' },
        '&.Mui-focused fieldset': { borderColor: '#FF9900', borderWidth: 2 },
      },
      '& label.Mui-focused': { color: '#FF9900' },
    }}
    {...props}
  />
);

const INIT = {
  name: '', category: '', brand: '', purchaseYear: '',
  originalPrice: '', expectedPrice: '', description: '', images: [],
};

const SellProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INIT);
  const [previews, setPreviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';

    const invalid = files.filter((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalid.length) {
      setImageError(`Invalid format: ${invalid.map((f) => f.name).join(', ')}. Use JPG, PNG or WEBP.`);
      return;
    }

    setImageError('');
    setForm((prev) => {
      const remaining = MAX_IMAGES - prev.images.length;
      const toAdd = files.slice(0, remaining);
      if (files.length > remaining)
        setImageError(`Only ${remaining} more image${remaining !== 1 ? 's' : ''} can be added (max ${MAX_IMAGES}).`);
      const newImages = [...prev.images, ...toAdd];
      setPreviews(newImages.map((f) => URL.createObjectURL(f)));
      setErrors((er) => ({ ...er, images: '' }));
      return { ...prev, images: newImages };
    });
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      setPreviews(newImages.map((f) => URL.createObjectURL(f)));
      return { ...prev, images: newImages };
    });
    setImageError('');
  };

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim())     e.name         = 'Product name is required';
      if (!form.category)        e.category     = 'Select a category';
      if (!form.brand.trim())    e.brand        = 'Brand is required';
      if (!form.purchaseYear)    e.purchaseYear = 'Select purchase year';
    }
    if (step === 1) {
      if (!form.originalPrice || isNaN(form.originalPrice) || +form.originalPrice <= 0)
        e.originalPrice = 'Enter a valid original price';
      if (!form.expectedPrice || isNaN(form.expectedPrice) || +form.expectedPrice <= 0)
        e.expectedPrice = 'Enter a valid expected price';
      if (!form.description.trim() || form.description.trim().length < 20)
        e.description = 'Description must be at least 20 characters';
    }
    if (step === 2) {
      if (!form.images.length) e.images = 'Please upload at least one product image';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const data = new FormData();
      data.append('productName', form.name);
      data.append('category', form.category);
      data.append('brand', form.brand);
      data.append('purchaseYear', form.purchaseYear);
      data.append('originalPrice', form.originalPrice);
      data.append('expectedPrice', form.expectedPrice);
      data.append('description', form.description);
      const sellerId = user?.id ? String(user.id) : 'guest';
      data.append('sellerId', sellerId);
      form.images.forEach((img) => data.append('images', img));

      const res = await createListing(data);
      setAiResult(res.data?.data ?? null);
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const GRADE_COLOR = { A: '#2e7d32', B: '#1565c0', C: '#e65100', D: '#b71c1c' };

  if (submitted) {
    return (
      <Box sx={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        bgcolor: '#f8f9fa', px: 3, textAlign: 'center',
      }}>
        <CheckCircleRounded sx={{ fontSize: 72, color: '#4caf50', mb: 2 }} />
        <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#0F1111', mb: 1 }}>
          Listing Submitted!
        </Typography>
        <Typography sx={{ color: '#666', maxWidth: 420, mb: 1 }}>
          <strong>{form.name}</strong> has been submitted for review. Our team will verify
          and list it on Amazon ReMatch within 24–48 hours.
        </Typography>
        <Chip label="Under Review" sx={{ bgcolor: '#fff8e1', color: '#e65100', fontWeight: 700, mb: 3 }} />

        {/* AI Evaluation Results */}
        {aiResult?.conditionGrade && (
          <Box sx={{
            bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e8e8',
            p: 3, mb: 3, maxWidth: 420, width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', textAlign: 'left',
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F1111', mb: 2 }}>
              AI Condition Assessment
            </Typography>
            {[
              ['Condition Grade', <Chip key="g" label={aiResult.conditionGrade} size="small" sx={{ bgcolor: GRADE_COLOR[aiResult.conditionGrade] || '#555', color: '#fff', fontWeight: 800 }} />],
              ['Confidence Score', `${aiResult.confidenceScore}%`],
              ['Life Score', `${aiResult.lifeScore} / 100`],
              ['Est. Resale Value', aiResult.estimatedResaleValue ? `₹${Number(aiResult.estimatedResaleValue).toLocaleString()}` : '—'],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6, borderBottom: '1px solid #f0f0f0' }}>
                <Typography sx={{ fontSize: '0.82rem', color: '#666' }}>{label}</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F1111' }}>{value}</Typography>
              </Box>
            ))}
            {aiResult.aiSummary && (
              <Typography sx={{ fontSize: '0.75rem', color: '#555', mt: 1.5, lineHeight: 1.6 }}>
                {aiResult.aiSummary}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => { setForm(INIT); setPreviews([]); setImageError(''); setStep(0); setSubmitted(false); setAiResult(null); }}
            sx={{ bgcolor: '#FF9900', color: '#131921', fontWeight: 800, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#e68a00' } }}
          >
            List Another Product
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/rematch')}
            sx={{ borderColor: '#FF9900', color: '#FF9900', fontWeight: 700, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#fff8e1' } }}
          >
            Back to ReMatch
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>

      {/* Hero */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
            <Autorenew sx={{ fontSize: 44, color: '#FF9900' }} />
            <Box sx={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 14, height: 14, bgcolor: '#FF9900', borderRadius: '3px',
            }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{
                fontWeight: 900, color: '#FF9900', fontFamily: 'Georgia, serif',
                fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.5px', lineHeight: 1,
              }}>
                Sell on ReMatch
              </Typography>
              <StorefrontRounded sx={{ color: '#FF9900', fontSize: 22, mb: 0.2 }} />
            </Box>
            <Typography sx={{ color: '#8ba7be', fontSize: '0.85rem', mt: 0.4, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 300 }}>
              Give your product a second life
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ color: '#7fa3bf', mt: 1, maxWidth: 500, fontSize: '0.9rem', lineHeight: 1.7 }}>
          List your returned or pre-owned product. Our AI verifies every listing
          and connects it with the right buyer.
        </Typography>
      </Box>

      {/* Form Card */}
      <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, md: 5 } }}>

        {/* Stepper */}
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': { fontSize: '0.78rem', fontWeight: 600 },
                  '& .MuiStepIcon-root.Mui-active': { color: '#FF9900' },
                  '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <LinearProgress
          variant="determinate"
          value={(step / STEPS.length) * 100}
          sx={{ mb: 4, height: 4, borderRadius: 2, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#FF9900' } }}
        />

        <Box sx={{
          bgcolor: '#fff', borderRadius: '16px',
          border: '1px solid #e8e8e8', p: { xs: 3, sm: 4 },
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F1111', mb: 3 }}>
            {STEPS[step]}
          </Typography>

          {/* Step 0 — Product Info */}
          {step === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Field
                label="Product Name *"
                value={form.name}
                onChange={set('name')}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g. Sony WH-1000XM4 Headphones"
              />
              <Field
                select label="Category *"
                value={form.category}
                onChange={set('category')}
                error={!!errors.category}
                helperText={errors.category}
              >
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Field>
              <Field
                label="Brand *"
                value={form.brand}
                onChange={set('brand')}
                error={!!errors.brand}
                helperText={errors.brand}
                placeholder="e.g. Sony"
              />
              <Field
                select label="Purchase Year *"
                value={form.purchaseYear}
                onChange={set('purchaseYear')}
                error={!!errors.purchaseYear}
                helperText={errors.purchaseYear}
              >
                {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Field>
            </Box>
          )}

          {/* Step 1 — Pricing & Details */}
          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 160 }}>
                  <Field
                    label="Original Price (₹) *"
                    value={form.originalPrice}
                    onChange={set('originalPrice')}
                    error={!!errors.originalPrice}
                    helperText={errors.originalPrice}
                    placeholder="e.g. 34999"
                    type="number"
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 160 }}>
                  <Field
                    label="Expected Price (₹) *"
                    value={form.expectedPrice}
                    onChange={set('expectedPrice')}
                    error={!!errors.expectedPrice}
                    helperText={errors.expectedPrice}
                    placeholder="e.g. 22000"
                    type="number"
                  />
                </Box>
              </Box>
              {form.originalPrice && form.expectedPrice && +form.expectedPrice < +form.originalPrice && (
                <Chip
                  label={`${Math.round((1 - form.expectedPrice / form.originalPrice) * 100)}% off original price`}
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, alignSelf: 'flex-start' }}
                />
              )}
              <Field
                label="Product Description *"
                value={form.description}
                onChange={set('description')}
                error={!!errors.description}
                helperText={errors.description || `${form.description.length} chars (min 20)`}
                placeholder="Describe the condition, accessories included, reason for selling..."
                multiline rows={5}
              />
            </Box>
          )}

          {/* Step 2 — Image Upload */}
          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Upload zone — shown when under limit */}
              {form.images.length < MAX_IMAGES && (
                <Box
                  component="label"
                  htmlFor="image-upload"
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: `2px dashed ${errors.images ? '#d32f2f' : '#FF9900'}`,
                    borderRadius: '12px', py: 4, px: 3, cursor: 'pointer',
                    bgcolor: '#fffdf5', transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#fff8e1', borderColor: '#e68a00' },
                  }}
                >
                  <AddPhotoAlternateRounded sx={{ fontSize: 44, color: '#FF9900', mb: 1 }} />
                  <Typography sx={{ fontWeight: 700, color: '#0F1111' }}>
                    Click to upload images
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#888', mt: 0.3 }}>
                    JPG, PNG, WEBP · up to 10 MB each · {form.images.length}/{MAX_IMAGES} uploaded
                  </Typography>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    hidden
                    onChange={handleImages}
                  />
                </Box>
              )}

              {/* Errors */}
              {(errors.images || imageError) && (
                <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', ml: 0.5 }}>
                  {errors.images || imageError}
                </Typography>
              )}

              {/* Preview grid */}
              {previews.length > 0 && (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 1.5,
                }}>
                  {previews.map((src, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'relative', borderRadius: '10px', overflow: 'hidden',
                        border: i === 0 ? '2px solid #FF9900' : '1px solid #e0e0e0',
                        bgcolor: '#f5f5f5', aspectRatio: '1',
                      }}
                    >
                      <Box
                        component="img"
                        src={src}
                        alt={`product-${i}`}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {i === 0 && (
                        <Chip
                          label="Cover"
                          size="small"
                          sx={{
                            position: 'absolute', bottom: 6, left: 6,
                            bgcolor: '#FF9900', color: '#131921',
                            fontWeight: 800, fontSize: '0.6rem', height: 18,
                          }}
                        />
                      )}
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => removeImage(i)}
                          sx={{
                            position: 'absolute', top: 4, right: 4,
                            bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                            width: 24, height: 24,
                            '&:hover': { bgcolor: '#d32f2f' },
                          }}
                        >
                          <DeleteRounded sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}

                  {/* Add-more tile inside grid */}
                  {form.images.length < MAX_IMAGES && (
                    <Box
                      component="label"
                      htmlFor="image-upload-more"
                      sx={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '10px', border: '2px dashed #e0e0e0',
                        cursor: 'pointer', aspectRatio: '1', bgcolor: '#fafafa',
                        '&:hover': { borderColor: '#FF9900', bgcolor: '#fffdf5' },
                      }}
                    >
                      <CloudUploadRounded sx={{ fontSize: 28, color: '#bbb' }} />
                      <Typography sx={{ fontSize: '0.68rem', color: '#aaa', mt: 0.5, textAlign: 'center' }}>
                        Add more
                      </Typography>
                      <input
                        id="image-upload-more"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        hidden
                        onChange={handleImages}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Listing Summary */}
              <Box sx={{ bgcolor: '#f8f9fa', borderRadius: '10px', p: 2.5, border: '1px solid #ebebeb', mt: 0.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F1111', mb: 1.5 }}>Listing Summary</Typography>
                {[
                  ['Product',        form.name],
                  ['Category',       form.category],
                  ['Brand',          form.brand],
                  ['Purchased',      form.purchaseYear],
                  ['Original Price', form.originalPrice ? `₹${Number(form.originalPrice).toLocaleString()}` : '—'],
                  ['Asking Price',   form.expectedPrice ? `₹${Number(form.expectedPrice).toLocaleString()}` : '—'],
                  ['Images',         form.images.length ? `${form.images.length} photo${form.images.length > 1 ? 's' : ''}` : '—'],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>{label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F1111' }}>{value || '—'}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Navigation */}
          {submitError && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: '8px' }}>{submitError}</Alert>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={step === 0 ? null : <ArrowBackRounded />}
              onClick={step === 0 ? () => navigate('/rematch') : back}
              sx={{
                borderColor: '#ddd', color: '#555', textTransform: 'none', fontWeight: 700,
                borderRadius: '8px', px: 3,
                '&:hover': { borderColor: '#FF9900', color: '#FF9900' },
              }}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                onClick={next}
                sx={{
                  bgcolor: '#FF9900', color: '#131921', fontWeight: 800,
                  textTransform: 'none', borderRadius: '8px', px: 3,
                  boxShadow: '0 4px 15px rgba(255,153,0,0.3)',
                  '&:hover': { bgcolor: '#e68a00' },
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <StorefrontRounded />}
                onClick={handleSubmit}
                disabled={submitting}
                sx={{
                  bgcolor: '#FF9900', color: '#131921', fontWeight: 800,
                  textTransform: 'none', borderRadius: '8px', px: 3,
                  boxShadow: '0 4px 15px rgba(255,153,0,0.3)',
                  '&:hover': { bgcolor: '#e68a00' },
                  '&.Mui-disabled': { bgcolor: '#ffcc80' },
                }}
              >
                {submitting ? 'Analysing…' : 'Submit Listing'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SellProduct;
