import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import userReducer from './slices/userSlice';
import searchReducer from './slices/searchSlice';
import analyticsReducer from './slices/analyticsSlice';
import followReducer from './slices/followSlice';
import notificationReducer from './slices/notificationSlice';
import commentReducer from './slices/commentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    users: userReducer,
    search: searchReducer,
    analytics: analyticsReducer,
    follow: followReducer,
    notifications: notificationReducer,
    comments: commentReducer,
  },
});

export default store; 