import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MarkdownRenderer from '../chat/MarkdownRenderer';
import { useSettings } from '@/contexts/SettingsContext';

interface StreamingVisualizerProps {
  isLoading?: boolean;
  content?: string;
  /** @deprecated - Not currently used but kept for future implementation */
  highlightKeywords?: boolean;
  /** @deprecated - Not currently used but kept for future implementation */
  codeBlocks?: boolean;
  height?: string;
  showRawOutput?: boolean;
}

export default function StreamingVisualizer({
  isLoading = false,
  content = '',
  height = '400px',
  showRawOutput = false,
}: StreamingVisualizerProps) {
  const { debugStreams } = useSettings();
  const [activeTab, setActiveTab] = useState(0);
  const [showRawOutputState, setShowRawOutput] = useState(showRawOutput);

  useEffect(() => {
    setShowRawOutput(showRawOutput);
  }, [showRawOutput]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const displayRawOutput = showRawOutput || showRawOutputState;

  const renderStreamContent = (tabContent: string) => {
    const displayContent = content || tabContent;
    
    if (isLoading && displayContent === '') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" size={40} />
        </Box>
      );
    }

    if (!displayContent) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography color="text.secondary">No streaming data available</Typography>
        </Box>
      );
    }

    if (displayRawOutput) {
      return (
        <Box
          component="pre"
          sx={{
            backgroundColor: 'rgba(0,0,0,0.1)',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: height,
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          }}
        >
          {displayContent}
        </Box>
      );
    }

    return (
      <Box sx={{ maxHeight: height, overflow: 'auto' }}>
        <MarkdownRenderer content={displayContent} />
      </Box>
    );
  };

  // Helper function to display the stream status
  const getStreamStatus = (content: string) => {
    if (isLoading) {
      return (
        <Chip 
          label="Streaming..." 
          color="primary" 
          size="small" 
          variant="outlined" 
          icon={<CircularProgress size={10} color="inherit" />} 
          sx={{ height: '20px', '& .MuiChip-label': { fontSize: '10px', px: 0.5 } }}
        />
      );
    }
    if (!content) {
      return (
        <Chip 
          label="No data" 
          color="default" 
          size="small" 
          variant="outlined" 
          sx={{ height: '20px', '& .MuiChip-label': { fontSize: '10px', px: 0.5 } }}
        />
      );
    }
    return (
      <Chip 
        label="Complete" 
        color="success" 
        size="small" 
        variant="outlined" 
        sx={{ height: '20px', '& .MuiChip-label': { fontSize: '10px', px: 0.5 } }}
      />
    );
  };

  return (
    <Card 
      elevation={content ? 0 : 3}
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        border: content ? 'none' : '1px solid',
        borderColor: 'divider',
        background: 'rgba(30, 30, 30, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {!content && (
        <>
          <CardHeader 
            title="Agent Streaming Debug" 
            action={
              <FormControlLabel
                control={
                  <Switch 
                    checked={showRawOutput} 
                    onChange={(e) => setShowRawOutput(e.target.checked)} 
                    size="small"
                  />
                }
                label="Raw Output"
              />
            }
            sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              '& .MuiCardHeader-title': {
                fontSize: '1rem',
                fontWeight: 'bold',
              }
            }}
          />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{
                minHeight: '48px',
                '& .MuiTab-root': {
                  minHeight: '48px',
                  padding: '8px 12px',
                  fontSize: '12px',
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    flexDirection: 'column',
                    minWidth: '80px',
                  }}>
                    <Typography variant="caption" noWrap>Orchestrator</Typography>
                    {getStreamStatus(debugStreams.orchestrator)}
                  </Box>
                }
                id="orchestrator-tab"
                aria-controls="orchestrator-panel"
              />
              <Tab 
                label={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    flexDirection: 'column',
                    minWidth: '80px',
                  }}>
                    <Typography variant="caption" noWrap>Reasoning</Typography>
                    {getStreamStatus(debugStreams.reasoning)}
                  </Box>
                }
                id="reasoning-tab"
                aria-controls="reasoning-panel"
              />
              <Tab 
                label={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    flexDirection: 'column',
                    minWidth: '80px',
                  }}>
                    <Typography variant="caption" noWrap>Gemini</Typography>
                    {getStreamStatus(debugStreams.gemini)}
                  </Box>
                }
                id="gemini-tab"
                aria-controls="gemini-panel"
              />
            </Tabs>
          </Box>
        </>
      )}

      <CardContent sx={{ p: content ? 0 : undefined }}>
        {content ? (
          // If direct content is provided, render it directly without extra padding
          <Box>
            {renderStreamContent(content)}
          </Box>
        ) : (
          // Otherwise, use tabs
          <>
            <Box
              role="tabpanel"
              hidden={activeTab !== 0}
              id="orchestrator-panel"
              aria-labelledby="orchestrator-tab"
              sx={{ p: 3 }}
            >
              {renderStreamContent(debugStreams.orchestrator)}
            </Box>
            
            <Box
              role="tabpanel"
              hidden={activeTab !== 1}
              id="reasoning-panel"
              aria-labelledby="reasoning-tab"
              sx={{ p: 3 }}
            >
              {renderStreamContent(debugStreams.reasoning)}
            </Box>
            
            <Box
              role="tabpanel"
              hidden={activeTab !== 2}
              id="gemini-panel"
              aria-labelledby="gemini-tab"
              sx={{ p: 3 }}
            >
              {renderStreamContent(debugStreams.gemini)}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
} 