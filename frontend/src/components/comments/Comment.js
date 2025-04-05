import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
  Avatar,
  Paper,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { deleteComment, updateComment } from '../../store/slices/commentSlice';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    dispatch(deleteComment(comment.id));
    handleMenuClose();
  };

  const handleSave = () => {
    dispatch(updateComment({ commentId: comment.id, content: editedContent }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const isOwner = user?.id === comment.user.id;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate(`/profile/${comment.user.id}`)}
        >
          {comment.user.fullName.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${comment.user.id}`)}
              >
                {comment.user.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
            {isOwner && (
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>

          {isEditing ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mt: 1 }}>
              {comment.content}
            </Typography>
          )}
        </Box>
      </Box>

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
    </Paper>
  );
};

export default Comment; 