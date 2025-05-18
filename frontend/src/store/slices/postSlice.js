import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPosts = createAsyncThunk(
  'post/fetchPosts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/posts', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPost = createAsyncThunk(
  'post/fetchPost',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/posts/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'post/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/posts', postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'post/updatePost',
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/posts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const likePost = createAsyncThunk(
  'post/likePost',
  async (id, { rejectWithValue }) => {
    try {
      console.log('likePost: Liking post with ID:', id);
      // The api instance already has the /api prefix
      const response = await api.post(`/posts/${id}/likes`);
      console.log('likePost: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('likePost: Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const unlikePost = createAsyncThunk(
  'post/unlikePost',
  async (id, { rejectWithValue }) => {
    try {
      console.log('unlikePost: Unliking post with ID:', id);
      // The api instance already has the /api prefix
      const response = await api.delete(`/posts/${id}/likes`);
      console.log('unlikePost: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('unlikePost: Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike post');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'post/fetchUserPosts',
  async ({ username, params }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/posts/user/${username}`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  userPosts: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 0,
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Post
      .addCase(fetchPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload.id);
        if (post) {
          post.likeCount = action.payload.likeCount;
          post.liked = true;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost.likeCount = action.payload.likeCount;
          state.currentPost.liked = true;
        }
      })
      // Unlike Post
      .addCase(unlikePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload.id);
        if (post) {
          post.likeCount = action.payload.likeCount;
          post.liked = false;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost.likeCount = action.payload.likeCount;
          state.currentPost.liked = false;
        }
      })
      // Fetch User Posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.userPosts = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentPost } = postSlice.actions;
export default postSlice.reducer;