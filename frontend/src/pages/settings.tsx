import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  CircularProgress,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Link from 'next/link';
import GoldenGlow from '@/components/common/GoldenGlow';
import { useSettings, LLMProvider } from '@/contexts/SettingsContext';

// Define TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { 
    modelConfig, 
    updateModelConfig, 
    updateApiKey,
    resetModelConfig, 
    saveConfig,
    isLoading,
    error,
    availableModels,
  } = useSettings();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [tabValue, setTabValue] = useState(0);
  
  // State to store the current system prompts
  const [systemPrompts, setSystemPrompts] = useState({
    mistral: modelConfig.clientConfigs?.mistral?.systemPrompt || "",
    gemini: modelConfig.clientConfigs?.gemini?.systemPrompt || "",
    qwq: modelConfig.clientConfigs?.qwq?.systemPrompt || ""
  });
  
  // Effect to update system prompts whenever modelConfig changes
  useEffect(() => {
    setSystemPrompts({
      mistral: modelConfig.clientConfigs?.mistral?.systemPrompt || "",
      gemini: modelConfig.clientConfigs?.gemini?.systemPrompt || "",
      qwq: modelConfig.clientConfigs?.qwq?.systemPrompt || ""
    });
    
    // Log the actual prompts to help with debugging
    console.log('Current system prompts:', {
      mistral: modelConfig.clientConfigs?.mistral?.systemPrompt,
      gemini: modelConfig.clientConfigs?.gemini?.systemPrompt,
      qwq: modelConfig.clientConfigs?.qwq?.systemPrompt
    });
  }, [modelConfig]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle config changes
  const handleChange = <K extends keyof typeof modelConfig>(field: K, value: typeof modelConfig[K]) => {
    updateModelConfig(field, value);
  };

  // Handle provider change
  const handleProviderChange = (provider: LLMProvider) => {
    // Update provider and set default model for the selected provider
    updateModelConfig('provider', provider);
    updateModelConfig('model', availableModels[provider][0]);
  };

  // Reset to defaults
  const handleReset = () => {
    resetModelConfig();
    setSnackbar({
      open: true,
      message: 'Settings reset to defaults',
      severity: 'success',
    });
  };

  // Save settings
  const handleSave = async () => {
    const success = await saveConfig();
    
    setSnackbar({
      open: true,
      message: success ? 'Settings saved successfully' : 'Failed to save settings',
      severity: success ? 'success' : 'error',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle system prompt changes
  const handleSystemPromptChange = (client: string, value: string) => {
    setSystemPrompts(prev => ({
      ...prev,
      [client]: value
    }));
    
    const updatedConfigs = {
      ...modelConfig.clientConfigs,
      [client]: {
        ...modelConfig.clientConfigs?.[client],
        systemPrompt: value
      }
    };
    
    handleChange('clientConfigs', updatedConfigs);
  };

  // Get models for current provider
  const currentProviderModels = availableModels[modelConfig.provider] || [];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      {/* Golden glow effects */}
      <GoldenGlow position="top-right" size="35vw" opacity={0.15} />
      <GoldenGlow position="bottom-left" size="25vw" opacity={0.1} />

      {/* Header */}
      <Box
        component="header"
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton component={Link} href="/" aria-label="back to home" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, #f5cc7f 0%, #c09c58 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Settings
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Reset to defaults">
            <IconButton onClick={handleReset} sx={{ mr: 1 }} disabled={isLoading}>
              <RestoreIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={24} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Model Selection" />
            <Tab label="Generation Parameters" />
            <Tab label="System Prompts" />
            <Tab label="Features" />
            <Tab label="Advanced" />
          </Tabs>
        </Box>

        {/* Model Selection Tab */}
        <TabPanel value={tabValue} index={0}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              mb: 3,
            }}
          >
            <CardHeader
              title="Provider Selection"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                    <InputLabel id="provider-select-label">Primary AI Provider</InputLabel>
                    <Select
                      labelId="provider-select-label"
                      id="provider-select"
                      value={modelConfig.provider}
                      onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
                      label="Primary AI Provider"
                    >
                      <MenuItem value="mistral">Mistral AI</MenuItem>
                      <MenuItem value="openrouter">OpenRouter (QwQ)</MenuItem>
                      <MenuItem value="gemini">Google Gemini</MenuItem>
                      <MenuItem value="ollama">Ollama (Local)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                    <InputLabel id="model-select-label">AI Model</InputLabel>
                    <Select
                      labelId="model-select-label"
                      id="model-select"
                      value={modelConfig.model}
                      onChange={(e) => handleChange('model', e.target.value as typeof modelConfig['model'])}
                      label="AI Model"
                    >
                      {currentProviderModels.map((model) => (
                        <MenuItem key={model} value={model}>
                          {model}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={`API Key for ${modelConfig.provider.charAt(0).toUpperCase() + modelConfig.provider.slice(1)}`}
                    variant="outlined"
                    value={modelConfig.apiKeys[modelConfig.provider] || ''}
                    onChange={(e) => updateApiKey(modelConfig.provider, e.target.value)}
                    type="password"
                    sx={{ mb: 2 }}
                    helperText={`API key for ${modelConfig.provider} provider`}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Gemini Client Configuration */}
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              mb: 3,
            }}
          >
            <CardHeader
              title="Gemini Client Configuration"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                    <InputLabel id="gemini-model-label">Gemini Model</InputLabel>
                    <Select
                      labelId="gemini-model-label"
                      id="gemini-model-select"
                      value={modelConfig.clientConfigs?.gemini?.model || 'gemini-pro'}
                      onChange={(e) => {
                        const value = e.target.value as string;
                        const updatedConfigs = {
                          ...modelConfig.clientConfigs,
                          gemini: {
                            ...modelConfig.clientConfigs?.gemini,
                            model: value
                          }
                        };
                        handleChange('clientConfigs', updatedConfigs);
                      }}
                      label="Gemini Model"
                    >
                      {availableModels.gemini.map((model) => (
                        <MenuItem key={model} value={model}>
                          {model}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Gemini Context Window Size</Typography>
                    <Tooltip title="Maximum number of tokens for Gemini context (up to 1M)">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={modelConfig.clientConfigs?.gemini?.contextWindow || 1000000}
                    onChange={(_, value) => {
                      const updatedConfigs = {
                        ...modelConfig.clientConfigs,
                        gemini: {
                          ...modelConfig.clientConfigs?.gemini,
                          contextWindow: value as number
                        }
                      };
                      handleChange('clientConfigs', updatedConfigs);
                    }}
                    valueLabelDisplay="auto"
                    step={100000}
                    marks={[
                      { value: 100000, label: '100K' },
                      { value: 500000, label: '500K' },
                      { value: 1000000, label: '1M' },
                    ]}
                    min={100000}
                    max={1000000}
                    sx={{
                      color: 'primary.main',
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(245, 204, 127, 0.16)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Gemini System Prompt"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={modelConfig.clientConfigs?.gemini?.systemPrompt || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const updatedConfigs = {
                        ...modelConfig.clientConfigs,
                        gemini: {
                          ...modelConfig.clientConfigs?.gemini,
                          systemPrompt: value
                        }
                      };
                      handleChange('clientConfigs', updatedConfigs);
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* QwQ Client Configuration */}
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              mb: 3,
            }}
          >
            <CardHeader
              title="QwQ Client Configuration (OpenRouter)"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                    <InputLabel id="qwq-model-label">QwQ Model</InputLabel>
                    <Select
                      labelId="qwq-model-label"
                      id="qwq-model-select"
                      value={modelConfig.clientConfigs?.qwq?.model || 'claude-3-opus'}
                      onChange={(e) => {
                        const value = e.target.value as string;
                        const updatedConfigs = {
                          ...modelConfig.clientConfigs,
                          qwq: {
                            ...modelConfig.clientConfigs?.qwq,
                            model: value
                          }
                        };
                        handleChange('clientConfigs', updatedConfigs);
                      }}
                      label="QwQ Model"
                    >
                      {availableModels.openrouter.map((model) => (
                        <MenuItem key={model} value={model}>
                          {model}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">QwQ Context Window Size</Typography>
                    <Tooltip title="Maximum number of tokens for QwQ context (up to 128K)">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={modelConfig.clientConfigs?.qwq?.contextWindow || 128000}
                    onChange={(_, value) => {
                      const updatedConfigs = {
                        ...modelConfig.clientConfigs,
                        qwq: {
                          ...modelConfig.clientConfigs?.qwq,
                          contextWindow: value as number
                        }
                      };
                      handleChange('clientConfigs', updatedConfigs);
                    }}
                    valueLabelDisplay="auto"
                    step={16000}
                    marks={[
                      { value: 32000, label: '32K' },
                      { value: 64000, label: '64K' },
                      { value: 128000, label: '128K' },
                    ]}
                    min={16000}
                    max={128000}
                    sx={{
                      color: 'primary.main',
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(245, 204, 127, 0.16)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="QwQ System Prompt"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={modelConfig.clientConfigs?.qwq?.systemPrompt || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const updatedConfigs = {
                        ...modelConfig.clientConfigs,
                        qwq: {
                          ...modelConfig.clientConfigs?.qwq,
                          systemPrompt: value
                        }
                      };
                      handleChange('clientConfigs', updatedConfigs);
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Mistral Client Configuration */}
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              mb: 3,
            }}
          >
            <CardHeader
              title="Mistral Client Configuration"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                    <InputLabel id="mistral-model-label">Mistral Model</InputLabel>
                    <Select
                      labelId="mistral-model-label"
                      id="mistral-model-select"
                      value={modelConfig.clientConfigs?.mistral?.model || 'mistral-medium'}
                      onChange={(e) => {
                        const value = e.target.value as string;
                        const updatedConfigs = {
                          ...modelConfig.clientConfigs,
                          mistral: {
                            ...modelConfig.clientConfigs?.mistral,
                            model: value
                          }
                        };
                        handleChange('clientConfigs', updatedConfigs);
                      }}
                      label="Mistral Model"
                    >
                      {availableModels.mistral.map((model) => (
                        <MenuItem key={model} value={model}>
                          {model}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Mistral Context Window Size</Typography>
                    <Tooltip title="Maximum number of tokens for Mistral context (up to 32K)">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={modelConfig.clientConfigs?.mistral?.contextWindow || 32000}
                    onChange={(_, value) => {
                      const updatedConfigs = {
                        ...modelConfig.clientConfigs,
                        mistral: {
                          ...modelConfig.clientConfigs?.mistral,
                          contextWindow: value as number
                        }
                      };
                      handleChange('clientConfigs', updatedConfigs);
                    }}
                    valueLabelDisplay="auto"
                    step={4000}
                    marks={[
                      { value: 8000, label: '8K' },
                      { value: 16000, label: '16K' },
                      { value: 32000, label: '32K' },
                    ]}
                    min={4000}
                    max={32000}
                    sx={{
                      color: 'primary.main',
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(245, 204, 127, 0.16)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mistral System Prompt"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={modelConfig.clientConfigs?.mistral?.systemPrompt || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const updatedConfigs = {
                        ...modelConfig.clientConfigs,
                        mistral: {
                          ...modelConfig.clientConfigs?.mistral,
                          systemPrompt: value
                        }
                      };
                      handleChange('clientConfigs', updatedConfigs);
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Generation Parameters Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardHeader
              title="Generation Parameters"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Temperature</Typography>
                  <Tooltip title="Controls randomness: lower values are more focused, higher values more creative">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    Precise
                  </Typography>
                  <Slider
                    value={modelConfig.temperature}
                    onChange={(_, value) => handleChange('temperature', value as typeof modelConfig['temperature'])}
                    valueLabelDisplay="auto"
                    step={0.1}
                    min={0}
                    max={1}
                    sx={{ mx: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Creative
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Top P</Typography>
                  <Tooltip title="Controls diversity of responses by limiting the token selection pool">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={modelConfig.topP}
                  onChange={(_, value) => handleChange('topP', value as typeof modelConfig['topP'])}
                  valueLabelDisplay="auto"
                  step={0.05}
                  min={0.1}
                  max={1}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Maximum Response Length</Typography>
                  <Tooltip title="Maximum number of tokens in the generated response">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={modelConfig.maxTokens}
                  onChange={(_, value) => handleChange('maxTokens', value as typeof modelConfig['maxTokens'])}
                  valueLabelDisplay="auto"
                  step={256}
                  marks={[
                    { value: 256, label: '256' },
                    { value: 1024, label: '1K' },
                    { value: 2048, label: '2K' },
                    { value: 4096, label: '4K' },
                  ]}
                  min={256}
                  max={4096}
                />
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* System Prompts Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              mb: 3,
            }}
          >
            <CardHeader
              title="System Prompts Configuration"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                These are the actual system prompts currently being used for each AI provider in the application. Customize these to control how each component behaves.
              </Typography>
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Mistral System Prompt */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        Mistral System Prompt
                      </Typography>
                      <Chip 
                        label="Orchestrator" 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ ml: 2, fontSize: '0.7rem' }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Controls the orchestrator component that manages conversation flow, memory retrieval, and context.
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={systemPrompts.mistral}
                      onChange={(e) => handleSystemPromptChange('mistral', e.target.value)}
                      variant="outlined"
                      placeholder="Enter system prompt for Mistral..."
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.4)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.6)',
                          },
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Gemini System Prompt */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        Gemini System Prompt
                      </Typography>
                      <Chip 
                        label="Expression Layer" 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                        sx={{ ml: 2, fontSize: '0.7rem' }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Controls the expression layer that generates the final response with proper tone and formatting.
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={systemPrompts.gemini}
                      onChange={(e) => handleSystemPromptChange('gemini', e.target.value)}
                      variant="outlined"
                      placeholder="Enter system prompt for Gemini..."
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.4)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.6)',
                          },
                        }
                      }}
                    />
                  </Box>
                  
                  {/* QwQ System Prompt */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        QwQ System Prompt
                      </Typography>
                      <Chip 
                        label="Reasoning Layer" 
                        size="small" 
                        color="info" 
                        variant="outlined" 
                        sx={{ ml: 2, fontSize: '0.7rem' }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Controls the reasoning layer that performs deep analysis and generates thoughtful content.
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={systemPrompts.qwq}
                      onChange={(e) => handleSystemPromptChange('qwq', e.target.value)}
                      variant="outlined"
                      placeholder="Enter system prompt for QwQ..."
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.4)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgba(245, 204, 127, 0.6)',
                          },
                        }
                      }}
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Features Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardHeader
              title="Features"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={modelConfig.enableMemory}
                        onChange={(e) => handleChange('enableMemory', e.target.checked as typeof modelConfig['enableMemory'])}
                        color="primary"
                      />
                    }
                    label="Memory System"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Enables long-term memory and retrieval
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={modelConfig.enableReflection}
                        onChange={(e) => handleChange('enableReflection', e.target.checked as typeof modelConfig['enableReflection'])}
                        color="primary"
                      />
                    }
                    label="Reflection System"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Agent learns from past interactions
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={modelConfig.enableEmotions}
                        onChange={(e) => handleChange('enableEmotions', e.target.checked as typeof modelConfig['enableEmotions'])}
                        color="primary"
                      />
                    }
                    label="Emotional Intelligence"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Agent can track emotions and adapt responses
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={modelConfig.enableTools}
                        onChange={(e) => handleChange('enableTools', e.target.checked as typeof modelConfig['enableTools'])}
                        color="primary"
                      />
                    }
                    label="Tool Integration"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Enable tools like web search, code execution, etc.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={modelConfig.enableStreaming}
                        onChange={(e) => handleChange('enableStreaming', e.target.checked as typeof modelConfig['enableStreaming'])}
                        color="primary"
                      />
                    }
                    label="Streaming Responses"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    See responses as they&apos;re generated
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Advanced Tab */}
        <TabPanel value={tabValue} index={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardHeader
              title="Advanced Settings"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Agent Name"
                    variant="outlined"
                    value={modelConfig.agentName || ''}
                    onChange={(e) => handleChange('agentName', e.target.value as typeof modelConfig['agentName'])}
                    helperText="Customize the name of your AI companion"
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="System Prompt"
                    variant="outlined"
                    value={modelConfig.systemPrompt || ''}
                    onChange={(e) => handleChange('systemPrompt', e.target.value as typeof modelConfig['systemPrompt'])}
                    multiline
                    rows={4}
                    helperText="Customize the system prompt that defines your agent's behavior"
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Configuration Context
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Your settings are applied to our three-tier cognitive architecture:
                  </Alert>
                  <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Typography variant="subtitle2">1. Orchestrator (Mistral)</Typography>
                    <Typography variant="body2">
                      Handles memory retrieval and query routing. Optimized for low latency.
                    </Typography>
                  </Card>
                  <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Typography variant="subtitle2">2. Reasoning Layer (QwQ via OpenRouter)</Typography>
                    <Typography variant="body2">
                      Two-phase reasoning process that incorporates memory and produces thoughtful analysis.
                    </Typography>
                  </Card>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2">3. Agent Layer (Gemini)</Typography>
                    <Typography variant="body2">
                      Provides the final response with appropriate emotional tone and personality.
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          p: 3,
          borderTop: 1,
          borderColor: 'divider',
          textAlign: 'center',
          mt: 'auto',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Aura AI Assistant. All rights reserved.
        </Typography>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 