import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Button,
  Avatar,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If viewing own profile or 'me' parameter, use current user data
        if ((id === 'me' || id === currentUser?.id) && currentUser) {
          setProfileUser(currentUser);

          // Fetch user's posts
          try {
            const postsResponse = await api.get(`/posts/user/${currentUser.id}`);
            setPosts(postsResponse.data.content || []);
          } catch (postsError) {
            console.error('Error fetching posts:', postsError);
            setPosts([]);
          }
        } else {
          // Fetch user data
          const userResponse = await api.get(`/users/${id}`);
          setProfileUser(userResponse.data);

          // Fetch user's posts
          try {
            const postsResponse = await api.get(`/posts/user/${id}`);
            setPosts(postsResponse.data.content || []);
          } catch (postsError) {
            console.error('Error fetching posts:', postsError);
            setPosts([]);
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, currentUser]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>User not found</Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isBusinessOwner = profileUser.role === 'BUSINESS_OWNER';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              mr: 3,
            }}
          >
            {profileUser.fullName?.charAt(0) || profileUser.username?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {profileUser.fullName || profileUser.username}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              @{profileUser.username}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {profileUser.email}
              </Typography>
            </Box>
          </Box>
          {isOwnProfile && (
            <Button
              variant="outlined"
              sx={{ ml: 'auto' }}
              onClick={() => navigate('/settings')}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Role:</strong> {profileUser.role}
            </Typography>
            {profileUser.pincode && (
              <Typography variant="body1">
                <strong>Pincode:</strong> {profileUser.pincode}
              </Typography>
            )}
          </Grid>
          {isBusinessOwner && (
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <strong>Business Name:</strong> {profileUser.businessName || 'Not specified'}
              </Typography>
              <Typography variant="body1">
                <strong>Business Type:</strong> {profileUser.businessType || 'Not specified'}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Posts" />
          <Tab label="Activity" />
          {isBusinessOwner && <Tab label="Services" />}
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && (
          <>
            {posts.length > 0 ? (
              <Grid container spacing={3}>
                {posts.map((post) => (
                  <Grid item xs={12} key={post.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {post.type} • {post.category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 2 }}>{post.content}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Chip
                            label={post.status}
                            size="small"
                            color={
                              post.status === 'OPEN' ? 'primary' :
                              post.status === 'IN_PROGRESS' ? 'warning' :
                              post.status === 'RESOLVED' ? 'success' : 'default'
                            }
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No posts yet
                </Typography>
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/create-post')}
                  >
                    Create Your First Post
                  </Button>
                )}
              </Box>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Activity history will be available soon
            </Typography>
          </Box>
        )}

        {tabValue === 2 && isBusinessOwner && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Services information will be available soon
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Profile;