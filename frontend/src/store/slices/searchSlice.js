import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const searchPosts = createAsyncThunk(
  'search/searchPosts',
  async ({ query, page, size, category, sort, dateRange }) => {
    const response = await api.get('/posts/search', {
      params: {
        query,
        page,
        size,
        category,
        sort,
        dateRange,
      },
    });
    return response.data;
  }
);

const initialState = {
  results: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    sort: 'newest',
    dateRange: 'all',
  },
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters } = searchSlice.actions;
export default searchSlice.reducer; 