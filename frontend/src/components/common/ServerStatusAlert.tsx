import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button, 
  CircularProgress, 
  Collapse, 
  Paper,
  Typography,
  Stack 
} from '@mui/material';
import { useServerStatus } from '@/contexts/ServerStatusContext';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorIcon from '@mui/icons-material/Error';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const ServerStatusAlert: React.FC = () => {
  const { 
    isServerAvailable, 
    isSocketConnected, 
    isCheckingStatus, 
    serverError, 
    checkServerStatus 
  } = useServerStatus();
  
  const [showAlert, setShowAlert] = useState(false);
  
  // Delay showing the alert to prevent flashing on initial load
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isServerAvailable || !isSocketConnected) {
      // Only show the alert after a delay to avoid flash on initial connection
      timeoutId = setTimeout(() => {
        setShowAlert(true);
      }, 3000);
    } else {
      setShowAlert(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isServerAvailable, isSocketConnected]);
  
  // Don't show if everything is working
  if ((isServerAvailable && isSocketConnected && !serverError) || !showAlert) {
    return null;
  }
  
  const handleRetry = () => {
    checkServerStatus().catch(console.error);
  };
  
  const handleDismiss = () => {
    setShowAlert(false);
  };

  const getStatusText = () => {
    if (!isServerAvailable) {
      return "The backend API server is not responding. Real-time features such as chat are unavailable until the server is running.";
    }
    if (!isSocketConnected && isServerAvailable) {
      return "Connected to API server but real-time features are limited. You can still use the app, but message streaming may be delayed.";
    }
    if (serverError) {
      return `Connection issue: ${serverError}`;
    }
    return "Checking connection status...";
  };
  
  return (
    <Collapse in={showAlert}>
      <Paper 
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          maxWidth: 500,
          margin: '0 auto',
          zIndex: 9999,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Alert 
          severity={isCheckingStatus ? 'info' : !isServerAvailable ? 'error' : !isSocketConnected ? 'warning' : 'error'}
          icon={
            isCheckingStatus ? <CircularProgress size={20} /> : 
            !isServerAvailable ? <ErrorIcon /> : 
            !isSocketConnected ? <SignalWifiOffIcon /> : 
            <WarningIcon />
          }
          action={
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={handleDismiss}
              aria-label="close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiAlert-icon': {
              alignItems: 'center',
            }
          }}
        >
          <AlertTitle>
            {isCheckingStatus ? 'Checking connection...' : 
             !isServerAvailable ? 'Backend server unavailable' : 
             !isSocketConnected ? 'Limited connectivity' : 
             'Connection issue'}
          </AlertTitle>
          
          <Box>
            <Typography variant="body2" component="p" sx={{ mb: 1 }}>
              {getStatusText()}
            </Typography>
            
            {/* Only show buttons if there's an actual problem */}
            {(!isServerAvailable || !isSocketConnected) && (
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button 
                  variant="contained"
                  color={!isServerAvailable ? "error" : "primary"} 
                  size="small" 
                  onClick={handleRetry}
                  disabled={isCheckingStatus}
                  startIcon={isCheckingStatus ? <CircularProgress size={16} /> : <RefreshIcon />}
                >
                  {isCheckingStatus ? 'Checking...' : 'Check Connection'}
                </Button>
                
                {!isServerAvailable && (
                  <Button 
                    variant="outlined"
                    color="inherit" 
                    size="small" 
                    component="a"
                    href="https://github.com/yourusername/Aura-app#running-the-backend"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Backend Documentation
                  </Button>
                )}
              </Stack>
            )}
          </Box>
        </Alert>
      </Paper>
    </Collapse>
  );
};

export default ServerStatusAlert; 