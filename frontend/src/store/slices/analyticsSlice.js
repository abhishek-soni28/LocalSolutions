import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchBusinessAnalytics = createAsyncThunk(
  'analytics/fetchBusinessAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/business`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  overview: {
    totalPosts: 0,
    totalViews: 0,
    followers: 0,
    engagementRate: 0,
  },
  engagementData: [],
  topPosts: [],
  recentActivity: [],
  metrics: {
    totalViews: 0,
    previousTotalViews: 0,
    totalLikes: 0,
    previousTotalLikes: 0,
    totalComments: 0,
    previousTotalComments: 0,
    engagementRate: 0,
    previousEngagementRate: 0,
    averageTimeSpent: 0,
    previousAverageTimeSpent: 0,
    bounceRate: 0,
    previousBounceRate: 0,
  },
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      return initialState;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload.overview;
        state.engagementData = action.payload.engagementData;
        state.topPosts = action.payload.topPosts;
        state.recentActivity = action.payload.recentActivity;
        state.metrics = action.payload.metrics;
      })
      .addCase(fetchBusinessAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch analytics data';
      });
  },
});

export const { clearAnalytics, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer; 