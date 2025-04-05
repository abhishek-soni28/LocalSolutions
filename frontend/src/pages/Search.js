import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  TextField,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { debounce } from 'lodash';
import { searchPosts, setFilters, clearFilters } from '../store/slices/searchSlice';
import PostCard from '../components/posts/PostCard';

const ITEMS_PER_PAGE = 12;

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'business', label: 'Business' },
  { value: 'community', label: 'Community' },
  { value: 'events', label: 'Events' },
  { value: 'services', label: 'Services' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'most_commented', label: 'Most Commented' },
];

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

const Search = () => {
  const dispatch = useDispatch();
  const { results, loading, error, filters } = useSelector((state) => state.search);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce((query) => {
      dispatch(
        searchPosts({
          query,
          page: page - 1,
          size: ITEMS_PER_PAGE,
          ...filters,
        })
      );
    }, 500),
    [dispatch, page, filters]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    dispatch(setFilters({ [name]: value }));
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    dispatch(clearFilters());
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                label="Sort By"
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                label="Date Range"
              >
                {dateRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {(searchQuery || Object.values(filters).some((value) => value !== '')) && (
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            sx={{ mt: 2 }}
          >
            Clear Search
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : results.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary">
          No posts found. Try adjusting your search criteria.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {results.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>

          {results.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(results.length / ITEMS_PER_PAGE)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Search; 