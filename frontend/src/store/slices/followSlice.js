import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const followUser = createAsyncThunk(
  'follow/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/users/${userId}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'follow/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/users/${userId}/follow`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  'follow/fetchFollowers',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/users/${userId}/followers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  'follow/fetchFollowing',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/users/${userId}/following`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  followers: [],
  following: [],
  loading: false,
  error: null,
};

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {
    clearFollowState: (state) => {
      return initialState;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Follow User
      .addCase(followUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.loading = false;
        state.following.push(action.payload);
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to follow user';
      })
      // Unfollow User
      .addCase(unfollowUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.loading = false;
        state.following = state.following.filter(
          (user) => user.id !== action.payload.id
        );
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to unfollow user';
      })
      // Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch followers';
      })
      // Fetch Following
      .addCase(fetchFollowing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch following';
      });
  },
});

export const { clearFollowState, clearError } = followSlice.actions;
export default followSlice.reducer; 