import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          About Local Solutions
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            Local Solutions is a platform designed to connect local service providers with customers in their community.
            Our mission is to make it easier for people to find and hire trusted local professionals for various services.
          </Typography>
          <Typography variant="body1" paragraph>
            Whether you need home repairs, tutoring, pet care, or any other service, Local Solutions helps you find
            qualified professionals in your area. We verify all service providers to ensure quality and reliability.
          </Typography>
          <Typography variant="body1" paragraph>
            For service providers, Local Solutions offers a platform to showcase your skills, build your reputation,
            and connect with potential customers in your community.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default About; 