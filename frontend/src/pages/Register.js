import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { register } from '../store/slices/authSlice';

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
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
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  isBusinessOwner: Yup.boolean(),
  shopName: Yup.string().when('isBusinessOwner', {
    is: true,
    then: Yup.string().required('Shop name is required'),
  }),
  businessCategory: Yup.string().when('isBusinessOwner', {
    is: true,
    then: Yup.string().required('Business category is required'),
  }),
  serviceArea: Yup.string().when('isBusinessOwner', {
    is: true,
    then: Yup.string().required('Service area is required'),
  }),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (values) => {
    try {
      const userData = {
        ...values,
        role: values.isBusinessOwner ? 'BUSINESS_OWNER' : 'CUSTOMER'
      };
      await dispatch(register(userData)).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Register
        </Typography>

        <Formik
          initialValues={{
            username: '',
            fullName: '',
            email: '',
            mobileNumber: '',
            pincode: '',
            password: '',
            confirmPassword: '',
            isBusinessOwner: false,
            shopName: '',
            businessCategory: '',
            serviceArea: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="username"
                    label="Username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="fullName"
                    label="Full Name"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fullName && Boolean(errors.fullName)}
                    helperText={touched.fullName && errors.fullName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
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
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="mobileNumber"
                    label="Mobile Number"
                    value={values.mobileNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.mobileNumber && Boolean(errors.mobileNumber)}
                    helperText={touched.mobileNumber && errors.mobileNumber}
                  />
                </Grid>

                <Grid item xs={12}>
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

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.isBusinessOwner}
                        onChange={handleChange}
                        name="isBusinessOwner"
                      />
                    }
                    label="Register as Business Owner"
                  />
                </Grid>

                {values.isBusinessOwner && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="shopName"
                        label="Shop Name"
                        value={values.shopName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.shopName && Boolean(errors.shopName)}
                        helperText={touched.shopName && errors.shopName}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="businessCategory"
                        label="Business Category"
                        value={values.businessCategory}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.businessCategory && Boolean(errors.businessCategory)}
                        helperText={touched.businessCategory && errors.businessCategory}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="serviceArea"
                        label="Service Area"
                        value={values.serviceArea}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.serviceArea && Boolean(errors.serviceArea)}
                        helperText={touched.serviceArea && errors.serviceArea}
                      />
                    </Grid>
                  </>
                )}

                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      {error}
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Register'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Register; 