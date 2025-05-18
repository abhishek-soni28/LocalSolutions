import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const Map = () => {
  const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060,
  };

  const containerStyle = {
    width: '100%',
    height: '500px',
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Local Solutions Map
        </Typography>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12}>
            <Marker position={defaultCenter} />
          </GoogleMap>
        </LoadScript>
      </Paper>
    </Container>
  );
};

export default Map; 