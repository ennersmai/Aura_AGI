import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import AppLayout from '../components/layout/Layout';
import MainLayout from '../components/layout/MainLayout';

export default function MemoryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the agents page with memory tab selected
    router.push({
      pathname: '/agents',
      query: { tab: 'memories' }
    });
  }, [router]);

  return (
    <AppLayout>
      <MainLayout leftSidebar={<div />} rightSidebar={<div />}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '80vh' 
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1">
            Redirecting to Memory Dashboard...
          </Typography>
        </Box>
      </MainLayout>
    </AppLayout>
  );
} 