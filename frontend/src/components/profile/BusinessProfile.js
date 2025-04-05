import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { updateBusinessProfile } from '../../store/slices/userSlice';

const validationSchema = Yup.object({
  businessName: Yup.string()
    .required('Business name is required')
    .min(2, 'Business name must be at least 2 characters'),
  businessType: Yup.string().required('Business type is required'),
  address: Yup.string().required('Address is required'),
  description: Yup.string()
    .required('Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  openingHours: Yup.string().required('Opening hours are required'),
  website: Yup.string().url('Must be a valid URL'),
  socialMedia: Yup.object({
    facebook: Yup.string().url('Must be a valid URL'),
    twitter: Yup.string().url('Must be a valid URL'),
    instagram: Yup.string().url('Must be a valid URL'),
    linkedin: Yup.string().url('Must be a valid URL'),
  }),
});

const businessTypes = [
  'Retail',
  'Restaurant',
  'Service',
  'Healthcare',
  'Education',
  'Technology',
  'Other',
];

const BusinessProfile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (values) => {
    try {
      await dispatch(updateBusinessProfile(values)).unwrap();
      setSuccessMessage('Business profile updated successfully');
    } catch (error) {
      console.error('Error updating business profile:', error);
    }
  };

  const initialValues = {
    businessName: user?.businessProfile?.businessName || '',
    businessType: user?.businessProfile?.businessType || '',
    address: user?.businessProfile?.address || '',
    description: user?.businessProfile?.description || '',
    openingHours: user?.businessProfile?.openingHours || '',
    website: user?.businessProfile?.website || '',
    socialMedia: {
      facebook: user?.businessProfile?.socialMedia?.facebook || '',
      twitter: user?.businessProfile?.socialMedia?.twitter || '',
      instagram: user?.businessProfile?.socialMedia?.instagram || '',
      linkedin: user?.businessProfile?.socialMedia?.linkedin || '',
    },
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Business Profile
      </Typography>

      {user?.businessProfile?.verificationStatus && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Verification Status: {user.businessProfile.verificationStatus}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="businessName"
                  label="Business Name"
                  value={values.businessName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.businessName && Boolean(errors.businessName)}
                  helperText={touched.businessName && errors.businessName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    name="businessType"
                    value={values.businessType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.businessType && Boolean(errors.businessType)}
                  >
                    {businessTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Business Address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Business Description"
                  multiline
                  rows={4}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="openingHours"
                  label="Opening Hours"
                  value={values.openingHours}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.openingHours && Boolean(errors.openingHours)}
                  helperText={touched.openingHours && errors.openingHours}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="website"
                  label="Website"
                  value={values.website}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.website && Boolean(errors.website)}
                  helperText={touched.website && errors.website}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Social Media Links
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="socialMedia.facebook"
                      label="Facebook"
                      value={values.socialMedia.facebook}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.socialMedia?.facebook &&
                        Boolean(errors.socialMedia?.facebook)
                      }
                      helperText={
                        touched.socialMedia?.facebook &&
                        errors.socialMedia?.facebook
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="socialMedia.twitter"
                      label="Twitter"
                      value={values.socialMedia.twitter}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.socialMedia?.twitter &&
                        Boolean(errors.socialMedia?.twitter)
                      }
                      helperText={
                        touched.socialMedia?.twitter && errors.socialMedia?.twitter
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="socialMedia.instagram"
                      label="Instagram"
                      value={values.socialMedia.instagram}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.socialMedia?.instagram &&
                        Boolean(errors.socialMedia?.instagram)
                      }
                      helperText={
                        touched.socialMedia?.instagram &&
                        errors.socialMedia?.instagram
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="socialMedia.linkedin"
                      label="LinkedIn"
                      value={values.socialMedia.linkedin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.socialMedia?.linkedin &&
                        Boolean(errors.socialMedia?.linkedin)
                      }
                      helperText={
                        touched.socialMedia?.linkedin &&
                        errors.socialMedia?.linkedin
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Update Business Profile
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default BusinessProfile; 