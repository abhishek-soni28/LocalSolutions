import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { updateUserSettings, deleteAccount } from '../../store/slices/userSlice';

const validationSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .when('newPassword', {
      is: (val) => val && val.length > 0,
      then: Yup.string().required('Please confirm your new password'),
    }),
});

const ProfileSettings = ({ user }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(updateUserSettings(values)).unwrap();
      setSuccess(true);
      setError(null);
      resetForm();
    } catch (error) {
      setError(error.message || 'Failed to update settings');
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.username) {
      setError('Username does not match');
      return;
    }

    try {
      await dispatch(deleteAccount()).unwrap();
      // The user will be logged out and redirected by the auth slice
    } catch (error) {
      setError(error.message || 'Failed to delete account');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings updated successfully
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <TextField
                fullWidth
                type="password"
                name="currentPassword"
                label="Current Password"
                value={values.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.currentPassword && Boolean(errors.currentPassword)}
                helperText={touched.currentPassword && errors.currentPassword}
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                name="newPassword"
                label="New Password"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                name="confirmPassword"
                label="Confirm New Password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                Update Password
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Email notifications for new comments"
        />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Email notifications for new likes"
        />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Email notifications for new followers"
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="error">
          Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Once you delete your account, there is no going back. Please be certain.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Account
        </Button>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            This action cannot be undone. Please type your username to confirm.
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={user.username}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSettings; 