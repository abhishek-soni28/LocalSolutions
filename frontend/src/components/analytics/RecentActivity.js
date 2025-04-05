import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const RecentActivity = ({ activities }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'LIKE':
        return <FavoriteIcon color="error" />;
      case 'COMMENT':
        return <CommentIcon color="primary" />;
      case 'FOLLOW':
        return <PersonAddIcon color="success" />;
      case 'VIEW':
        return <VisibilityIcon color="info" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'LIKE':
        return 'error';
      case 'COMMENT':
        return 'primary';
      case 'FOLLOW':
        return 'success';
      case 'VIEW':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <List>
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar
                src={activity.user.profileImage}
                alt={activity.user.username}
                sx={{ bgcolor: `${getActivityColor(activity.type)}.light` }}
              >
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" component="span">
                    {activity.user.fullName}
                  </Typography>
                  <Chip
                    label={activity.type}
                    size="small"
                    color={getActivityColor(activity.type)}
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ display: 'block' }}
                  >
                    {activity.message}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {formatTime(activity.createdAt)}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
          {index < activities.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default RecentActivity; 