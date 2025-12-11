import React, { ReactNode } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

interface MainLayoutProps {
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  children: ReactNode;
  leftSidebarWidth?: string | number;
  rightSidebarWidth?: string | number;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
}

export default function MainLayout({
  leftSidebar,
  children,
  rightSidebar,
  leftSidebarWidth = '280px',
  rightSidebarWidth = '280px',
  showLeftSidebar = true,
  showRightSidebar = true
}: MainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // On mobile, we hide both sidebars and make the main content full width
  // On tablet, we show only the main content and left sidebar
  const displayLeftSidebar = showLeftSidebar && (!isMobile);
  const displayRightSidebar = showRightSidebar && (!isMobile && !isTablet);
  
  // Adjust calculated widths based on visible sidebars
  const calculatedLeftWidth = displayLeftSidebar ? leftSidebarWidth : '0px';
  const calculatedRightWidth = displayRightSidebar ? rightSidebarWidth : '0px';
  
  // Calculate main width based on which sidebars are showing
  const calculatedMainWidth = `calc(100% - ${calculatedLeftWidth} - ${calculatedRightWidth})`;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'row',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}
    >
      {/* Left Sidebar */}
      <Box
        sx={{
          width: displayLeftSidebar ? leftSidebarWidth : 0,
          borderRight: 1,
          borderColor: 'divider',
          display: displayLeftSidebar ? 'block' : 'none',
          height: '100%',
          overflowY: 'auto'
        }}
      >
        {leftSidebar}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          width: calculatedMainWidth,
          height: '100%',
          overflowY: 'auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>

      {/* Right Sidebar */}
      <Box
        sx={{
          width: displayRightSidebar ? rightSidebarWidth : 0,
          borderLeft: 1,
          borderColor: 'divider',
          display: displayRightSidebar ? 'block' : 'none',
          height: '100%',
          overflowY: 'auto'
        }}
      >
        {rightSidebar}
      </Box>
    </Box>
  );
} 