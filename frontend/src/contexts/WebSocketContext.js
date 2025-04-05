import React, { createContext, useContext, useEffect } from 'react';
import { websocketService } from '../services/websocket';
import { useSelector } from 'react-redux';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      websocketService.connect();
    }

    return () => {
      websocketService.disconnect();
    };
  }, [user]);

  const value = {
    addHandler: websocketService.addHandler.bind(websocketService),
    removeHandler: websocketService.removeHandler.bind(websocketService),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 