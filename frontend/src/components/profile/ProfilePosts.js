import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
} from '@mui/material';
import { fetchUserPosts } from '../../store/slices/postSlice';
import PostCard from '../posts/PostCard';

const ITEMS_PER_PAGE = 6;

const ProfilePosts = ({ username }) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const { userPosts, loading, error, totalPages } = useSelector((state) => state.posts);

  useEffect(() => {
    const params = {
      page: page - 1,
      size: ITEMS_PER_PAGE,
      username,
    };
    dispatch(fetchUserPosts(params));
  }, [dispatch, page, username]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!userPosts || userPosts.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No posts yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This user hasn't created any posts yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {userPosts.map((post) => (
          <Grid item xs={12} md={6} key={post.id}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default ProfilePosts; 