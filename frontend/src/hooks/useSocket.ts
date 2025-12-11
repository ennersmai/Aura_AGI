import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch } from './useRedux';
import socketService, { ChatMessage, EmotionalState, StreamTokenData, StreamEndData } from '@/services/socketService';
import { addMessage, startStreamingResponse, appendStreamToken, endStreamingResponse } from '@/store/slices/chatSlice';
import { updateEmotionalState } from '@/store/slices/emotionSlice';

export function useSocket() {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  
  // Connect to the socket when the component mounts
  useEffect(() => {
    // Set up event listeners for messages
    const messageUnsubscribe = socketService.onChatMessage((message: ChatMessage) => {
      dispatch(addMessage(message));
    });
    
    const emotionUnsubscribe = socketService.onEmotionUpdate((state: EmotionalState) => {
      dispatch(updateEmotionalState(state));
    });
    
    const streamTokenUnsubscribe = socketService.onStreamToken((data: StreamTokenData) => {
      const token = data.token;
      
      // For the first token, start streaming
      if (!token.startsWith(' ') && token !== '\n' && data.type === 'gemini') {
        dispatch(startStreamingResponse());
      }
      
      // Only append tokens from gemini for chat display
      // (orchestrator and reasoning tokens go to debug panels)
      if (data.type === 'gemini') {
        dispatch(appendStreamToken(token));
      }
    });
    
    const streamEndUnsubscribe = socketService.onStreamEnd((data: StreamEndData) => {
      // End streaming and add the assistant message to the conversation
      if (!data.error && !data.cancelled) {
        dispatch(endStreamingResponse());
      }
    });
    
    // Connection change listener - just update local state
    const connectionChangeUnsubscribe = socketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });
    
    // Cleanup when the component unmounts
    return () => {
      messageUnsubscribe();
      emotionUnsubscribe();
      streamTokenUnsubscribe();
      streamEndUnsubscribe();
      connectionChangeUnsubscribe();
    };
  }, [dispatch]);
  
  // Wrap socket methods with hooks
  const sendMessage = useCallback((message: string, conversationId?: string) => {
    socketService.sendMessage(message, conversationId);
  }, []);
  
  const joinConversation = useCallback((conversationId: string) => {
    socketService.joinConversation(conversationId);
  }, []);
  
  const leaveConversation = useCallback((conversationId: string) => {
    socketService.leaveConversation(conversationId);
  }, []);
  
  const requestMemories = useCallback((query: string, limit: number = 10) => {
    socketService.requestMemories(query, limit);
  }, []);
  
  const requestEmotionalState = useCallback(() => {
    socketService.requestEmotionalState();
  }, []);
  
  const requestReflections = useCallback((limit: number = 5) => {
    socketService.requestReflections(limit);
  }, []);
  
  return {
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    requestMemories,
    requestEmotionalState,
    requestReflections
  };
} 