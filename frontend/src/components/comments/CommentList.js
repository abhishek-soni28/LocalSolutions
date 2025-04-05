import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { createComment, fetchComments } from '../../store/slices/commentSlice';
import Comment from './Comment';

const CommentList = ({ postId }) => {
  const dispatch = useDispatch();
  const { comments, loading, error } = useSelector((state) => state.comments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(createComment({ postId, content: newComment })).unwrap();
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !comments.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Post Comment'}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {comments.length === 0 ? (
        <Typography color="text.secondary" align="center">
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <Box>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentList; 