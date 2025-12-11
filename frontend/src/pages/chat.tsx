import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  Divider,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Fab,
  Button,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Container,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import { useSocket } from '@/hooks/useSocket';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { 
  fetchConversations as fetchConversationsAction, 
  setActiveConversation, 
  addMessage, 
  startStreamingResponse, 
  appendStreamToken, 
  endStreamingResponse, 
  clearMessages, 
  fetchMessages 
} from '@/store/slices/chatSlice';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import DebugPanel from '@/components/debug/DebugPanel';
import { useSettings } from '@/contexts/SettingsContext';
import socketService, { StreamTokenData } from '@/services/socketService';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { apiService, Conversation } from '@/services/apiService';
import ChatIcon from '@mui/icons-material/Chat';
import BugReportIcon from '@mui/icons-material/BugReport';
import ServerStatusAlert from '@/components/common/ServerStatusAlert';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ParticlesBackground } from '@/components/animation/ParticlesBackground';
import EditIcon from '@mui/icons-material/Edit';
import StreamingVisualizer from '../components/debug/StreamingVisualizer';
import PsychologyIcon from '@mui/icons-material/Psychology';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Left sidebar content component
const ConversationsList = ({ onNewChat }: { onNewChat: () => void }) => {
  const conversations = useAppSelector(state => state.chat.conversations);
  const activeConversationId = useAppSelector(state => state.chat.activeConversationId);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [localConversations, setLocalConversations] = useState<Conversation[]>([]);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    conversationId: string;
  } | null>(null);
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    conversationId: string;
    title: string;
  } | null>(null);
  
  // Rename dialog state
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    conversationId: string;
    title: string;
  } | null>(null);
  
  // For rename input
  const [newTitle, setNewTitle] = useState('');
  
  // Extract conversation ID from router
  const routeConversationId = router.query.id as string;
  
  // Fetch conversations - improved with direct API call as backup
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        
        // Attempt to fetch via Redux
        await dispatch(fetchConversationsAction());
        
        // As a backup, also fetch directly from API to ensure we have data
        // This helps when Redux store might not be properly updated
        const directFetchedConversations = await apiService.getConversations();
        
        if (directFetchedConversations && directFetchedConversations.length > 0) {
          setLocalConversations(directFetchedConversations);
          
          // If we have a routeConversationId but no active conversation, set it
          if (routeConversationId && !activeConversationId) {
            dispatch(setActiveConversation(routeConversationId));
            
            // Also fetch messages for this conversation
            dispatch(fetchMessages(routeConversationId));
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        setIsLoading(false);
      }
    };
    
    fetchConversations();
    
    // Setup interval to periodically refresh conversations
    const intervalId = setInterval(() => {
      dispatch(fetchConversationsAction());
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [dispatch, routeConversationId, activeConversationId]);
  
  // Combine Redux conversations with locally fetched ones
  const allConversations = useMemo(() => {
    // Create a map to deduplicate conversations by ID
    const conversationsMap = new Map();
    
    // Add Redux store conversations
    if (Array.isArray(conversations)) {
      conversations.forEach(conv => {
        if (conv && conv.id) {
          conversationsMap.set(conv.id, {
            ...conv,
            _key: `redux_${conv.id}` // Add unique key prefix
          });
        }
      });
    }
    
    // Add locally fetched conversations
    if (Array.isArray(localConversations)) {
      localConversations.forEach(conv => {
        if (conv && conv.id) {
          // Only add if not already present or replace with newer data
          if (!conversationsMap.has(conv.id) || 
              new Date(conv.updated_at || conv.created_at) > 
              new Date(conversationsMap.get(conv.id).updated_at || conversationsMap.get(conv.id).created_at)) {
            conversationsMap.set(conv.id, {
              ...conv,
              _key: `local_${conv.id}` // Add unique key prefix
            });
          }
        }
      });
    }
    
    // Convert map back to array and sort by most recent
    return Array.from(conversationsMap.values())
      .sort((a, b) => {
        // Try to sort by updated_at timestamp if available
        const aTime = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at).getTime();
        const bTime = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at).getTime();
        return bTime - aTime;
      });
  }, [conversations, localConversations]);
  
  // Right-click context menu handlers
  const handleContextMenu = (event: React.MouseEvent, conversationId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      conversationId
    });
  };
  
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  const handleDeleteOption = () => {
    if (contextMenu) {
      // Find the conversation title
      const conversation = allConversations.find(conv => conv.id === contextMenu.conversationId);
      const title = conversation?.title || "Untitled Conversation";
      
      // Open the confirmation dialog
      setDeleteDialog({
        open: true,
        conversationId: contextMenu.conversationId,
        title
      });
      
      // Close the context menu
      handleCloseContextMenu();
    }
  };
  
  const handleRenameOption = () => {
    if (contextMenu) {
      // Find the conversation title
      const conversation = allConversations.find(conv => conv.id === contextMenu.conversationId);
      const title = conversation?.title || "Untitled Conversation";
      
      // Set the initial value for the rename input
      setNewTitle(title);
      
      // Open the rename dialog
      setRenameDialog({
        open: true,
        conversationId: contextMenu.conversationId,
        title
      });
      
      // Close the context menu
      handleCloseContextMenu();
    }
  };
  
  const handleConfirmDelete = async () => {
    if (deleteDialog) {
      try {
        // Delete the conversation using the API
        await apiService.deleteConversation(deleteDialog.conversationId);
        
        // If the deleted conversation is the active one, navigate to a new conversation
        if (deleteDialog.conversationId === activeConversationId) {
          dispatch(clearMessages());
          router.push('/chat', undefined, { shallow: true });
        }
        
        // Refresh the conversations list
        dispatch(fetchConversationsAction());
        
        // As a backup, also fetch directly from API
        const updatedConversations = await apiService.getConversations();
        setLocalConversations(updatedConversations);
        
        console.log(`Conversation deleted: ${deleteDialog.conversationId}`);
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
      
      // Close the dialog
      setDeleteDialog(null);
    }
  };
  
  const handleConfirmRename = async () => {
    if (renameDialog && newTitle.trim()) {
      try {
        // Update the conversation title using the API
        await apiService.updateConversation(renameDialog.conversationId, { title: newTitle.trim() });
        
        // Refresh the conversations list
        dispatch(fetchConversationsAction());
        
        // As a backup, also fetch directly from API
        const updatedConversations = await apiService.getConversations();
        setLocalConversations(updatedConversations);
        
        console.log(`Conversation renamed: ${renameDialog.conversationId} to "${newTitle}"`);
      } catch (error) {
        console.error("Failed to rename conversation:", error);
      }
      
      // Close the dialog
      setRenameDialog(null);
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteDialog(null);
  };
  
  const handleCancelRename = () => {
    setRenameDialog(null);
  };
  
  const handleSelectConversation = (id: string) => {
    if (!id) {
      console.error("Cannot select conversation: ID is empty");
      return;
    }
    
    console.log(`Selecting conversation: ${id}`);
    
    try {
      // Clear messages before loading new conversation
      dispatch(clearMessages());
      
      // Set active conversation immediately so UI updates
      dispatch(setActiveConversation(id));
      
      // Update URL - this happens synchronously
      router.push(`/chat?id=${id}`, undefined, { shallow: true });
      
      // Fetch messages for this conversation - happens asynchronously
      dispatch(fetchMessages(id))
        .unwrap()
        .then(messages => {
          console.log(`Loaded ${messages.length} messages for conversation ${id}`);
        })
        .catch(error => {
          console.error(`Error loading messages: ${error}`);
          alert(`Failed to load messages: ${error}`);
        });
    } catch (error) {
      console.error("Error selecting conversation:", error);
    }
  };

  useEffect(() => {
    // If there's a route conversation ID but it's not active in Redux, set it
    if (routeConversationId && routeConversationId !== activeConversationId) {
      console.log(`Setting active conversation from URL: ${routeConversationId}`);
      dispatch(setActiveConversation(routeConversationId));
      
      // Also fetch messages for this conversation
      dispatch(fetchMessages(routeConversationId));
    }
  }, [routeConversationId, activeConversationId, dispatch]);

  return (
    <Box sx={{ width: '100%', maxWidth: 360 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2 
      }}>
        <Typography variant="h6">Conversations</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={onNewChat}
          size="small"
        >
          New Chat
        </Button>
      </Box>
      <Divider />
      
      {isLoading && allConversations.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : allConversations.length > 0 ? (
        <List>
          {allConversations.map(conversation => (
            <ListItemButton 
              key={conversation._key || `conv-${conversation.id}-${Date.now().toString(36)}`}
              selected={conversation.id === activeConversationId}
              onClick={() => handleSelectConversation(conversation.id)}
              onContextMenu={(e) => handleContextMenu(e, conversation.id)}
              sx={{
                borderRadius: 1,
                my: 0.5,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.dark',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  }
                }
              }}
            >
              <ListItemIcon>
                <ChatIcon color={conversation.id === activeConversationId ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText 
                primary={conversation.title || "New Conversation"} 
                secondary={conversation.last_message || "No messages yet"}
                sx={{
                  '& .MuiListItemText-primary': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: conversation.id === activeConversationId ? 'bold' : 'normal'
                  },
                  '& .MuiListItemText-secondary': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.75rem'  // Equivalent to 'caption' variant
                  }
                }}
              />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">No conversations yet</Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={onNewChat}
            sx={{ mt: 2 }}
          >
            Start a new chat
          </Button>
        </Box>
      )}
      
      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleRenameOption}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename conversation</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteOption}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete conversation</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog !== null}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Delete conversation?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{deleteDialog?.title}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename Dialog */}
      <Dialog
        open={renameDialog !== null}
        onClose={handleCancelRename}
      >
        <DialogTitle>Rename conversation</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter a new name for this conversation.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Conversation Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            inputProps={{ maxLength: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRename}>Cancel</Button>
          <Button 
            onClick={handleConfirmRename} 
            color="primary" 
            variant="contained"
            disabled={!newTitle.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// FAISS activity indicator component
const FAISSActivityIndicator = () => {
  const [active, setActive] = useState(false);
  
  // Listen for FAISS activity events from the server
  useEffect(() => {
    const handleFAISSActivity = (data: { active: boolean }) => {
      setActive(data.active);
      
      // Auto-reset after 3 seconds if active
      if (data.active) {
        setTimeout(() => setActive(false), 3000);
      }
    };
    
    const unsubscribe = socketService.onFAISSActivity(handleFAISSActivity);
    return unsubscribe;
  }, []);
  
  if (!active) return null;
  
  return (
    <Box sx={{ 
      position: 'fixed',
      top: 70,
      right: 20,
      zIndex: 1500,
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(18, 18, 22, 0.85)',
      backdropFilter: 'blur(15px)',
      borderRadius: '12px',
      padding: '6px 12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    }}>
      <Box sx={{ 
        width: 12, 
        height: 12, 
        borderRadius: '50%',
        bgcolor: '#4CAF50',
        mr: 1,
        animation: 'pulse 1.5s infinite',
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.4 },
          '100%': { opacity: 1 },
        }
      }} />
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        FAISS Search Active
      </Typography>
    </Box>
  );
};

// Enhanced Agent Info Panel with IDs and memory debug
const AgentInfoPanel = () => {
  const { debugOptions } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [agentState, setAgentState] = useState({
    agentId: '',
    name: '',
    lastActivity: '',
    isLoading: false,
    error: '',
    emotions: {
      joy: 0.7,
      trust: 0.8,
      fear: 0.1,
      surprise: 0.3,
      sadness: 0.2,
      disgust: 0.1,
      anger: 0.1,
      anticipation: 0.6
    },
    memories: 0,
    reflections: 0,
    lastMemoryAccess: '',
    memoryErrors: [] as string[] // Explicitly typing memoryErrors as string array
  });
  
  // Get conversation ID from router
  const router = useRouter();
  const conversationId = router.query.id as string;
  
  // Store the last fetched agent ID to avoid redundant fetching
  const lastFetchedAgentId = useRef('');
  
  // Fetch agent state on mount and when conversation changes
  useEffect(() => {
    if (!conversationId) return;
    
    let isMounted = true;
    const fetchAgentState = async () => {
      // Don't update isLoading state during the fetch process to avoid re-renders
      if (isMounted) {
        setIsLoading(true);
      }
      
      try {
        // Fetch conversation details to get agent ID
        const conversation = await apiService.getConversation(conversationId);
        
        if (!conversation || !conversation.agent_id) {
          if (isMounted) {
            setAgentState(prev => ({
              ...prev,
              agentId: 'unknown',
              name: 'No agent assigned',
              lastActivity: '',
              isLoading: false,
              error: 'No agent ID found for this conversation',
              memoryErrors: [] as string[]
            }));
            setIsLoading(false);
          }
          return;
        }
        
        const agentId = conversation.agent_id;
        
        // Skip fetching if the agent ID hasn't changed
        if (agentId === lastFetchedAgentId.current) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }
        
        lastFetchedAgentId.current = agentId;
        
        // Now fetch the agent details and memory stats if we have an agent ID
        let memories = 0;
        const memoryErrors: string[] = []; // Explicitly typing memoryErrors as string array
        let lastMemoryAccess = '';
        
        if (agentId && agentId !== 'unknown') {
          try {
            const memoryStats = await apiService.getAgentMemoryStats(agentId);
            memories = memoryStats.count || 0;
            lastMemoryAccess = memoryStats.last_access || 'Never';
          } catch (error) {
            console.error("Failed to fetch memory stats:", error);
            memoryErrors.push(`Failed to fetch memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Fetch the agent details if needed
        const agent = await apiService.getAgent(agentId);
        
        if (isMounted) {
          setAgentState(prev => ({
            ...prev,
            agentId,
            name: agent?.name || 'Unnamed Agent',
            lastActivity: new Date().toISOString(),
            isLoading: false,
            error: '',
            // Keep emotions from previous state
            memories,
            reflections: 0,
            lastMemoryAccess,
            memoryErrors
          }));
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch conversation or agent info:", error);
          setAgentState(prev => ({
            ...prev,
            isLoading: false,
            error: `Error: ${error instanceof Error ? error.message : 'Failed to load agent info'}`
          }));
          setIsLoading(false);
        }
      }
    };
    
    fetchAgentState();
    
    // Refresh less frequently to avoid excessive API calls
    const intervalId = setInterval(fetchAgentState, 30000); // Every 30 seconds instead of 15
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [conversationId]); // Only re-run when conversation ID changes
  
  // Listen for memory and emotion update events
  useEffect(() => {
    if (!conversationId || !agentState.agentId) return;
    
    // Define an inline type for memories
    interface Memory {
      agent_id?: string;
      conversation_id?: string;
      id?: string;
    }
    
    const handleMemoryUpdate = (memories: Memory[]) => {
      // If we received memories for the current conversation, update the count
      if (memories.some(memory => memory.agent_id === agentState.agentId)) {
        setAgentState(prev => ({
          ...prev,
          memories: (prev.memories || 0) + 1,
          lastMemoryAccess: new Date().toISOString()
        }));
      }
    };
    
    const handleEmotionUpdate = (data: {
      conversation_id?: string;
      agent_id?: string;
      emotions?: Record<string, number>;
    }) => {
      if (data.conversation_id === conversationId || data.agent_id === agentState.agentId) {
        setAgentState(prev => ({
          ...prev,
          emotions: {
            ...prev.emotions,
            ...data.emotions
          }
        }));
      }
    };
    
    // Subscribe to memory and emotion events
    const memoryUnsubscribe = socketService.onMemoryUpdate(handleMemoryUpdate);
    const emotionUnsubscribe = socketService.onEmotionUpdate(handleEmotionUpdate);
    
    return () => {
      memoryUnsubscribe();
      emotionUnsubscribe();
    };
  }, [conversationId, agentState.agentId]); // Only dependencies that matter
  
  // Get top emotions
  const topEmotions = Object.entries(agentState.emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Agent Status</Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          {/* ID Debug Information */}
          <Box sx={{ mb: 3, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Debug IDs</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ 
                fontFamily: 'monospace', 
                display: 'block',
                wordBreak: 'break-all' 
              }}>
                <strong>Agent:</strong> {agentState.agentId || 'None'}
              </Typography>
              <Typography sx={{ 
                fontSize: '0.75rem', 
                color: 'text.secondary',
                wordBreak: 'break-all' 
              }}>
                <strong>Conversation:</strong> {conversationId || 'None'}
              </Typography>
            </Box>
          </Box>
          
          {debugOptions.showEmotions && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Emotional State</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {topEmotions.map(([emotion, value]) => (
                  <Paper
                    key={emotion}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 4,
                      backgroundColor: `rgba(0, 127, 255, ${value.toFixed(1)})`,
                      color: 'white'
                    }}
                  >
                    <Typography variant="caption">
                      {emotion}: {(value * 100).toFixed(0)}%
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
          
          {/* Memory Debugging Information */}
          <Box sx={{ mb: 3, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Memory Stats</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2">
                <strong>Memories:</strong> {agentState.memories || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Last Access:</strong> {agentState.lastMemoryAccess ? 
                  new Date(agentState.lastMemoryAccess).toLocaleString() : 'Never'}
              </Typography>
              
              {agentState.memoryErrors.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="error">Memory Errors:</Typography>
                  <Box sx={{ 
                    maxHeight: '100px', 
                    overflowY: 'auto', 
                    bgcolor: 'error.light', 
                    p: 1, 
                    borderRadius: 1,
                    opacity: 0.9
                  }}>
                    {agentState.memoryErrors.map((error, index) => (
                      <Typography key={index} variant="caption" sx={{ display: 'block', color: 'white' }}>
                        {error}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
          
          {/* Memory Debug Actions */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Debug Actions</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={async () => {
                  try {
                    await apiService.initializeMemoryForAgent(agentState.agentId);
                    setAgentState(prev => ({
                      ...prev,
                      memoryErrors: []
                    }));
                  } catch (error) {
                    setAgentState(prev => ({
                      ...prev,
                      memoryErrors: [...prev.memoryErrors, `Failed to initialize memory: ${error instanceof Error ? error.message : 'Unknown error'}`]
                    }));
                  }
                }}
              >
                Initialize Memory
              </Button>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={async () => {
                  try {
                    // Refresh memory stats
                    const memoryStats = await apiService.getAgentMemoryStats(agentState.agentId);
                    setAgentState(prev => ({
                      ...prev,
                      memories: memoryStats.count || 0,
                      lastMemoryAccess: memoryStats.last_access || prev.lastMemoryAccess
                    }));
                  } catch (error) {
                    setAgentState(prev => ({
                      ...prev,
                      memoryErrors: [...prev.memoryErrors, `Failed to refresh: ${error instanceof Error ? error.message : 'Unknown error'}`]
                    }));
                  }
                }}
              >
                Refresh Stats
              </Button>
            </Box>
          </Box>
          
          {debugOptions.showReflections && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Reflections</Typography>
              <Typography variant="body2">{agentState.reflections} insights generated</Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

// Define message type to replace any
interface Message {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  conversationId: string;
}

// Add this new component that will display model thinking in chat
interface ModelThinkingDisplayProps {
  visible: boolean;
  activeTabIndex?: number;
}

const ModelThinkingDisplay = ({ visible, activeTabIndex = 0 }: ModelThinkingDisplayProps) => {
  const { debugStreams } = useSettings();
  const [activeTab, setActiveTab] = useState(activeTabIndex);
  
  if (!visible) return null;
  
  const streamTypes = ['orchestrator', 'reasoning', 'gemini'] as const;
  const streamContent = debugStreams[streamTypes[activeTab]];
  
  return (
    <Box sx={{ 
      position: 'absolute', 
      bottom: '80px', 
      left: 0, 
      right: 0, 
      zIndex: 10,
      maxHeight: '40vh',
      overflow: 'auto',
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Memory Retrieval" />
          <Tab label="Reasoning" />
          <Tab label="Gemini" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <StreamingVisualizer content={streamContent} height="100%" showRawOutput={true} />
      </Box>
    </Box>
  );
};

export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const conversationId = router.query.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add a ref to track if we've already joined this conversation
  const hasJoinedConversation = useRef<string | null>(null);
  
  // Create one-time initialization flag
  const isInitialMount = useRef(true);
  
  const { 
    sendMessage, 
    joinConversation, 
    isConnected
  } = useSocket();
  
  const dispatch = useAppDispatch();
  const { 
    messages, 
    isLoading, 
    streamingResponse, 
    streamedContent,
    activeConversationId
  } = useAppSelector(state => ({
    messages: Array.isArray(state.chat.messages) ? state.chat.messages : [],
    isLoading: state.chat.isLoading,
    streamingResponse: state.chat.streamingResponse,
    streamedContent: state.chat.streamedContent,
    activeConversationId: state.chat.activeConversationId
  }));
  const { isDebugPanelOpen, toggleDebugPanel, updateDebugStream, debugStreams, debugOptions, updateDebugOption } = useSettings();
  
  // Set default to true for non-mobile, so it's open by default
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(!isMobile);
  
  // Helper function to fetch and join a conversation - wrap in useCallback
  const fetchAndJoinConversation = useCallback((id: string) => {
    if (!id || !isConnected) return;
    
    console.log(`Manually fetching and joining conversation: ${id}`);
    
    // Only clear if we're changing conversations
    if (activeConversationId !== id) {
      dispatch(clearMessages());
    }
    
    // Set as active conversation
    dispatch(setActiveConversation(id));
    
    // Join via socket
    joinConversation(id);
    
    // First try to get the conversation details to ensure it exists
    apiService.getConversation(id)
      .then(conversation => {
        console.log(`Successfully loaded conversation: ${conversation.title}`);
        
        // Fetch messages with a small delay to ensure socket connection is ready
        setTimeout(() => {
          dispatch(fetchMessages(id));
        }, 200);
      })
      .catch((error: Error) => {
        console.error(`Failed to load conversation ${id}:`, error);
        // If we can't load the conversation, try to navigate to home
        if (router.pathname === '/chat') {
          router.push('/chat', undefined, { shallow: true });
        }
      });
  }, [isConnected, activeConversationId, dispatch, joinConversation, router]);
  
  // Join conversation when ID changes - fixed to prevent infinite loops
  useEffect(() => {
    // Only join if we have both a conversationId and the socket is connected
    // And only if we haven't already joined this conversation
    if (conversationId && isConnected && hasJoinedConversation.current !== conversationId) {
      console.log(`Joining conversation: ${conversationId}`);
      
      // Update the ref to track that we've joined this conversation
      hasJoinedConversation.current = conversationId;
      
      // First clear any existing messages - only clear if we're switching conversations
      if (activeConversationId !== conversationId) {
        dispatch(clearMessages());
      }
      
      // Join the conversation with socket
      joinConversation(conversationId);
      
      // Set active conversation in Redux
      dispatch(setActiveConversation(conversationId));
      
      // Fetch messages for this conversation - add a short delay to ensure socket connection is ready
      setTimeout(() => {
        dispatch(fetchMessages(conversationId));
      }, 100);
    } else if (!conversationId && isConnected) {
      // If we don't have a conversation ID but we're connected, clear messages
      console.log('No active conversation, clearing messages');
      dispatch(clearMessages());
      
      // Reset the joined conversation tracking
      hasJoinedConversation.current = null;
    }
  }, [conversationId, isConnected, joinConversation, dispatch, activeConversationId]);
  
  // Handle streaming tokens from different models
  useEffect(() => {
    const handleStreamToken = (data: StreamTokenData) => {
      const { type, token, conversation_id, agent_id } = data;
      
      // Log agent ID and conversation ID relationship
      if (agent_id && conversation_id) {
        console.log(`Stream data received - Agent ID: ${agent_id}, Conversation ID: ${conversation_id}`);
      }
      
      // Only process tokens for the current conversation
      if (!conversationId || conversation_id !== conversationId) {
        return;
      }
      
      // Update the appropriate debug stream
      if (type === 'orchestrator' || type === 'reasoning' || type === 'gemini') {
        // Get current content
        const currentContent = type === 'orchestrator' 
          ? debugStreams.orchestrator 
          : type === 'reasoning' 
          ? debugStreams.reasoning 
          : debugStreams.gemini;
        
        // Update with new content
        updateDebugStream(type, currentContent + token);
      }
      
      // For the gemini stream, we also update the chat UI
      if (type === 'gemini') {
        // Start streaming if this is the first token
        if (!streamingResponse) {
          dispatch(startStreamingResponse());
        }
        
        // Append token to streamed content
        dispatch(appendStreamToken(token));
      }
    };
    
    // Set up socket listeners for streaming
    const streamTokenUnsubscribe = socketService.onStreamToken(handleStreamToken);
    
    // Set up socket listener for stream end
    const streamEndUnsubscribe = socketService.onStreamEnd((data: {
      error?: string;
      cancelled?: boolean;
      conversation_id?: string;
    }) => {
      if (data.error) {
        console.error('Stream error:', data.error);
      } else if (!data.cancelled && conversationId === data.conversation_id) {
        dispatch(endStreamingResponse());
      }
    });
    
    return () => {
      streamTokenUnsubscribe();
      streamEndUnsubscribe();
    };
  }, [dispatch, conversationId, streamingResponse, updateDebugStream, debugStreams]);
  
  // Handle chat messages separately to avoid dependency issues
  useEffect(() => {
    // Handle incoming chat message
    const handleChatMessage = (message: {
      id: string;
      content: string;
      role: string;
      timestamp: string;
      conversationId: string;
    }) => {
      console.log('Received chat message:', message);
      if (message.conversationId === conversationId) {
        // Check if this message already exists in our messages array
        const messageExists = Array.isArray(messages) && 
          messages.some(m => m.id === message.id);
        
        if (!messageExists) {
          dispatch(addMessage(message));
        }
      }
    };
    
    const chatMessageUnsubscribe = socketService.onChatMessage(handleChatMessage);
    
    return () => {
      chatMessageUnsubscribe();
    };
  }, [dispatch, conversationId, messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamedContent]);
  
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // Only proceed if we have a conversation ID
    if (!conversationId) {
      console.error("No active conversation to send message to");
      return;
    }
    
    try {
      // Add the user message to the state
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'user',
        timestamp: new Date().toISOString(),
        conversationId: conversationId
      };
      
      // Make sure messages is an array before dispatching
      if (!Array.isArray(messages)) {
        dispatch(clearMessages());
      }
      
      // Add to Redux state for immediate UI update
      dispatch(addMessage(userMessage));
      
      // Send via socket.io only (not via Redux thunk which might cause duplication)
      // We'll get the response back via socket events
      sendMessage(content, conversationId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  // Simplify toggle handlers to avoid type issues
  const toggleLeftDrawer = () => {
    setLeftDrawerOpen(!leftDrawerOpen);
  };

  const handleToggleDebugPanel = () => {
    toggleDebugPanel();
  };
  
  const handleNewChat = async () => {
    try {
      // Clear messages first to prevent any issues when navigating
      dispatch(clearMessages());
      
      // Create a new conversation
      const newConversation = await apiService.createConversation("New Conversation");
      
      if (!newConversation || !newConversation.id) {
        throw new Error("Failed to create conversation: Invalid response from server");
      }
      
      console.log("Created new conversation:", newConversation);
      
      // Update Redux state with the new conversation
      dispatch({
        type: 'chat/createNewConversation/fulfilled',
        payload: newConversation
      });
      
      // Update the state by fetching conversations again to ensure UI is updated
      await dispatch(fetchConversationsAction());
      
      // Set active conversation
      dispatch(setActiveConversation(newConversation.id));
      
      // Navigate to new conversation with the ID in the URL
      await router.push(`/chat?id=${newConversation.id}`, undefined, { shallow: true });
      
      // Join the new conversation with socket
      if (isConnected) {
        joinConversation(newConversation.id);
      }
      
      // Force multiple re-fetches of conversations to update the left panel
      // This helps with potential sync issues between backend and Redux state
      setTimeout(() => {
        dispatch(fetchConversationsAction());
      }, 300);
      
      setTimeout(() => {
        dispatch(fetchConversationsAction());
      }, 1000);
      
    } catch (error) {
      console.error("Failed to create new conversation:", error instanceof Error ? error.message : String(error));
      
      // Ensure we still have empty messages array even if creation failed
      dispatch(clearMessages());
    }
  };
  
  // Add a ref to track initial setup
  const isInitialSetupDone = useRef(false);

  // Modify the useEffect to prevent reopening closed panels
  useEffect(() => {
    if (!isMobile) {
      // Small delay to ensure proper rendering after initial load
      const timer = setTimeout(() => {
        // Only set these states on first load - use a ref to track this
        if (!isInitialSetupDone.current) {
          setLeftDrawerOpen(true);
          isInitialSetupDone.current = true;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobile]); // Remove toggleDebugPanel and isDebugPanelOpen from dependencies
  
  // Add connection initialization at component mount with improved rerender control
  useEffect(() => {
    // Initialize socket connection
    if (!isConnected) {
      console.log('Initializing socket connection...');
      const socket = socketService;
      socket.connect(BACKEND_URL);
    }
    
    // If we have a conversation ID from the URL but not in Redux, fetch it
    // Only do this on initial mount or when these values actually change
    if (conversationId && 
        (!activeConversationId || activeConversationId !== conversationId) && 
        isConnected && 
        isInitialMount.current) {
      console.log(`Initial load with conversation ID from URL: ${conversationId}`);
      fetchAndJoinConversation(conversationId);
      isInitialMount.current = false;
    }
    
    return () => {
      // No need to disconnect when unmounting - connection will be maintained
    };
  }, [isConnected, conversationId, activeConversationId, fetchAndJoinConversation]);

  return (
    <ParticlesBackground disableMouseTracking>
      <Head>
        <title>Chat - Aura AI Agents</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </Head>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        bgcolor: 'transparent',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Show connection status alert */}
        <ServerStatusAlert />
        
        {/* FAISS Activity Indicator */}
        <FAISSActivityIndicator />
        
        <Box sx={{ 
          display: 'flex', 
          position: 'relative',
          width: '100%',
          height: '100%',
          flexGrow: 1,
          overflow: 'hidden',
          zIndex: 5 // Above particles but below drawers
        }}>
          {/* Conversation List Drawer */}
          <Drawer
            variant={isMobile ? "temporary" : "persistent"}
            open={leftDrawerOpen}
            onClose={toggleLeftDrawer}
            ModalProps={{ 
              keepMounted: true,
              hideBackdrop: isMobile ? false : true
            }}
            sx={{
              width: 280,
              flexShrink: 0,
              zIndex: 1300,
              display: 'block',
              position: 'fixed',
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                background: 'rgba(18, 18, 22, 0.95)',
                backdropFilter: 'blur(15px)',
                height: '100%',
                position: 'fixed',
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.25)',
                overflowY: 'auto',
                overflowX: 'hidden',
              },
            }}
          >
            <ConversationsList onNewChat={handleNewChat} />
          </Drawer>
          
          {/* Main Content Container - Proper width calculation */}
          <Box
            component="main"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              height: '100%',
              position: 'relative',
              px: { xs: 1, sm: 2 },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              // Set left margin based on drawer state
              marginLeft: leftDrawerOpen && !isMobile ? '280px' : 0,
              // Set right margin based on debug panel state with new width
              marginRight: isDebugPanelOpen && !isMobile ? '350px' : 0,
              width: '100%',
              boxSizing: 'border-box',
              // Use calc for accurate width adjustments only on desktop with new debug panel width
              ...((!isMobile && leftDrawerOpen && isDebugPanelOpen) && {
                width: 'calc(100% - 630px)', // Both open (280px + 350px)
              }),
              ...((!isMobile && leftDrawerOpen && !isDebugPanelOpen) && {
                width: 'calc(100% - 280px)', // Only left open
              }),
              ...((!isMobile && !leftDrawerOpen && isDebugPanelOpen) && {
                width: 'calc(100% - 350px)', // Only right open (new width)
              }),
              ...((!isMobile && !leftDrawerOpen && !isDebugPanelOpen) && {
                width: '100%', // Both closed
              }),
            }}
          >
            {/* App Bar - Fixed position */}
            <Box sx={{ 
              py: 1.5,
              px: 2,
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderRadius: '0 0 12px 12px',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              background: 'rgba(18, 18, 22, 0.85)',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1100
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <IconButton 
                  onClick={toggleLeftDrawer} 
                  color={leftDrawerOpen ? "primary" : "default"}
                  sx={{ 
                    "&:hover": { background: leftDrawerOpen ? "rgba(25, 118, 210, 0.1)" : "rgba(255, 255, 255, 0.1)" },
                    zIndex: 1200
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <IconButton 
                  onClick={() => window.location.href = '/'}
                  color="primary" 
                  sx={{ 
                    ml: { xs: 1, md: 1 },
                    "&:hover": { background: "rgba(25, 118, 210, 0.1)" }
                  }}
                >
                  <HomeIcon />
                </IconButton>
              </Box>
              
              <Typography variant="h6" sx={{ 
                flexGrow: 1, 
                textAlign: 'center',
                fontWeight: 500,
                background: 'linear-gradient(90deg, #f5cc7f 0%, #c09c58 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {conversationId ? "Conversation" : "New Chat"}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={handleToggleDebugPanel}
                  color={isDebugPanelOpen ? "primary" : "default"}
                  size="small"
                  title="Toggle Debug Panel"
                >
                  <BugReportIcon />
                </IconButton>
                
                <IconButton
                  onClick={() => updateDebugOption('showModelThinking', !debugOptions.showModelThinking)}
                  color={debugOptions.showModelThinking ? "primary" : "default"}
                  size="small"
                  title="Show Model Thinking"
                >
                  <PsychologyIcon />
                </IconButton>
              </Box>
            </Box>
            
            {/* Messages Area */}
            <Box sx={{ 
              flexGrow: 1, 
              p: { xs: 1, sm: 2 }, 
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 138px)', // Subtract header and input area heights
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%)',
                pointerEvents: 'none',
                opacity: 0.7,
                zIndex: 1
              },
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: 'linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%)',
                pointerEvents: 'none',
                opacity: 0.7,
                zIndex: 1
              },
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              },
            }}>
              <Container 
                maxWidth="md" 
                sx={{ 
                  flexGrow: 1, 
                  py: 2,
                  zIndex: 2,
                  position: 'relative',
                }}
              >
                {!Array.isArray(messages) || messages.length === 0 ? (
                  conversationId && isLoading ? (
                    // Loading state
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant="body1">Loading messages...</Typography>
                    </Box>
                  ) : (
                    // Empty state
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      opacity: 0.7
                    }}>
                      <Typography variant="h5" gutterBottom>
                        {conversationId ? "Start typing to begin your conversation" : "Start a conversation with a Aura Agent"}
                      </Typography>
                      <Typography variant="body1" sx={{ maxWidth: 500, textAlign: 'center', mb: 4 }}>
                        {isConnected 
                          ? "Chat about anything, Aura Agents are here to be your companions."
                          : "Waiting for connection to be established. Please ensure the backend is running."}
                      </Typography>
                      {!isConnected && (
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => window.location.reload()}
                          startIcon={<RefreshIcon />}
                        >
                          Refresh Page
                        </Button>
                      )}
                    </Box>
                  )
                ) : (
                  // Messages list
                  <>
                    {messages.map((message, index) => (
                      <ChatMessage 
                        key={`${message.id}-${index}`}
                        message={message}
                        isLastMessage={index === messages.length - 1}
                      />
                    ))}
                    
                    {streamingResponse && (
                      <ChatMessage 
                        message={{
                          id: 'streaming',
                          content: streamedContent,
                          role: 'assistant',
                          timestamp: new Date().toISOString(),
                          conversationId: conversationId || 'temp'
                        }}
                        isLastMessage={true}
                      />
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </Container>
            </Box>
            
            {/* Add this before the MessageInput component */}
            <ModelThinkingDisplay 
              visible={debugOptions.showModelThinking && 
                (!!debugStreams.orchestrator || !!debugStreams.reasoning || !!debugStreams.gemini)}
              activeTabIndex={1} // Default to reasoning tab
            />
            
            {/* Input Area - Fixed at bottom */}
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              background: 'rgba(18, 18, 22, 0.85)',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              borderRadius: '12px 12px 0 0',
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              zIndex: 1090
            }}>
              <Container maxWidth="md">
                <ChatInput 
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading || streamingResponse}
                  disabled={!isConnected}
                  placeholder={isConnected ? "Ask Aura anything..." : "Connecting to server..."}
                />
              </Container>
            </Box>
          </Box>
          
          {/* Debug Panel Drawer - Enhanced with real-time stream data */}
          <Drawer
            variant="persistent"
            anchor="right"
            open={isDebugPanelOpen}
            sx={{
              width: isMobile ? '100%' : '350px', // Reduced from 400px to 350px
              flexShrink: 0,
              zIndex: 1400, // Increased from 1300 to 1400 to be above the left drawer
              display: 'block',
              position: 'fixed',
              right: 0,
              '& .MuiDrawer-paper': {
                width: isMobile ? '100%' : '350px', // Reduced from 400px to 350px
                height: '100%',
                boxSizing: 'border-box',
                borderLeft: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                background: 'rgba(18, 18, 22, 0.95)',
                backdropFilter: 'blur(15px)',
                position: 'fixed',
                right: 0,
                top: 0,
                boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'hidden',
              },
            }}
          >
            <Box sx={{ 
              p: 1, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0
            }}>
              <Typography variant="subtitle1" sx={{ ml: 1 }}>Debug Panel</Typography>
              <IconButton 
                onClick={handleToggleDebugPanel}
                sx={{ 
                  "&:hover": { background: "rgba(255, 255, 255, 0.1)" },
                  zIndex: 1200
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
              overflowX: 'hidden' 
            }}>
              <DebugPanel conversationId={conversationId} />
              <AgentInfoPanel />
            </Box>
          </Drawer>
        </Box>
        
        {/* Mobile Debug Panel Toggle - fix callback */}
        {isMobile && (
          <Fab 
            color={isDebugPanelOpen ? "primary" : "default"}
            size="medium"
            aria-label="debug"
            onClick={handleToggleDebugPanel}
            sx={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20,
              display: isDebugPanelOpen ? 'none' : 'flex',
              zIndex: 2000,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
          >
            <BugReportIcon />
          </Fab>
        )}

        {/* Make sure mobile buttons are always visible even when panels are open */}
        {isMobile && (
          <Fab 
            color={leftDrawerOpen ? "primary" : "default"}
            size="medium"
            aria-label="menu"
            onClick={toggleLeftDrawer}
            sx={{ 
              position: 'fixed', 
              bottom: isDebugPanelOpen ? 80 : 20,
              left: 20,
              zIndex: 2000,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              display: 'flex', // Always show
            }}
          >
            <MenuIcon />
          </Fab>
        )}
      </Box>
    </ParticlesBackground>
  );
} 