import React from 'react';
import { Box, Typography, Avatar, Paper, Chip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage as ChatMessageType } from '@/services/socketService';
import MarkdownRenderer from './MarkdownRenderer';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface ChatMessageProps {
  message: ChatMessageType;
  isLastMessage?: boolean;
}

export default function ChatMessage({ message, isLastMessage = false }: ChatMessageProps) {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';
  
  const formattedTime = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : '';
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        mb: 3,
        alignItems: 'flex-start',
        maxWidth: '100%'
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'rgba(18, 18, 22, 0.8)' : 'rgba(30, 30, 35, 0.9)',
          mr: 2,
          mt: 0.5,
          border: isUser ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(245, 204, 127, 0.3)',
          boxShadow: isUser ? '0 2px 10px rgba(0, 0, 0, 0.2)' : '0 0 15px rgba(245, 204, 127, 0.2)',
          color: isUser ? 'white' : 'rgba(245, 204, 127, 0.9)',
          width: 42,
          height: 42,
        }}
      >
        {isUser ? <PersonIcon /> : <SmartToyIcon />}
      </Avatar>
      
      <Box sx={{ maxWidth: 'calc(100% - 60px)' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 0.5 
          }}
        >
          <Typography 
            variant="subtitle1" 
            fontWeight="600" 
            mr={1}
            sx={{
              color: isUser ? 'white' : 'rgba(245, 204, 127, 0.9)',
            }}
          >
            {isUser ? 'You' : 'Aura'}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ opacity: 0.7 }}
          >
            {formattedTime}
          </Typography>
        </Box>
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: isUser 
              ? 'rgba(40, 40, 45, 0.7)' 
              : 'rgba(30, 30, 35, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: isUser 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(245, 204, 127, 0.1)',
            boxShadow: isUser 
              ? '0 4px 15px rgba(0, 0, 0, 0.15)' 
              : '0 2px 20px rgba(0, 0, 0, 0.2)',
            maxWidth: '100%',
            overflowX: 'auto',
            position: 'relative',
            '&::before': isUser ? undefined : {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, rgba(245, 204, 127, 0), rgba(245, 204, 127, 0.2), rgba(245, 204, 127, 0))',
            }
          }}
        >
          <MarkdownRenderer content={content} />
        </Paper>
        
        {isLastMessage && isUser && (
          <Chip 
            size="small"
            label="Seen" 
            sx={{ 
              mt: 1, 
              height: 20, 
              fontSize: '0.625rem',
              background: 'rgba(245, 204, 127, 0.15)',
              color: 'rgba(245, 204, 127, 0.9)',
              border: '1px solid rgba(245, 204, 127, 0.2)',
            }}
          />
        )}
      </Box>
    </Box>
  );
} 