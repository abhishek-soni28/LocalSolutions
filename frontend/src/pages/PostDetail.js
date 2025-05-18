import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Menu,
  MenuItem,
  TextField,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch post details
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);

        // Check if user has liked the post
        if (user && response.data.likedBy) {
          setLiked(response.data.likedBy.some(likedUser => likedUser.id === user.id));
        }

        // Fetch comments
        try {
          const commentsResponse = await api.get(`/posts/${id}/comments`);
          setComments(commentsResponse.data);
        } catch (commentsError) {
          console.error('Error fetching comments:', commentsError);
          // Don't set the main error - we still have the post
          setComments([]);
        }
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError('Failed to load post details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id, user]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/edit-post/${id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (liked) {
        await api.delete(`/posts/${id}/like`);
        setLiked(false);
        setPost(prev => ({
          ...prev,
          likedBy: prev.likedBy.filter(likedUser => likedUser.id !== user.id)
        }));
      } else {
        await api.post(`/posts/${id}/like`);
        setLiked(true);
        setPost(prev => ({
          ...prev,
          likedBy: [...(prev.likedBy || []), user]
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/posts/${id}/comments`, { content: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Posts
        </Button>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Post not found
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Posts
        </Button>
      </Container>
    );
  }

  const isOwner = user?.id === post.user?.id;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Posts
      </Button>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={post.category}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={post.type}
              color="secondary"
              variant="outlined"
            />
            <Chip
              label={post.status}
              color={
                post.status === 'OPEN' ? 'success' :
                post.status === 'IN_PROGRESS' ? 'warning' :
                'default'
              }
            />
          </Box>
          {isOwner && (
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="body1" sx={{ my: 3, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </Typography>

        {post.imageUrl && (
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <img
              src={post.imageUrl}
              alt="Post attachment"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '8px'
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{ width: 32, height: 32, mr: 1 }}
              alt={post.user?.username || 'User'}
            >
              {post.user?.username?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="body2">
              Posted by <strong>{post.user?.username || 'Anonymous'}</strong> • {post.pincode}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleLike} color={liked ? 'primary' : 'default'}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2">
              {post.likedBy?.length || 0}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {comments.length > 0 ? (
          <Box sx={{ mb: 3 }}>
            {comments.map((comment) => (
              <Card key={comment.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{ width: 24, height: 24, mr: 1 }}
                        alt={comment.user?.username || 'User'}
                      >
                        {comment.user?.username?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold">
                        {comment.user?.username || 'Anonymous'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {comment.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        )}

        {user ? (
          <Box component="form" onSubmit={handleCommentSubmit}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
            >
              Log in to comment
            </Button>
          </Box>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default PostDetail;