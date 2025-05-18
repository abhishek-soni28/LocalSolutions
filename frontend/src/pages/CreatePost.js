import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import api from '../api/axios';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  MenuItem,
  Grid,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { Formik, Form } from 'formik';

const validationSchema = Yup.object({
  content: Yup.string()
    .min(10, 'Content must be at least 10 characters')
    .required('Content is required'),
  category: Yup.string().required('Category is required'),
  type: Yup.string().required('Post type is required'),
  status: Yup.string().required('Status is required'),
  pincode: Yup.string()
    .matches(/^\d{6}$/, 'Pincode must be 6 digits')
    .required('Pincode is required'),
});

const categories = [
  { value: 'GENERAL', label: 'General' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'CARPENTRY', label: 'Carpentry' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'FOOD', label: 'Food' },
  { value: 'GROCERY', label: 'Grocery' },
  { value: 'OTHER', label: 'Other' },
];

const postTypes = [
  { value: 'PROBLEM', label: 'Problem' },
  { value: 'SOLUTION', label: 'Solution' },
];

const postStatuses = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      setSubmitError('Please log in to create a post');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoading(true);
      setSubmitError(null);

      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        try {
          // Create a FormData object to upload the image
          const formData = new FormData();
          formData.append('file', imageFile);

          // Upload the image
          const response = await api.post('/files/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          imageUrl = response.data.url;
        } catch (error) {
          setUploadError('Failed to upload image. Please try again.');
          setSubmitting(false);
          setLoading(false);
          return;
        }
      }

      // Create post data with all required fields
      const postData = {
        content: values.content,
        type: values.type,
        status: values.status,
        category: values.category,
        pincode: values.pincode,
        imageUrl: imageUrl,
      };

      // Create post
      const response = await api.post('/posts', postData);
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 401) {
        setSubmitError('Your session has expired. Please log in again.');
        logout();
        navigate('/login');
      } else if (error.response?.data?.error) {
        setSubmitError(error.response.data.error);
      } else if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error.response?.data) {
        setSubmitError(error.response.data);
      } else if (error.validationErrors) {
        Object.keys(error.validationErrors).forEach(field => {
          setFieldError(field, error.validationErrors[field]);
        });
      } else {
        setSubmitError(error.message || 'Failed to create post. Please try again.');
      }
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Formik
          initialValues={{
            content: '',
            category: '',
            type: 'PROBLEM',
            status: 'OPEN',
            pincode: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="content"
                  label="Content"
                  value={values.content}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.content && Boolean(errors.content)}
                  helperText={touched.content && errors.content}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="category"
                    label="Category"
                    value={values.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.category && Boolean(errors.category)}
                    helperText={touched.category && errors.category}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="type"
                    label="Post Type"
                    value={values.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.type && Boolean(errors.type)}
                    helperText={touched.type && errors.type}
                  >
                    {postTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="status"
                    label="Status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.status && Boolean(errors.status)}
                    helperText={touched.status && errors.status}
                  >
                    {postStatuses.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="pincode"
                    label="Pincode"
                    value={values.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.pincode && Boolean(errors.pincode)}
                    helperText={touched.pincode && errors.pincode}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{ mr: 2 }}
                  >
                    Upload Image
                  </Button>
                </label>
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                    <IconButton onClick={handleDeleteImage} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                )}
                {uploadError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {uploadError}
                  </Alert>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? <CircularProgress size={24} /> : 'Create Post'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default CreatePost;