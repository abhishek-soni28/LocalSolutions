import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchPosts } from '../store/slices/postSlice';
import PostCard from '../components/posts/PostCard';
import useBackendHealth from '../hooks/useBackendHealth';

const ITEMS_PER_PAGE = 10;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const postState = useSelector((state) => state.posts);
  const { isBackendUp, checkHealth } = useBackendHealth();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'business', label: 'Business' },
    { value: 'community', label: 'Community' },
    { value: 'events', label: 'Events' },
    { value: 'services', label: 'Services' },
  ];

  useEffect(() => {
    const loadPosts = async () => {
      if (isBackendUp) {
        try {
          const params = {
            page: page - 1,
            size: ITEMS_PER_PAGE,
            search: searchQuery,
            category: category !== 'all' ? category : undefined,
          };
          await dispatch(fetchPosts(params)).unwrap();
        } catch (error) {
          console.error('Error fetching posts:', error);
          // Retry backend health check if posts fetch fails
          checkHealth();
        } finally {
          setIsInitialLoad(false);
        }
      }
    };

    loadPosts();
  }, [dispatch, page, searchQuery, category, isBackendUp, checkHealth]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  if (!isBackendUp) {
    return (
      <Container maxWidth="lg">
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            mt: 2,
          }}
          action={
            <Button color="inherit" size="small" onClick={checkHealth}>
              Retry
            </Button>
          }
        >
          Backend service is not running. Please start the backend server or check your connection.
        </Alert>
      </Container>
    );
  }

  if (isInitialLoad || (postState.loading && !postState.posts.length)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            flexShrink: 0,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Local Solutions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-post')}
          sx={{ 
            flexShrink: 0,
            borderRadius: '20px',
            px: 3,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            boxShadow: '0 2px 12px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565c0, #1976d2)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Create Post
        </Button>
      </Box>

      <Paper 
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search posts"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                sx: {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Category"
              variant="outlined"
              value={category}
              onChange={handleCategoryChange}
              InputProps={{
                sx: {
                  borderRadius: '12px',
                }
              }}
            >
              {categories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {postState.error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
          }}
          action={
            <Button color="inherit" size="small" onClick={() => dispatch(fetchPosts())}>
              Retry
            </Button>
          }
        >
          {postState.error}
        </Alert>
      )}

      {!postState.loading && postState.posts.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{
              mb: 1,
              fontWeight: 500,
            }}
          >
            No posts found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or be the first to create a post!
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {postState.posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>

          {postState.totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={postState.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Home; 