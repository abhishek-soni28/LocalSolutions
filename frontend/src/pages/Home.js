import React, { useEffect, useState, useCallback } from 'react';
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
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon,
  Search as SearchIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 10;

const Home = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user } = useAuth();
  const { data: posts, loading, error, refetch } = useApi('/posts', { manual: true });
  // Extract the content array from the posts data
  const postItems = posts?.content || [];
  const [sortBy, setSortBy] = useState('date');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'business', label: 'Business' },
    { value: 'community', label: 'Community' },
    { value: 'events', label: 'Events' },
    { value: 'services', label: 'Services' },
  ];

  // Load posts only when search parameters change
  const loadPosts = useCallback(async () => {
    try {
      const params = {
        page: page - 1,
        size: ITEMS_PER_PAGE,
        search: searchTerm,
        category: filter !== 'all' ? filter : undefined,
      };
      await refetch(params);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsInitialLoad(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, filter]);

  // Initial load only - fetch posts once when component mounts
  useEffect(() => {
    loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    loadPosts();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    // Immediately load posts for pagination changes
    loadPosts();
  };

  // We've replaced these with inline functions in the JSX
  // and moved the actual filtering to the Apply button

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };



  if (isInitialLoad || loading) {
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          <Tooltip title="Refresh posts">
            <IconButton
              onClick={handleRefresh}
              color="primary"
              sx={{ ml: 2 }}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
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

      <Box sx={{
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Typography variant="h4">Recent Posts</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            placeholder="Search posts..."
          />
          <FormControl size="small">
            <InputLabel>Filter</InputLabel>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Filter">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="popular">Popular</MenuItem>
              <MenuItem value="recent">Recent</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="likes">Likes</MenuItem>
              <MenuItem value="comments">Comments</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleRefresh}
            disabled={loading}
            size="small"
          >
            Apply
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && (!posts || posts.length === 0) ? (
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
            {Array.isArray(postItems) && postItems.length > 0 ? postItems.map((post) => (
              <Grid item xs={12} key={post.id}>
                <Card
                  key={post.id}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handlePostClick(post)}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Posted by {post.user?.username || 'Anonymous'} • {post.pincode}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {post.status}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )) : <Grid item xs={12}><Typography variant="body1" align="center">No posts found</Typography></Grid>}
          </Grid>

          {posts && posts.totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={posts.totalPages || 1}
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