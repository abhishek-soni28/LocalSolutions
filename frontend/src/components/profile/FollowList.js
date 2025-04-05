import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import {
  fetchFollowers,
  fetchFollowing,
  followUser,
  unfollowUser,
} from '../../store/slices/followSlice';

const FollowList = ({ userId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { followers, following, loading, error } = useSelector(
    (state) => state.follow
  );
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (userId) {
      dispatch(fetchFollowers(userId));
      dispatch(fetchFollowing(userId));
    }
  }, [dispatch, userId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFollow = async (followUserId) => {
    const isFollowing = following.some((user) => user.id === followUserId);
    if (isFollowing) {
      await dispatch(unfollowUser(followUserId));
    } else {
      await dispatch(followUser(followUserId));
    }
  };

  const renderUserList = (users, isFollowingList) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    if (users.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
          No {isFollowingList ? 'following' : 'followers'} yet
        </Typography>
      );
    }

    return (
      <List>
        {users.map((user, index) => (
          <React.Fragment key={user.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  src={user.profileImage}
                  alt={user.fullName}
                  sx={{ width: 56, height: 56 }}
                >
                  {user.fullName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" component="div">
                      {user.fullName}
                    </Typography>
                    {user.role === 'BUSINESS_OWNER' && (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ ml: 1 }}
                      >
                        Business
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {user.bio || 'No bio yet'}
                  </Typography>
                }
              />
              {user.id !== userId && (
                <Button
                  variant={following.some((u) => u.id === user.id) ? 'outlined' : 'contained'}
                  startIcon={
                    following.some((u) => u.id === user.id) ? (
                      <PersonRemoveIcon />
                    ) : (
                      <PersonAddIcon />
                    )
                  }
                  onClick={() => handleFollow(user.id)}
                  disabled={loading}
                >
                  {following.some((u) => u.id === user.id) ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </ListItem>
            {index < users.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label={`Followers (${followers.length})`} />
        <Tab label={`Following (${following.length})`} />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabValue === 0
          ? renderUserList(followers, false)
          : renderUserList(following, true)}
      </Box>
    </Box>
  );
};

export default FollowList; 