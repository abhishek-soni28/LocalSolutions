import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const Terms = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Terms of Service
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            Welcome to Local Solutions. By accessing or using our platform, you agree to be bound by these Terms of Service.
          </Typography>
          <Typography variant="h6" gutterBottom>
            User Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>
            As a user of Local Solutions, you agree to:
          </Typography>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
            <li>Use the platform in compliance with all applicable laws</li>
            <li>Respect the rights and privacy of other users</li>
          </ul>
          <Typography variant="h6" gutterBottom>
            Service Provider Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>
            Service providers on our platform must:
          </Typography>
          <ul>
            <li>Provide services in a professional manner</li>
            <li>Honor commitments made to customers</li>
            <li>Maintain appropriate licenses and insurance</li>
            <li>Respond promptly to customer inquiries</li>
          </ul>
          <Typography variant="h6" gutterBottom>
            Platform Rules
          </Typography>
          <Typography variant="body1" paragraph>
            Users must not:
          </Typography>
          <ul>
            <li>Post false or misleading information</li>
            <li>Engage in fraudulent activities</li>
            <li>Harass or discriminate against others</li>
            <li>Violate intellectual property rights</li>
          </ul>
          <Typography variant="h6" gutterBottom>
            Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to terminate or suspend accounts that violate these terms or engage in harmful behavior.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Terms; 