import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Slider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  PersonOutline as PersonIcon,
  StarOutline as StarIcon
} from '@mui/icons-material';
import axios from 'axios';
import AppLayout from '../components/layout/Layout';
import MainLayout from '../components/layout/MainLayout';

// Interface definitions
interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  settings: {
    context_window?: number;
    temperature?: number;
    memory_usage?: number;
    retrieval_strength?: number;
    max_tokens?: number;
    template_used?: string;
    [key: string]: string | number | boolean | undefined;
  };
  created_at: string;
  conversation_count: number;
  memory_count: number;
  statistics?: AgentStatistics;
}

interface AgentStatistics {
  conversations: number;
  messages: number;
  memory_entries: number;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | undefined;
}

interface Memory {
  id: string;
  agent_id: string;
  content: string;
  importance: number;
  source: string;
  meta_data?: Record<string, string | number | boolean | null>; 
  created_at: string;
  embedding_available: boolean;
}

interface MemoryStats {
  total_count: number;
  avg_importance: number;
  source_distribution: Record<string, number>;
  memory_timeline: Record<string, number>;
  embedding_stats: {
    vector_dimension: number;
    has_index: boolean;
    index_size: number;
  };
}

// TabPanel component for tab content
function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Create Memory Dialog Component
function CreateMemoryDialog({ 
  agentId, 
  open, 
  onClose, 
  onMemoryCreated 
}: { 
  agentId: string; 
  open: boolean; 
  onClose: () => void; 
  onMemoryCreated: () => void;
}) {
  const [content, setContent] = useState('');
  const [importance, setImportance] = useState(0.5);
  const [source, setSource] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (content.trim() === '') {
      setError('Memory content is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`/api/memory/${agentId}`, {
        content,
        importance,
        source,
        meta_data: {
          created_via: 'dashboard'
        }
      });
      
      onMemoryCreated();
      onClose();
    } catch (err) {
      console.error('Error creating memory:', err);
      setError('Failed to create memory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Memory</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            label="Memory Content"
            multiline
            rows={4}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Typography gutterBottom>Importance: {importance}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="caption">Low</Typography>
            <Box sx={{ width: '100%', mx: 2 }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={importance}
                onChange={(e) => setImportance(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </Box>
            <Typography variant="caption">High</Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Source</InputLabel>
            <Select
              value={source}
              label="Source"
              onChange={(e) => setSource(e.target.value)}
            >
              <MenuItem value="manual">Manual Entry</MenuItem>
              <MenuItem value="conversation">Conversation</MenuItem>
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="reflection">Reflection</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
        >
          Save Memory
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Create Agent Dialog Component
function CreateAgentDialog({ 
  open, 
  onClose, 
  onAgentCreated 
}: { 
  open: boolean; 
  onClose: () => void; 
  onAgentCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [templateOptions, setTemplateOptions] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // This would ideally fetch from an actual endpoint
        const templates = {
          "assistant": "You are Aura, a versatile AI assistant that aims to be helpful, harmless, and honest. You help users with a wide range of tasks while being respectful of their time and privacy.",
          "coder": "You are Aura, a specialized AI coding assistant. You help users write, debug, and understand code across various programming languages and frameworks. You prioritize correctness, readability, and performance in your suggestions.",
          "creative": "You are Aura, a creative AI companion. You assist with creative writing, brainstorming, and idea generation. You provide thoughtful and imaginative responses while helping users explore new perspectives."
        };
        setTemplateOptions(templates);
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateChange = (event: SelectChangeEvent) => {
    const template = event.target.value;
    setSelectedTemplate(template);
    if (template && templateOptions[template]) {
      setSystemPrompt(templateOptions[template]);
    }
  };

  const handleSubmit = async () => {
    if (name.trim() === '') {
      setError('Agent name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/agents', {
        name,
        system_prompt: systemPrompt,
        settings: {
          template_used: selectedTemplate || 'custom'
        }
      });
      
      onAgentCreated();
      onClose();
    } catch (err) {
      console.error('Error creating agent:', err);
      setError('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Agent</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            label="Agent Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Template</InputLabel>
            <Select
              value={selectedTemplate}
              label="Template"
              onChange={handleTemplateChange}
              native={false}
            >
              <MenuItem value="">Custom</MenuItem>
              {Object.keys(templateOptions).map((key) => (
                <MenuItem key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="System Prompt"
            multiline
            rows={6}
            fullWidth
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
        >
          Create Agent
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Add a new EditSystemPromptDialog component
function EditSystemPromptDialog({ 
  agent, 
  open, 
  onClose, 
  onSave 
}: { 
  agent: Agent; 
  open: boolean; 
  onClose: () => void; 
  onSave: (systemPrompt: string) => void;
}) {
  const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templateOptions, setTemplateOptions] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // This would ideally fetch from an actual endpoint
        const templates = {
          "assistant": "You are Aura, a versatile AI assistant that aims to be helpful, harmless, and honest. You help users with a wide range of tasks while being respectful of their time and privacy.",
          "coder": "You are Aura, a specialized AI coding assistant. You help users write, debug, and understand code across various programming languages and frameworks. You prioritize correctness, readability, and performance in your suggestions.",
          "creative": "You are Aura, a creative AI companion. You assist with creative writing, brainstorming, and idea generation. You provide thoughtful and imaginative responses while helping users explore new perspectives."
        };
        setTemplateOptions(templates);
        
        // Determine if current prompt matches a template
        for (const [key, value] of Object.entries(templates)) {
          if (value === agent.system_prompt) {
            setSelectedTemplate(key);
            break;
          }
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };

    fetchTemplates();
  }, [agent]);

  const handleTemplateChange = (event: SelectChangeEvent) => {
    const template = event.target.value;
    setSelectedTemplate(template);
    if (template && templateOptions[template]) {
      setSystemPrompt(templateOptions[template]);
    }
  };

  const handleSubmit = async () => {
    if (systemPrompt.trim() === '') {
      setError('System prompt is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      onSave(systemPrompt);
      onClose();
    } catch (err) {
      console.error('Error updating system prompt:', err);
      setError('Failed to update system prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit System Prompt</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Template</InputLabel>
            <Select
              value={selectedTemplate}
              label="Template"
              onChange={handleTemplateChange}
              native={false}
            >
              <MenuItem value="">Custom</MenuItem>
              {Object.keys(templateOptions).map((key) => (
                <MenuItem key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="System Prompt"
            multiline
            rows={10}
            fullWidth
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter the system prompt for this agent..."
            sx={{ mb: 1 }}
          />
          
          <Typography variant="caption" color="text.secondary">
            The system prompt defines the agent&apos;s personality, capabilities, and behavior. It provides context for how the agent should respond to user inputs.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Main Agent Dashboard Page
export default function AgentsDashboard() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [createAgentDialogOpen, setCreateAgentDialogOpen] = useState(false);
  const [createMemoryDialogOpen, setCreateMemoryDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editPromptDialogOpen, setEditPromptDialogOpen] = useState(false);
  const [editingAgentSettings, setEditingAgentSettings] = useState(false);
  const [agentSettings, setAgentSettings] = useState<{
    context_window: number;
    temperature: number;
    memory_usage: number;
    retrieval_strength: number;
    max_tokens: number;
  }>({
    context_window: 4000,
    temperature: 0.7,
    memory_usage: 0.5,
    retrieval_strength: 0.7,
    max_tokens: 1000,
  });

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const fetchAgentDetails = useCallback(async (agentId: string) => {
    try {
      // Fetch agent with stats
      const agentResponse = await axios.get(`/api/agents/${agentId}?with_stats=true`);
      setSelectedAgent(agentResponse.data);
      
      // Fetch memories
      const memoriesResponse = await axios.get(`/api/memory/${agentId}`);
      setMemories(memoriesResponse.data);
      
      // Fetch memory stats
      const statsResponse = await axios.get(`/api/memory/${agentId}/stats`);
      setMemoryStats(statsResponse.data);
      
      // Update URL
      router.push({
        pathname: router.pathname,
        query: { id: agentId }
      }, undefined, { shallow: true });
    } catch (err) {
      console.error('Error fetching agent details:', err);
      showNotification('Failed to fetch agent details', 'error');
    }
  }, [router]);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await axios.get('/api/agents');
      setAgents(response.data);
      
      // If we have an agent in the URL or a previously selected agent, select it
      const agentId = router.query.id as string;
      if (agentId && response.data.length > 0) {
        const agent = response.data.find((a: Agent) => a.id === agentId);
        if (agent) {
          setSelectedAgent(agent);
          fetchAgentDetails(agent.id);
        }
      } else if (response.data.length > 0 && !selectedAgent) {
        // Select the first agent if none is selected
        setSelectedAgent(response.data[0]);
        fetchAgentDetails(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      showNotification('Failed to fetch agents', 'error');
    } finally {
      setLoading(false);
    }
  }, [router.query.id, selectedAgent, fetchAgentDetails]);

  const handleSearchMemories = async () => {
    if (!selectedAgent || !searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await axios.post(`/api/memory/${selectedAgent.id}/search`, {
        query: searchQuery,
        limit: 10,
        threshold: 0.0,
        include_importance: true
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching memories:', err);
      showNotification('Failed to search memories', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!selectedAgent) return;
    
    try {
      await axios.delete(`/api/memory/${selectedAgent.id}/${memoryId}`);
      
      // Refresh memories
      const memoriesResponse = await axios.get(`/api/memory/${selectedAgent.id}`);
      setMemories(memoriesResponse.data);
      
      // Refresh stats
      const statsResponse = await axios.get(`/api/memory/${selectedAgent.id}/stats`);
      setMemoryStats(statsResponse.data);
      
      showNotification('Memory deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting memory:', err);
      showNotification('Failed to delete memory', 'error');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await axios.delete(`/api/agents/${agentId}`);
      
      // Refresh agents
      fetchAgents();
      
      // If the deleted agent was selected, clear selection
      if (selectedAgent && selectedAgent.id === agentId) {
        setSelectedAgent(null);
        setMemories([]);
        setMemoryStats(null);
      }
      
      showNotification('Agent deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting agent:', err);
      showNotification('Failed to delete agent', 'error');
    }
  };

  const handleSwitchAgent = async (agentId: string) => {
    try {
      await axios.post(`/api/agents/${agentId}/switch`);
      showNotification('Switched active agent successfully', 'success');
    } catch (err) {
      console.error('Error switching agent:', err);
      showNotification('Failed to switch agent', 'error');
    }
  };

  const handleClearMemories = async () => {
    if (!selectedAgent) return;
    
    try {
      await axios.post(`/api/memory/${selectedAgent.id}/clear`);
      
      // Refresh memories
      setMemories([]);
      
      // Refresh stats
      const statsResponse = await axios.get(`/api/memory/${selectedAgent.id}/stats`);
      setMemoryStats(statsResponse.data);
      
      showNotification('Memories cleared successfully', 'success');
    } catch (err) {
      console.error('Error clearing memories:', err);
      showNotification('Failed to clear memories', 'error');
    }
  };

  const handleRebuildIndex = async () => {
    if (!selectedAgent) return;
    
    try {
      await axios.post(`/api/memory/${selectedAgent.id}/rebuild-index`);
      
      // Refresh stats
      const statsResponse = await axios.get(`/api/memory/${selectedAgent.id}/stats`);
      setMemoryStats(statsResponse.data);
      
      showNotification('Memory index rebuilt successfully', 'success');
    } catch (err) {
      console.error('Error rebuilding index:', err);
      showNotification('Failed to rebuild memory index', 'error');
    }
  };

  const handleUpdateSystemPrompt = async (systemPrompt: string) => {
    if (!selectedAgent) return;
    
    try {
      const response = await axios.put(`/api/agents/${selectedAgent.id}`, {
        system_prompt: systemPrompt
      });
      
      // Update selected agent
      setSelectedAgent(response.data);
      
      // Refresh agents list
      fetchAgents();
      
      showNotification('System prompt updated successfully', 'success');
    } catch (err) {
      console.error('Error updating system prompt:', err);
      showNotification('Failed to update system prompt', 'error');
    }
  };

  const handleUpdateAgentSettings = async () => {
    if (!selectedAgent) return;
    
    setEditingAgentSettings(true);
    
    try {
      const response = await axios.put(`/api/agents/${selectedAgent.id}`, {
        settings: {
          ...selectedAgent.settings,
          ...agentSettings
        }
      });
      
      // Update selected agent
      setSelectedAgent(response.data);
      
      // Refresh agents list
      fetchAgents();
      
      showNotification('Agent settings updated successfully', 'success');
    } catch (err) {
      console.error('Error updating agent settings:', err);
      showNotification('Failed to update agent settings', 'error');
    } finally {
      setEditingAgentSettings(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    
    // Set up polling to refresh agent list periodically
    const intervalId = setInterval(() => {
      fetchAgents();
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchAgents]);
  
  useEffect(() => {
    if (selectedAgent) {
      setAgentSettings({
        context_window: selectedAgent.settings?.context_window || 4000,
        temperature: selectedAgent.settings?.temperature || 0.7,
        memory_usage: selectedAgent.settings?.memory_usage || 0.5,
        retrieval_strength: selectedAgent.settings?.retrieval_strength || 0.7,
        max_tokens: selectedAgent.settings?.max_tokens || 1000,
      });
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentDetails(selectedAgent.id);
    }
  }, [selectedAgent, fetchAgentDetails]);

  const renderAgentsList = () => (
    <Paper sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Agents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => setCreateAgentDialogOpen(true)}
        >
          Create
        </Button>
      </Box>
      <Divider />
      <List>
        {agents.map((agent) => (
          <ListItem
            key={agent.id}
            component="div"
            sx={{ 
              cursor: 'pointer',
              bgcolor: selectedAgent?.id === agent.id ? 'action.selected' : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
              pr: 8 // Add padding to the right to make room for the action icon
            }}
            onClick={() => {
              setSelectedAgent(agent);
              fetchAgentDetails(agent.id);
            }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAgent(agent.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary={agent.name}
              secondary={`Memories: ${agent.memory_count} · Conversations: ${agent.conversation_count}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const renderAgentDetails = () => {
    if (!selectedAgent) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography>Select an agent to view details</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="agent details tabs">
            <Tab label="Overview" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Memories" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Search" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="Settings" id="tab-3" aria-controls="tabpanel-3" />
          </Tabs>
        </Box>

        <TabPanel index={0} value={tab}>
          {/* Overview Tab */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {selectedAgent.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Created: {new Date(selectedAgent.created_at).toLocaleString()}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<StarIcon />}
              onClick={() => handleSwitchAgent(selectedAgent.id)}
              sx={{ mr: 1, mt: 1 }}
            >
              Make Active
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>System Prompt</Typography>
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedAgent.system_prompt}
            </Typography>
          </Paper>

          <Typography variant="h6" gutterBottom>Memory Stats</Typography>
          {memoryStats ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">{memoryStats.total_count}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Memories</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">{memoryStats.avg_importance.toFixed(2)}</Typography>
                    <Typography variant="body2" color="text.secondary">Avg. Importance</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">
                      {memoryStats.embedding_stats.vector_dimension || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Vector Dimension</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">
                      {memoryStats.embedding_stats.index_size || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Index Size</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">No memory stats available</Typography>
          )}

          {memoryStats && memoryStats.source_distribution && Object.keys(memoryStats.source_distribution).length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Source Distribution</Typography>
              <Grid container spacing={1}>
                {Object.entries(memoryStats.source_distribution).map(([source, count]) => (
                  <Grid item key={source}>
                    <Chip 
                      label={`${source}: ${count}`} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </TabPanel>

        <TabPanel index={1} value={tab}>
          {/* Memories Tab */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Agent Memories</Typography>
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={() => fetchAgentDetails(selectedAgent.id)}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setCreateMemoryDialogOpen(true)}
              >
                Add Memory
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="warning"
              onClick={handleClearMemories}
              size="small"
            >
              Clear All Memories
            </Button>
            <Button 
              variant="outlined"
              onClick={handleRebuildIndex}
              size="small"
            >
              Rebuild Index
            </Button>
          </Box>

          {memories.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No memories found for this agent
            </Typography>
          ) : (
            <List>
              {memories.map((memory) => (
                <Paper key={memory.id} sx={{ mb: 2, overflow: 'hidden' }}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {new Date(memory.created_at).toLocaleString()}
                      </Typography>
                      <Box>
                        <Chip 
                          label={memory.source} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={`Importance: ${memory.importance.toFixed(2)}`}
                          size="small"
                          color={memory.importance > 0.7 ? 'error' : memory.importance > 0.4 ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {memory.content}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteMemory(memory.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel index={2} value={tab}>
          {/* Search Tab */}
          <Typography variant="h6" gutterBottom>Search Memories</Typography>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              label="Search Query"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button 
              variant="contained"
              onClick={handleSearchMemories}
              disabled={searchLoading || !searchQuery.trim()}
            >
              {searchLoading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>

          {searchResults.length > 0 ? (
            <List>
              {searchResults.map((memory) => (
                <Paper key={memory.id} sx={{ mb: 2, overflow: 'hidden' }}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {new Date(memory.created_at).toLocaleString()}
                      </Typography>
                      <Box>
                        <Chip 
                          label={memory.source} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={`Importance: ${memory.importance.toFixed(2)}`}
                          size="small"
                          color={memory.importance > 0.7 ? 'error' : memory.importance > 0.4 ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {memory.content}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </List>
          ) : searchQuery && !searchLoading ? (
            <Typography variant="body2" color="text.secondary">
              No matching memories found
            </Typography>
          ) : null}
        </TabPanel>

        <TabPanel index={3} value={tab}>
          <Typography variant="h6" gutterBottom>Agent Settings</Typography>
          
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">System Prompt</Typography>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => setEditPromptDialogOpen(true)}
              >
                Edit Prompt
              </Button>
            </Box>
            
            <Paper sx={{ p: 2, backgroundColor: 'background.paper', mb: 2, maxHeight: '200px', overflow: 'auto' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedAgent.system_prompt || 'No system prompt defined.'}
              </Typography>
            </Paper>
            
            <Typography variant="caption" color="text.secondary">
              The system prompt defines the agent&apos;s personality, capabilities, and behavior. It provides context for how the agent should respond to user inputs.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Context and Generation Settings</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Context Window: {agentSettings.context_window}</Typography>
                <Box sx={{ px: 2, mb: 3 }}>
                  <Slider
                    min={1000}
                    max={16000}
                    step={1000}
                    value={agentSettings.context_window}
                    onChange={(_, value) => setAgentSettings({
                      ...agentSettings,
                      context_window: value as number
                    })}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 1000, label: '1K' },
                      { value: 8000, label: '8K' },
                      { value: 16000, label: '16K' }
                    ]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    The number of tokens the agent can consider when generating responses.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Temperature: {agentSettings.temperature.toFixed(2)}</Typography>
                <Box sx={{ px: 2, mb: 3 }}>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={agentSettings.temperature}
                    onChange={(_, value) => setAgentSettings({
                      ...agentSettings,
                      temperature: value as number
                    })}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0, label: 'Precise' },
                      { value: 0.5, label: 'Balanced' },
                      { value: 1, label: 'Creative' }
                    ]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Controls randomness in responses. Lower values produce more deterministic outputs.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Memory Usage: {agentSettings.memory_usage.toFixed(2)}</Typography>
                <Box sx={{ px: 2, mb: 3 }}>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={agentSettings.memory_usage}
                    onChange={(_, value) => setAgentSettings({
                      ...agentSettings,
                      memory_usage: value as number
                    })}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0, label: 'Less' },
                      { value: 0.5, label: 'Balanced' },
                      { value: 1, label: 'More' }
                    ]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Controls how much the agent relies on past memories for context.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Retrieval Strength: {agentSettings.retrieval_strength.toFixed(2)}</Typography>
                <Box sx={{ px: 2, mb: 3 }}>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={agentSettings.retrieval_strength}
                    onChange={(_, value) => setAgentSettings({
                      ...agentSettings,
                      retrieval_strength: value as number
                    })}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0, label: 'Loose' },
                      { value: 0.5, label: 'Balanced' },
                      { value: 1, label: 'Strict' }
                    ]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Controls how strict the relevance threshold is for retrieving memories.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Max Tokens: {agentSettings.max_tokens}</Typography>
                <Box sx={{ px: 2, mb: 3 }}>
                  <Slider
                    min={500}
                    max={8000}
                    step={500}
                    value={agentSettings.max_tokens}
                    onChange={(_, value) => setAgentSettings({
                      ...agentSettings,
                      max_tokens: value as number
                    })}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 500, label: '500' },
                      { value: 4000, label: '4K' },
                      { value: 8000, label: '8K' }
                    ]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    The maximum number of tokens the agent can generate in a single response.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleUpdateAgentSettings}
                disabled={editingAgentSettings}
                startIcon={editingAgentSettings ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                Save Settings
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Agent Details</Typography>
            
            <TextField
              label="Agent Name"
              fullWidth
              value={selectedAgent.name}
              sx={{ mb: 2 }}
              disabled
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(selectedAgent.created_at).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {selectedAgent.id}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Memory Management</Typography>
            
            <Button 
              variant="outlined" 
              color="warning"
              onClick={handleClearMemories}
              sx={{ mr: 1 }}
            >
              Clear All Memories
            </Button>
            <Button 
              variant="outlined"
              onClick={handleRebuildIndex}
            >
              Rebuild Index
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Danger Zone</Typography>
            
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => handleDeleteAgent(selectedAgent.id)}
            >
              Delete Agent
            </Button>
          </Box>
        </TabPanel>
      </Box>
    );
  };

  // Add the tab change handler
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <AppLayout>
      <MainLayout leftSidebar={<div />} rightSidebar={<div />}>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Agent Dashboard
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ height: 'calc(100vh - 160px)' }}>
              <Grid item xs={12} md={3}>
                {renderAgentsList()}
              </Grid>
              <Grid item xs={12} md={9} sx={{ height: '100%' }}>
                {renderAgentDetails()}
              </Grid>
            </Grid>
          )}
          
          {/* Create Agent Dialog */}
          <CreateAgentDialog
            open={createAgentDialogOpen}
            onClose={() => setCreateAgentDialogOpen(false)}
            onAgentCreated={fetchAgents}
          />
          
          {/* Create Memory Dialog */}
          {selectedAgent && (
            <CreateMemoryDialog
              agentId={selectedAgent.id}
              open={createMemoryDialogOpen}
              onClose={() => setCreateMemoryDialogOpen(false)}
              onMemoryCreated={() => fetchAgentDetails(selectedAgent.id)}
            />
          )}
          
          {/* Edit System Prompt Dialog */}
          {selectedAgent && (
            <EditSystemPromptDialog
              agent={selectedAgent}
              open={editPromptDialogOpen}
              onClose={() => setEditPromptDialogOpen(false)}
              onSave={handleUpdateSystemPrompt}
            />
          )}
          
          {/* Notification Snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
          >
            <Alert 
              onClose={handleCloseNotification} 
              severity={notification.severity}
              elevation={6}
              variant="filled"
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </MainLayout>
    </AppLayout>
  );
} 