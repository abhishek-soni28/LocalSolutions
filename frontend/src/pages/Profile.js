import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfilePosts from '../components/profile/ProfilePosts';
import ProfileSettings from '../components/profile/ProfileSettings';
import BusinessProfile from '../components/profile/BusinessProfile';
import FollowList from '../components/profile/FollowList';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { user: profileUser, loading, error } = useSelector((state) => state.users);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">User not found</Alert>
      </Container>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isBusinessOwner = profileUser.role === 'BUSINESS_OWNER';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <ProfileInfo user={profileUser} isOwnProfile={isOwnProfile} />
          </Paper>
          {isBusinessOwner && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <BusinessProfile user={profileUser} />
            </Paper>
          )}
        </Grid>

        {/* Right Column - Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="Posts" />
              <Tab label="Followers" />
              {isOwnProfile && <Tab label="Settings" />}
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && <ProfilePosts username={username} />}
              {tabValue === 1 && <FollowList userId={profileUser.id} />}
              {tabValue === 2 && isOwnProfile && <ProfileSettings />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 