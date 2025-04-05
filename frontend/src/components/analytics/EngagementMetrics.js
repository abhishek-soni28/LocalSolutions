import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';

const EngagementMetrics = ({ metrics }) => {
  const {
    totalViews,
    totalLikes,
    totalComments,
    engagementRate,
    averageTimeSpent,
    bounceRate,
  } = metrics;

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatTime = (minutes) => {
    return `${minutes.toFixed(1)} min`;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Views
          </Typography>
          <Typography variant="h4" color="primary">
            {formatNumber(totalViews)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={75}
            sx={{ mt: 1 }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Likes
          </Typography>
          <Typography variant="h4" color="primary">
            {formatNumber(totalLikes)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={60}
            sx={{ mt: 1 }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Comments
          </Typography>
          <Typography variant="h4" color="primary">
            {formatNumber(totalComments)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={45}
            sx={{ mt: 1 }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Engagement Rate
          </Typography>
          <Typography variant="h4" color="primary">
            {formatPercentage(engagementRate)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={engagementRate * 100}
            sx={{ mt: 1 }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Average Time Spent
          </Typography>
          <Typography variant="h4" color="primary">
            {formatTime(averageTimeSpent)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={70}
            sx={{ mt: 1 }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Bounce Rate
          </Typography>
          <Typography variant="h4" color="primary">
            {formatPercentage(bounceRate)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={bounceRate * 100}
            sx={{ mt: 1 }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EngagementMetrics;

 