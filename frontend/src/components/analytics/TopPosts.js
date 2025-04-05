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
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

const TopPosts = ({ posts }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <List>
      {posts.map((post, index) => (
        <React.Fragment key={post.id}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar
                src={post.imageUrl}
                alt={post.title}
                sx={{ width: 60, height: 60 }}
              >
                {post.title.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" component="div">
                    {post.title}
                  </Typography>
                  <Chip
                    label={`#${index + 1}`}
                    color="primary"
                    size="small"
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
                    sx={{ display: 'block', mb: 1 }}
                  >
                    {post.content.substring(0, 150)}
                    {post.content.length > 150 && '...'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      icon={<VisibilityIcon />}
                      label={`${post.views} views`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<FavoriteIcon />}
                      label={`${post.likes} likes`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<CommentIcon />}
                      label={`${post.comments} comments`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    Posted on {formatDate(post.createdAt)}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
          {index < posts.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default TopPosts; 