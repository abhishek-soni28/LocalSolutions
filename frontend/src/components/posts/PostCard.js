import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { deletePost, likePost, unlikePost } from '../../store/slices/postSlice';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth) || { user: null };
  const [anchorEl, setAnchorEl] = React.useState(null);

  if (!post) {
    return null;
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/edit-post/${post.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    dispatch(deletePost(post.id));
    handleMenuClose();
  };

  const handleLike = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (post.liked) {
      dispatch(unlikePost(post.id));
    } else {
      dispatch(likePost(post.id));
    }
  };

  const isOwner = user?.id === post.user?.id;

  return (
    <Card 
      sx={{ 
        maxWidth: '100%', 
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 'bold',
            }}
            onClick={() => post.user?.id && navigate(`/profile/${post.user.id}`)}
          >
            {post.user?.fullName?.charAt(0) || '?'}
          </Box>
        }
        action={
          isOwner && (
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          )
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ 
                cursor: 'pointer',
                fontWeight: 'bold',
                '&:hover': {
                  color: 'primary.main',
                }
              }}
              onClick={() => post.user?.id && navigate(`/profile/${post.user.id}`)}
            >
              {post.user?.fullName || 'Anonymous User'}
            </Typography>
            {post.user?.isBusinessOwner && (
              <Chip
                label="Business"
                size="small"
                color="primary"
                sx={{
                  borderRadius: '14px',
                  fontWeight: 500,
                }}
              />
            )}
          </Box>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
        }
      />
      {post.imageUrl && (
        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
          <CardMedia
            component="img"
            image={post.imageUrl}
            alt={post.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/post/${post.id}`)}
          />
        </Box>
      )}
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            cursor: 'pointer', 
            mb: 1,
            fontWeight: 'bold',
            '&:hover': {
              color: 'primary.main',
            }
          }}
          onClick={() => navigate(`/post/${post.id}`)}
        >
          {post.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            cursor: 'pointer',
            mb: 2,
            lineHeight: 1.6,
          }}
          onClick={() => navigate(`/post/${post.id}`)}
        >
          {post.content}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {post.category && (
            <Chip
              label={post.category}
              size="small"
              sx={{
                borderRadius: '14px',
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: 'primary.main',
                fontWeight: 500,
              }}
            />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, py: 1, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <IconButton 
          aria-label="like" 
          onClick={handleLike}
          sx={{
            color: post.liked ? 'error.main' : 'action.active',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          {post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {post.likes || 0}
        </Typography>
        <IconButton
          aria-label="comment"
          onClick={() => navigate(`/post/${post.id}`)}
          sx={{
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          <CommentIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {post.comments || 0}
        </Typography>
        <IconButton 
          aria-label="share"
          sx={{
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          <ShareIcon />
        </IconButton>
      </CardActions>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            borderRadius: 2,
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default PostCard; 