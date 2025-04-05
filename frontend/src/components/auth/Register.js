import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import { register, clearError } from '../../store/slices/authSlice';
import { auth } from '../../services/api';
import { UserRole } from '../../constants/UserRole';

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
    .required('Pincode is required'),
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
  const { loading, error } = useSelector((state) => state.user);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');

  const handleSubmit = async (values) => {
    const userData = {
      ...values,
      role: values.isBusinessOwner ? UserRole.BUSINESS_OWNER : UserRole.CUSTOMER
    };
    console.log('Submitting registration data:', userData);
    const result = await dispatch(register(userData));
    if (!result.error) {
      navigate('/login');
    }
  };

  const checkAvailability = async (field, value) => {
    try {
      let response;
      switch (field) {
        case 'username':
          response = await auth.checkUsername(value);
          setUsernameError(response.data.exists ? 'Username already exists' : '');
          break;
        case 'email':
          response = await auth.checkEmail(value);
          setEmailError(response.data.exists ? 'Email already exists' : '');
          break;
        case 'mobile':
          response = await auth.checkMobile(value);
          setMobileError(response.data.exists ? 'Mobile number already exists' : '');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Formik
            initialValues={{
              username: '',
              password: '',
              confirmPassword: '',
              fullName: '',
              email: '',
              mobileNumber: '',
              pincode: '',
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="username"
                      name="username"
                      label="Username"
                      value={values.username}
                      onChange={(e) => {
                        handleChange(e);
                        checkAvailability('username', e.target.value);
                      }}
                      onBlur={handleBlur}
                      error={touched.username && (Boolean(errors.username) || Boolean(usernameError))}
                      helperText={touched.username && (errors.username || usernameError)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="password"
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
                      id="confirmPassword"
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
                    <TextField
                      fullWidth
                      id="fullName"
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
                      id="email"
                      name="email"
                      label="Email"
                      value={values.email}
                      onChange={(e) => {
                        handleChange(e);
                        checkAvailability('email', e.target.value);
                      }}
                      onBlur={handleBlur}
                      error={touched.email && (Boolean(errors.email) || Boolean(emailError))}
                      helperText={touched.email && (errors.email || emailError)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="mobileNumber"
                      name="mobileNumber"
                      label="Mobile Number"
                      value={values.mobileNumber}
                      onChange={(e) => {
                        handleChange(e);
                        checkAvailability('mobile', e.target.value);
                      }}
                      onBlur={handleBlur}
                      error={touched.mobileNumber && (Boolean(errors.mobileNumber) || Boolean(mobileError))}
                      helperText={touched.mobileNumber && (errors.mobileNumber || mobileError)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="pincode"
                      name="pincode"
                      label="Pincode"
                      value={values.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.pincode && Boolean(errors.pincode)}
                      helperText={touched.pincode && errors.pincode}
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
                          id="shopName"
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
                          id="businessCategory"
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
                          id="serviceArea"
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
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? 'Registering...' : 'Register'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 