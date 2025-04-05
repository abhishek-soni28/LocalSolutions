import store from '../store/store';
import { addNotification } from '../store/slices/notificationSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.handlers = new Map();
  }

  connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
    this.socket = new WebSocket(`${wsUrl}?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleDisconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'NOTIFICATION':
        store.dispatch(addNotification(data.payload));
        break;
      case 'COMMENT':
        // Handle new comment
        break;
      case 'LIKE':
        // Handle new like
        break;
      default:
        const handler = this.handlers.get(data.type);
        if (handler) {
          handler(data.payload);
        } else {
          console.log('Unknown message type:', data.type);
        }
    }
  }

  handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  addHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  removeHandler(type) {
    this.handlers.delete(type);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.handlers.clear();
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

export const websocketService = new WebSocketService(); 