import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { likePost, unlikePost } from '../store/slices/postSlice';
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
  InputAdornment,
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
import CategoryFilter from '../components/filters/CategoryFilter';
import SearchWithSuggestions from '../components/search/SearchWithSuggestions';
import ClearFiltersButton from '../components/filters/ClearFiltersButton';

const ITEMS_PER_PAGE = 10;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState(['ALL']);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  console.log('Home: User authenticated:', isAuthenticated, 'User:', user);
  // Use the correct endpoint without the /api prefix since it's already in the baseURL
  const { data: posts, loading, error, refetch } = useApi('/posts', { manual: true });
  // Extract the content array from the posts data
  const allPostItems = posts?.content || [];

  // Filter posts based on selected categories and status
  const postItems = useMemo(() => {
    // Always return all posts from the API response
    // The filtering is now done on the server side via API parameters
    console.log('Filtered posts:', allPostItems);
    console.log('Selected categories:', selectedCategories);
    console.log('Selected status:', selectedStatus);

    // Log the categories of the posts
    const categories = allPostItems.map(post => post.category);
    const uniqueCategories = [...new Set(categories)];
    console.log('Categories in posts:', uniqueCategories);

    // Log the number of posts
    console.log('Number of posts:', allPostItems.length);

    return allPostItems;
  }, [allPostItems, selectedCategories, selectedStatus]);

  const [sortBy, setSortBy] = useState('date');
  const searchTimeout = useRef(null);

  // Calculate category and status counts from all posts
  const categoryCounts = useMemo(() => {
    const counts = {};
    allPostItems.forEach(post => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    });
    return counts;
  }, [allPostItems]);

  const statusCounts = useMemo(() => {
    const counts = {};
    allPostItems.forEach(post => {
      if (post.status) {
        counts[post.status] = (counts[post.status] || 0) + 1;
      }
    });
    return counts;
  }, [allPostItems]);

  // Handle search term change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle search execution
  const handleSearch = (term) => {
    // Save to recent searches if not already there
    if (term && term.trim() && !recentSearches.includes(term)) {
      setRecentSearches(prev => [term, ...prev.slice(0, 4)]);
    }
    // Reset to page 1 when searching
    setPage(1);
    loadPosts();
  };

  // Load posts only when search parameters change
  const loadPosts = useCallback(async () => {
    try {
      setSearchLoading(true);
      const params = {
        page: page - 1,
        size: ITEMS_PER_PAGE,
        search: searchTerm,
        // Don't send categories parameter if ALL is selected
        ...(selectedCategories.includes('ALL') ? {} : {
          categories: selectedCategories.join(','),
          // Also send as individual category for debugging
          category: selectedCategories.length === 1 ? selectedCategories[0] : undefined
        }),
        // Don't send status parameter if ALL is selected
        ...(selectedStatus === 'ALL' ? {} : { status: selectedStatus }),
        sortBy: sortBy
      };

      console.log('Sending params to API:', JSON.stringify(params));
      console.log('Fetching posts with params:', params);
      console.log('Selected categories before fetch:', selectedCategories);
      console.log('Selected status before fetch:', selectedStatus);

      // Add a delay to make sure the backend has time to process the request
      await new Promise(resolve => setTimeout(resolve, 100));

      // For debugging, make a direct call to check all posts
      try {
        console.log('Checking all posts directly');
        const allPostsResponse = await api.get('/posts/debug/all');
        console.log('All posts in database:', allPostsResponse.data);
      } catch (error) {
        console.error('Error checking all posts:', error);
      }

      // For debugging, make a direct call to check posts by category
      if (selectedCategories.length === 1 && !selectedCategories.includes('ALL')) {
        try {
          const category = selectedCategories[0];
          console.log(`Checking posts with category ${category} directly`);
          const response = await api.get(`/posts/debug/category/${category}`);
          console.log(`Direct check for category ${category}:`, response.data);
        } catch (error) {
          console.error('Error checking posts by category:', error);
        }
      }

      const result = await refetch(params);
      console.log('API response result:', result);
      console.log('API response:', result);
      console.log('Posts data:', posts);

      // Log the categories of the returned posts
      if (result && result.content) {
        const categories = result.content.map(post => post.category);
        const uniqueCategories = [...new Set(categories)];
        console.log('Categories in returned posts:', uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsInitialLoad(false);
      setSearchLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, selectedCategories, selectedStatus, sortBy]);

  // Handle manual refresh
  const handleRefresh = () => {
    setPage(1);
    loadPosts();
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    loadPosts();
  };

  // Load posts on initial render
  useEffect(() => {
    console.log('Initial load of posts');
    loadPosts();

    // Add event listener for filter changes
    const handleFilterChange = () => {
      console.log('Filter changed event received');
      loadPosts();
    };

    window.addEventListener('filter-changed', handleFilterChange);

    // Clean up
    return () => {
      window.removeEventListener('filter-changed', handleFilterChange);
    };
  }, []);

  // Reload posts when filters change
  useEffect(() => {
    if (!isInitialLoad) {
      console.log('Filters changed - selectedCategories:', selectedCategories, 'selectedStatus:', selectedStatus);
      console.log('Is selectedCategories an array?', Array.isArray(selectedCategories));
      console.log('Length of selectedCategories:', selectedCategories.length);
      // Reset to page 1 when filters change
      setPage(1);
      // Force a small delay to ensure state is updated
      setTimeout(() => {
        loadPosts();
      }, 0);
    }
  }, [selectedCategories, selectedStatus, sortBy]);

  // Handle create post button click
  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['plumbing', 'electrical', 'cleaning']);
  const [popularSearches, setPopularSearches] = useState(['home repair', 'gardening', 'painting', 'moving', 'furniture']);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <Box sx={{ flexGrow: 1 }}>
            <SearchWithSuggestions
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Search posts..."
              recentSearches={recentSearches}
              popularSearches={popularSearches}
              loading={searchLoading}
            />
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                // Apply sort immediately
                setTimeout(() => loadPosts(), 0);
              }}
              label="Sort By"
            >
              <MenuItem value="date">Most Recent</MenuItem>
              <MenuItem value="likes">Most Liked</MenuItem>
              <MenuItem value="comments">Most Commented</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Category and Status Filter Section */}
      <Box sx={{ position: 'relative', mb: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" fontWeight="medium" color="text.primary">
            Filter Posts
          </Typography>

          {/* Clear Filters Button */}
          <ClearFiltersButton
            selectedCategories={selectedCategories}
            selectedStatus={selectedStatus}
            setSelectedCategories={setSelectedCategories}
            setSelectedStatus={setSelectedStatus}
          />
        </Box>

        <CategoryFilter
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          categoryCounts={categoryCounts}
          statusCounts={statusCounts}
        />
      </Box>

      {loading && isInitialLoad ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : !Array.isArray(postItems) || postItems.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
            {(!selectedCategories.includes('ALL') || selectedCategories.length > 1 || selectedStatus !== 'ALL') ?
              `No posts found with the selected filters` :
              `No posts found`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(!selectedCategories.includes('ALL') || selectedCategories.length > 1 || selectedStatus !== 'ALL') ? (
              <>Try adjusting your filters or <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => {
                  setSelectedCategories(['ALL']);
                  setSelectedStatus('ALL');
                }}
              >clear all filters</Button></>
            ) : (
              <>Try adjusting your search criteria or be the first to create a post!</>
            )}
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {postItems.map((post) => (
              <Grid item xs={12} key={post.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {post.authorName || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(post.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Chip
                          label={post.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={post.status}
                          size="small"
                          color={
                            post.status === 'OPEN'
                              ? 'success'
                              : post.status === 'IN_PROGRESS'
                              ? 'warning'
                              : post.status === 'RESOLVED'
                              ? 'info'
                              : 'default'
                          }
                        />
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {post.content}
                    </Typography>
                    {post.imageUrl && (
                      <Box
                        component="img"
                        src={post.imageUrl}
                        alt="Post"
                        sx={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'cover',
                          borderRadius: 1,
                          mb: 2,
                        }}
                      />
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          color={post.liked ? "primary" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Like button clicked, user:', user, 'isAuthenticated:', isAuthenticated);
                            if (!isAuthenticated || !user) {
                              console.log('User not authenticated, redirecting to login');
                              navigate('/login');
                              return;
                            }
                            if (post.liked) {
                              console.log('Post already liked, unliking post:', post.id);
                              dispatch(unlikePost(post.id));
                            } else {
                              console.log('Post not liked, liking post:', post.id);
                              dispatch(likePost(post.id));
                            }
                          }}
                        >
                          {post.liked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpIcon fontSize="small" color="action" />}
                        </IconButton>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          {post.likedBy?.length || post.likeCount || 0}
                        </Typography>
                        <IconButton size="small" color="primary">
                          <CommentIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2">
                          {post.comments?.length || post.commentCount || 0}
                        </Typography>
                      </Box>
                      <Tooltip title="View Details">
                        <Button
                          size="small"
                          variant="text"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/post/${post.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {posts?.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={posts.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <Tooltip title="Create Post">
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreatePost}
            sx={{
              borderRadius: 28,
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
              },
            }}
          >
            Create Post
          </Button>
        </Tooltip>
      </Box>
    </Container>
  );
};

export default Home;
