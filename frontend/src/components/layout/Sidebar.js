import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Create Post', icon: <AddIcon />, path: '/create-post' },
    { text: 'Search', icon: <SearchIcon />, path: '/search' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
  ];

  const businessMenuItems = [
    { text: 'My Business', icon: <BusinessIcon />, path: '/business' },
    { text: 'Analytics', icon: <BusinessIcon />, path: '/analytics' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 40, height: 40 }}>
          {user?.fullName?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{user?.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.isBusinessOwner ? 'Business Owner' : 'User'}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {user?.isBusinessOwner && (
        <>
          <Divider />
          <List>
            {businessMenuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Drawer>
  );
};

export default Sidebar; 