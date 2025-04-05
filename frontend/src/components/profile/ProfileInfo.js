import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera, Delete as DeleteIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { updateUserProfile } from '../../store/slices/userSlice';
import { uploadImage, deleteImage } from '../../services/fileUploadService';

const validationSchema = Yup.object({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
    .required('Pincode is required'),
  bio: Yup.string().max(500, 'Bio must not exceed 500 characters'),
});

const ProfileInfo = ({ username }) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setImageError(null);
        const imageUrl = await uploadImage(file);
        setProfileImage(imageUrl);
      } catch (error) {
        setImageError(error.message);
      }
    }
  };

  const handleDeleteImage = async () => {
    if (profileImage) {
      try {
        await deleteImage(profileImage);
        setProfileImage(null);
      } catch (error) {
        setImageError(error.message);
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      const profileData = {
        ...values,
        profileImage: profileImage || user?.profileImage,
      };
      await dispatch(updateUserProfile(profileData)).unwrap();
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const isOwnProfile = user?.username === username;

  if (!isOwnProfile) {
    return (
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              src={user?.profileImage}
              alt={user?.fullName}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {user?.fullName}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {user?.bio || 'No bio available'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mobile: {user?.mobileNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pincode: {user?.pincode}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Formik
        initialValues={{
          fullName: user?.fullName || '',
          email: user?.email || '',
          mobileNumber: user?.mobileNumber || '',
          pincode: user?.pincode || '',
          bio: user?.bio || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Avatar
                  src={profileImage || user?.profileImage}
                  alt={values.fullName}
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{ mb: 1 }}
                  >
                    Upload Photo
                  </Button>
                </label>
                {profileImage && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteImage}
                  >
                    Remove Photo
                  </Button>
                )}
                {imageError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {imageError}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={8}>
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

                <TextField
                  fullWidth
                  name="fullName"
                  label="Full Name"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.fullName && Boolean(errors.fullName)}
                  helperText={touched.fullName && errors.fullName}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  name="mobileNumber"
                  label="Mobile Number"
                  value={values.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.mobileNumber && Boolean(errors.mobileNumber)}
                  helperText={touched.mobileNumber && errors.mobileNumber}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  name="pincode"
                  label="Pincode"
                  value={values.pincode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.pincode && Boolean(errors.pincode)}
                  helperText={touched.pincode && errors.pincode}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  name="bio"
                  label="Bio"
                  multiline
                  rows={4}
                  value={values.bio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.bio && Boolean(errors.bio)}
                  helperText={touched.bio && errors.bio}
                  sx={{ mb: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default ProfileInfo; 