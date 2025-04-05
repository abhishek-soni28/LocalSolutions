import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Article as ArticleIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { fetchBusinessAnalytics } from '../store/slices/analyticsSlice';
import AnalyticsChart from '../components/analytics/AnalyticsChart';
import TopPosts from '../components/analytics/TopPosts';
import RecentActivity from '../components/analytics/RecentActivity';
import EngagementMetrics from '../components/analytics/EngagementMetrics';

const BusinessDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    overview,
    engagementData,
    topPosts,
    recentActivity,
    metrics,
    loading,
    error,
  } = useSelector((state) => state.analytics);

  useEffect(() => {
    if (user?.role === 'BUSINESS_OWNER') {
      dispatch(fetchBusinessAnalytics());
    }
  }, [dispatch, user?.role]);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Business Dashboard
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                mr: 2,
              }}
            >
              <ArticleIcon color="primary" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Total Posts
              </Typography>
              <Typography variant="h6">{overview.totalPosts}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'info.light',
                mr: 2,
              }}
            >
              <VisibilityIcon color="info" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Total Views
              </Typography>
              <Typography variant="h6">{overview.totalViews}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'success.light',
                mr: 2,
              }}
            >
              <PeopleIcon color="success" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Followers
              </Typography>
              <Typography variant="h6">{overview.followers}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'warning.light',
                mr: 2,
              }}
            >
              <TrendingUpIcon color="warning" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Engagement Rate
              </Typography>
              <Typography variant="h6">{overview.engagementRate}%</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Engagement Chart */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Engagement Over Time
        </Typography>
        <Box sx={{ height: 400 }}>
          <AnalyticsChart data={engagementData} />
        </Box>
      </Paper>

      {/* Top Posts and Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Posts
            </Typography>
            <TopPosts posts={topPosts} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <RecentActivity activities={recentActivity} />
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Metrics */}
      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Metrics
        </Typography>
        <EngagementMetrics metrics={metrics} />
      </Paper>
    </Container>
  );
};

export default BusinessDashboard; 