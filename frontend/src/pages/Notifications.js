import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../store/slices/notificationSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading, error } = useSelector(
    (state) => state.notifications
  );
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedNotification, setSelectedNotification] = React.useState(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMenuClick = (event, notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await dispatch(markNotificationAsRead(notification.id));
    }
    navigate(notification.link);
  };

  const handleMarkAsRead = async () => {
    if (selectedNotification) {
      await dispatch(markNotificationAsRead(selectedNotification.id));
      handleMenuClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
  };

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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5">Notifications</Typography>
          {notifications.some((n) => !n.read) && (
            <Button
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
            No notifications
          </Typography>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={notification.sender?.profileImage}
                      alt={notification.sender?.fullName}
                    >
                      {notification.sender?.fullName?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" component="span">
                          {notification.message}
                        </Typography>
                        {!notification.read && (
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{ ml: 1 }}
                          >
                            New
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(notification.createdAt)}
                      </Typography>
                    }
                  />
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuClick(e, notification)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItem>
                {index < notifications.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={handleMarkAsRead}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Mark as read
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default Notifications; 