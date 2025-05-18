import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const Privacy = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            At Local Solutions, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our platform.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information that you provide directly to us, including:
          </Typography>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Profile information (bio, skills, location)</li>
            <li>Service-related information</li>
            <li>Communication preferences</li>
          </ul>
          <Typography variant="h6" gutterBottom>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you about our services</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
          <Typography variant="h6" gutterBottom>
            Information Sharing
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell your personal information. We may share your information with:
          </Typography>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Other users as necessary for service provision</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default Privacy; 