import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Box,
} from '@mui/material';

const Messages = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'John Doe', content: 'Hello!', timestamp: '2024-04-18T10:00:00' },
    { id: 2, sender: 'Jane Smith', content: 'Hi there!', timestamp: '2024-04-18T10:05:00' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'You',
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage('');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <List sx={{ mb: 2 }}>
          {messages.map(message => (
            <ListItem key={message.id}>
              <ListItemText
                primary={message.sender}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {message.content}
                    </Typography>
                    <br />
                    <Typography component="span" variant="caption" color="text.secondary">
                      {new Date(message.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Messages; 