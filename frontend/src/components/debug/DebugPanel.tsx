import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StreamingVisualizer from './StreamingVisualizer';
import { useSettings } from '@/contexts/SettingsContext';
import { apiService } from '@/services/apiService';
import socketService from '@/services/socketService';
import { API_BASE_URL } from '@/config';

// Add interfaces for our types
interface ExtendedConversation {
  id: string;
  title: string;
  created_at: string;
  agent_id?: string;
  last_message?: string;
  messages?: Array<Record<string, unknown>>; // Replace any with a more specific type
}

interface ApiError {
  message: string;
  code?: string;
}

// Type definition for stream token data
interface StreamTokenData {
  type?: 'orchestrator' | 'reasoning' | 'gemini';
  token: string;
  conversation_id?: string;
  agent_id?: string;
}

// Type definition for agent
interface Agent {
  id: string;
  name: string;
  [key: string]: unknown;
}

// Type definition for memory stats
interface MemoryStatsResponse {
  count: number;
  last_access?: string;
}

// Example data for mock streams
const mockOrchestratorStream = `Analyzing user request...
Intent: Code generation
Needs tool: Yes
Tools required: ["web_search", "file_generate"]
Memory query: "user coding preferences, project structure"
Approach: I'll search for information about the requested technology, then generate the code.`;

const mockReasoningStream = `Let me think about how to approach this request.
1. The user wants a React component that fetches data from an API.
2. We need to implement loading states, error handling, and data rendering.
3. We should use React hooks for state management.
4. TypeScript types should be properly defined.
5. Error boundaries might be a good addition.

I'll structure this as a functional component with:
- useState for loading/error states
- useEffect for data fetching
- TypeScript interfaces for data types
- Conditional rendering based on states`;

const mockGeminiStream = `Here's a React component that fetches data from an API:

\`\`\`tsx
import React, { useState, useEffect } from 'react';

interface ApiData {
  id: number;
  title: string;
  completed: boolean;
}

interface DataFetcherProps {
  url: string;
  renderItem: (item: ApiData) => React.ReactNode;
}

export const DataFetcher: React.FC<DataFetcherProps> = ({ url, renderItem }) => {
  const [data, setData] = useState<ApiData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const jsonData = await response.json();
        setData(jsonData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="data-container">
      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.id}>
            {renderItem(item)}
          </div>
        ))
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};
\`\`\`

This component is reusable and provides loading states, error handling, and renders your data using a render prop pattern.

You can use it like this:

\`\`\`tsx
<DataFetcher 
  url="https://jsonplaceholder.typicode.com/todos" 
  renderItem={(item) => (
    <div>
      <h3>{item.title}</h3>
      <p>Completed: {item.completed ? 'Yes' : 'No'}</p>
    </div>
  )}
/>
\`\`\``;

export interface DebugPanelProps {
  conversationId?: string;
}

export default function DebugPanel({ conversationId }: DebugPanelProps) {
  const { 
    debugOptions, 
    updateDebugOption,
    debugStreams,
    updateDebugStream,
    clearDebugStreams
  } = useSettings();

  // State for tracking agent/conversation relationship
  const [agentInfo, setAgentInfo] = useState({
    agentId: '',
    name: '',
    lastActivity: '',
    isLoading: false,
    error: ''
  });

  // Mock loading state for the streaming visualizer
  const [isLoading, setIsLoading] = useState(false);
  const [memoryStats, setMemoryStats] = useState({
    count: 0,
    lastAccess: '',
    isLoading: false
  });

  // Add state for FAISS activity and server logs
  const [faissActive, setFaissActive] = useState(false);
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [showServerLogs, setShowServerLogs] = useState(false);

  // Fetch agent info whenever the conversation ID changes
  useEffect(() => {
    if (!conversationId) return;
    
    const fetchAgentInfo = async () => {
      try {
        setAgentInfo(prev => ({ ...prev, isLoading: true, error: '' }));
        
        // Fetch conversation details to get agent ID
        const conversation = await apiService.getConversation(conversationId) as ExtendedConversation;
        
        if (!conversation || !conversation.agent_id) {
          setAgentInfo({
            agentId: 'unknown',
            name: 'No agent assigned',
            lastActivity: '',
            isLoading: false,
            error: 'No agent ID found for this conversation'
          });
          return;
        }
        
        const agentId = conversation.agent_id;
        
        // Now fetch the agent details
        try {
          const agent = await apiService.getAgent(agentId) as Agent;
          
          setAgentInfo({
            agentId,
            name: agent.name || 'Unnamed Agent',
            lastActivity: new Date().toISOString(),
            isLoading: false,
            error: ''
          });
          
          // Also fetch memory stats
          fetchMemoryStats(agentId);
          
        } catch (error) {
          console.error(`Error fetching agent ${agentId}:`, error);
          
          // If we can't get the agent, try to initialize it
          try {
            const success = await apiService.initializeMemoryForAgent(agentId);
            if (success) {
              // Try fetching the agent again after initialization
              const agent = await apiService.getAgent(agentId) as Agent;
              setAgentInfo({
                agentId,
                name: agent.name || 'Newly Initialized Agent',
                lastActivity: new Date().toISOString(),
                isLoading: false,
                error: ''
              });
              
              // Fetch memory stats again
              fetchMemoryStats(agentId);
            } else {
              throw new Error('Failed to initialize memory for agent');
            }
          } catch (initError) {
            console.error(`Error initializing agent ${agentId}:`, initError);
            setAgentInfo({
              agentId,
              name: 'Error Fetching Agent',
              lastActivity: '',
              isLoading: false,
              error: `Error retrieving agent: ${error instanceof Error ? error.message : String(error)}`
            });
          }
        }
      } catch (e) {
        console.error('Error in fetchAgentInfo:', e);
        setAgentInfo({
          agentId: 'error',
          name: 'Error',
          lastActivity: '',
          isLoading: false,
          error: `Failed to load agent: ${e instanceof Error ? e.message : String(e)}`
        });
      }
    };
    
    fetchAgentInfo();
  }, [conversationId]);

  const fetchMemoryStats = async (agentId: string) => {
    if (!agentId || agentId === 'unknown') return;
    
    try {
      setMemoryStats(prev => ({ ...prev, isLoading: true }));
      const stats = await apiService.getAgentMemoryStats(agentId);
      setMemoryStats({
        count: stats.count || 0,
        lastAccess: stats.last_access || 'Never accessed',
        isLoading: false
      });
    } catch (error) {
      console.error(`Error fetching memory stats for ${agentId}:`, error);
      setMemoryStats({
        count: 0,
        lastAccess: 'Error fetching',
        isLoading: false
      });
    }
  };

  // Simulates refreshing streaming data
  const handleRefreshStreams = () => {
    // Clear existing streams first
    clearDebugStreams();
    
    setIsLoading(true);
    
    // Try to fetch real data from the server logs
    apiService.getServerLogs(200)
      .then(logs => {
        // Process logs to extract different stream types
        const orchestratorLogs = logs
          .filter(log => log.includes('orchestrator'))
          .join('\n');
        
        const reasoningLogs = logs
          .filter(log => log.includes('reasoning'))
          .join('\n');
        
        const geminiLogs = logs
          .filter(log => log.includes('gemini') || log.includes('llm'))
          .join('\n');
        
        // Update streams with real data if available
        if (orchestratorLogs) {
          updateDebugStream('orchestrator', orchestratorLogs);
        } else {
          updateDebugStream('orchestrator', mockOrchestratorStream);
        }
        
        if (reasoningLogs) {
          updateDebugStream('reasoning', reasoningLogs);
        } else {
          updateDebugStream('reasoning', mockReasoningStream);
        }
        
        if (geminiLogs) {
          updateDebugStream('gemini', geminiLogs);
        } else {
          updateDebugStream('gemini', mockGeminiStream);
        }
      })
      .catch(error => {
        console.error("Failed to fetch server logs:", error);
        // Fall back to mock data
        updateDebugStream('orchestrator', mockOrchestratorStream);
        updateDebugStream('reasoning', mockReasoningStream);
        updateDebugStream('gemini', mockGeminiStream);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!conversationId) return;
    
    // Clear existing streams when conversation changes
    clearDebugStreams();
    
    // Listen for stream tokens specific to this conversation
    const streamTokenUnsubscribe = socketService.onStreamToken((data: StreamTokenData) => {
      if (data.conversation_id !== conversationId) return;
      
      // Update the appropriate stream
      if (data.type) {
        const currentContent = data.type === 'orchestrator' 
          ? debugStreams.orchestrator 
          : data.type === 'reasoning' 
          ? debugStreams.reasoning 
          : debugStreams.gemini;
          
        updateDebugStream(data.type, currentContent + data.token);
      }
      
      // If we get agent ID, update our state
      if (data.agent_id && data.agent_id !== agentInfo.agentId) {
        setAgentInfo(prev => ({
          ...prev,
          agentId: data.agent_id || prev.agentId,
          lastActivity: new Date().toISOString()
        }));
      }
    });
    
    return () => {
      streamTokenUnsubscribe();
    };
  }, [conversationId, debugStreams, updateDebugStream, clearDebugStreams, agentInfo.agentId]);

  // Add effect for subscribing to FAISS activity events
  useEffect(() => {
    // Subscribe to FAISS activity events
    const unsubscribe = socketService.onFAISSActivity((data) => {
      setFaissActive(data.active);
      
      // If FAISS becomes active, automatically refresh memory stats after a delay
      if (data.active && agentInfo.agentId) {
        setTimeout(() => {
          fetchMemoryStats(agentInfo.agentId);
        }, 5000); // Wait 5 seconds for FAISS to finish its work
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [agentInfo.agentId]);

  // Function to fetch server logs
  const fetchServerLogs = async (lines: number = 50) => {
    try {
      const logs = await apiService.getServerLogs(lines);
      setServerLogs(logs);
    } catch (error) {
      console.error("Error fetching server logs:", error);
      setServerLogs(["Error fetching server logs"]);
    }
  };

  // Function to handle memory index rebuild
  const handleRebuildMemoryIndex = async () => {
    if (!agentInfo.agentId || agentInfo.agentId === 'unknown') return;
    
    try {
      setIsLoading(true);
      
      // Call API to rebuild index
      const response = await fetch(`${API_BASE_URL}/api/memory/${agentInfo.agentId}/rebuild-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to rebuild memory index: ${response.statusText}`);
      }
      
      // Refresh memory stats after rebuilding
      setTimeout(() => {
        fetchMemoryStats(agentInfo.agentId);
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error(`Error rebuilding memory index for ${agentInfo.agentId}:`, error);
      setIsLoading(false);
    }
  };

  // Handle changes to debug configuration
  const handleConfigChange = (key: keyof typeof debugOptions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugOption(key, event.target.checked);
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #f5cc7f 0%, #c09c58 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Agent Debug Panel
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshStreams}
          disabled={isLoading}
          sx={{ ml: 1 }}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </Box>
      
      {/* Agent Information at top */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 2, 
          background: 'rgba(30, 30, 30, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Current Session
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => fetchMemoryStats(agentInfo.agentId)}
              disabled={agentInfo.isLoading || !agentInfo.agentId || agentInfo.agentId === 'unknown'}
              sx={{ fontSize: '0.75rem', py: 0.5 }}
            >
              Refresh Stats
            </Button>
            
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                if (!agentInfo.agentId) return;
                
                try {
                  setAgentInfo(prev => ({ ...prev, isLoading: true }));
                  await apiService.initializeMemoryForAgent(agentInfo.agentId);
                  setAgentInfo(prev => ({ 
                    ...prev, 
                    isLoading: false,
                    lastActivity: new Date().toISOString(),
                    error: ''
                  }));
                  
                  // Refresh memory stats after initialization
                  fetchMemoryStats(agentInfo.agentId);
                  
                  // Show success message
                  alert('Memory initialized successfully!');
                } catch (error) {
                  console.error('Failed to initialize memory:', error);
                  setAgentInfo(prev => ({ 
                    ...prev, 
                    isLoading: false,
                    error: `Failed to initialize memory: ${error instanceof Error ? error.message : 'Unknown error'}`
                  }));
                }
              }}
              disabled={agentInfo.isLoading || !agentInfo.agentId || agentInfo.agentId === 'unknown'}
              sx={{ fontSize: '0.75rem', py: 0.5 }}
            >
              Initialize Memory
            </Button>
          </Box>
        </Box>
        
        {agentInfo.isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Loading agent info...</Typography>
          </Box>
        ) : agentInfo.error ? (
          <Alert severity="warning" sx={{ py: 0.5, fontSize: '0.75rem' }}>
            {agentInfo.error}
          </Alert>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Chip 
                icon={<PsychologyIcon fontSize="small" />}
                label={agentInfo.name || 'Unknown Agent'} 
                size="small"
                color="primary"
                variant="outlined"
              />
              
              <Chip 
                label={`Memory: ${memoryStats.isLoading ? '...' : memoryStats.count}`} 
                size="small"
                color="default"
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ 
                fontFamily: 'monospace', 
                wordBreak: 'break-all',
                opacity: 0.7
              }}>
                <strong>Agent:</strong> {agentInfo.agentId || 'None'}
              </Typography>
              
              <Typography variant="caption" sx={{ 
                fontFamily: 'monospace', 
                wordBreak: 'break-all',
                opacity: 0.7
              }}>
                <strong>Conversation:</strong> {conversationId || 'None'}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
      
      {/* Debug Configuration - Keep Debug Configuration expanded but close the others by default */}
      <Accordion 
        defaultExpanded={true}
        sx={{ 
          mb: 2, 
          background: 'rgba(30, 30, 30, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&:before': { display: 'none' }, // Remove the default divider
          '&.Mui-expanded': { mt: 0, mb: 2 }, // Fix spacing when expanded
          overflow: 'hidden', // Prevent content overflow
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: '48px',
            '&.Mui-expanded': {
              minHeight: '48px',
            },
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">Debug Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch 
                checked={debugOptions.showMemories} 
                onChange={handleConfigChange('showMemories')} 
                color="primary" 
              />}
              label="Show Memories"
            />
            <FormControlLabel
              control={<Switch 
                checked={debugOptions.showReflections} 
                onChange={handleConfigChange('showReflections')} 
                color="primary" 
              />}
              label="Show Reflections"
            />
            <FormControlLabel
              control={<Switch 
                checked={debugOptions.showEmotions} 
                onChange={handleConfigChange('showEmotions')} 
                color="primary" 
              />}
              label="Show Emotions"
            />
            <FormControlLabel
              control={<Switch 
                checked={debugOptions.showTokenUsage} 
                onChange={handleConfigChange('showTokenUsage')} 
                color="primary" 
              />}
              label="Show Token Usage"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Orchestrator Stream - CLOSE by default */}
      <Accordion 
        defaultExpanded={false}
        sx={{ 
          mb: 2, 
          background: 'rgba(30, 30, 30, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&:before': { display: 'none' }, // Remove the default divider
          '&.Mui-expanded': { mt: 0, mb: 2 }, // Fix spacing when expanded
          overflow: 'hidden', // Prevent content overflow
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: '48px',
            '&.Mui-expanded': {
              minHeight: '48px',
            },
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">Orchestrator Stream</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 1 }}>
          <StreamingVisualizer
            content={debugStreams.orchestrator}
            isLoading={isLoading}
            highlightKeywords={true}
            height="120px" // Reduced height
          />
        </AccordionDetails>
      </Accordion>

      {/* Reasoning Stream - CLOSE by default */}
      <Accordion 
        defaultExpanded={false}
        sx={{ 
          mb: 2, 
          background: 'rgba(30, 30, 30, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&:before': { display: 'none' }, // Remove the default divider
          '&.Mui-expanded': { mt: 0, mb: 2 }, // Fix spacing when expanded
          overflow: 'hidden', // Prevent content overflow
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: '48px',
            '&.Mui-expanded': {
              minHeight: '48px',
            },
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">Reasoning Stream</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 1 }}>
          <StreamingVisualizer
            content={debugStreams.reasoning}
            isLoading={isLoading}
            highlightKeywords={true}
            height="120px" // Reduced height
          />
        </AccordionDetails>
      </Accordion>

      {/* Model Output Stream - CLOSE by default */}
      <Accordion 
        defaultExpanded={false}
        sx={{ 
          mb: 2, 
          background: 'rgba(30, 30, 30, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&:before': { display: 'none' }, // Remove the default divider
          '&.Mui-expanded': { mt: 0, mb: 2 }, // Fix spacing when expanded
          overflow: 'hidden', // Prevent content overflow
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: '48px',
            '&.Mui-expanded': {
              minHeight: '48px',
            },
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">Model Output</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 1 }}>
          <StreamingVisualizer
            content={debugStreams.gemini}
            isLoading={isLoading}
            highlightKeywords={true}
            codeBlocks={true}
            height="120px" // Reduced height
          />
        </AccordionDetails>
      </Accordion>

      {/* Add this section after the agent information Paper and before the accordions */}
      <Accordion 
        defaultExpanded={false}
        sx={{ 
          mb: 2, 
          background: 'rgba(30, 30, 30, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&:before': { display: 'none' },
          '&.Mui-expanded': { mt: 0, mb: 2 },
          overflow: 'hidden',
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: '48px',
            '&.Mui-expanded': {
              minHeight: '48px',
            },
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">Agent Tools</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Manage agent memory and performance
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRebuildMemoryIndex}
                disabled={isLoading || !agentInfo.agentId || agentInfo.agentId === 'unknown'}
                sx={{ fontSize: '0.75rem' }}
              >
                Rebuild Memory Index
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => fetchServerLogs(100)}
                sx={{ fontSize: '0.75rem' }}
              >
                Fetch Server Logs
              </Button>
            </Box>
            
            {/* FAISS Activity Indicator */}
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: faissActive ? 'success.main' : 'text.disabled',
                  transition: 'background-color 0.3s ease',
                }}
              />
              <Typography variant="body2">
                {faissActive ? 'FAISS Active' : 'FAISS Idle'}
              </Typography>
            </Box>
            
            {/* Server Logs Display (toggled) */}
            {serverLogs.length > 0 && (
              <>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowServerLogs(!showServerLogs)}
                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                >
                  {showServerLogs ? 'Hide Server Logs' : 'Show Server Logs'}
                </Button>
                
                {showServerLogs && (
                  <Paper
                    sx={{
                      p: 1,
                      mt: 1,
                      maxHeight: '200px',
                      overflow: 'auto',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  >
                    {serverLogs.map((log, i) => (
                      <Box key={i} sx={{ py: 0.5, borderBottom: i < serverLogs.length - 1 ? '1px dashed rgba(255,255,255,0.1)' : 'none' }}>
                        {log}
                      </Box>
                    ))}
                  </Paper>
                )}
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
} 