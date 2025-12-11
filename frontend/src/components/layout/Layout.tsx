import React, { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';

// Golden glow effect component
const GoldenGlow = styled('div')<{ position: string; size: string; opacity: number }>(
  ({ position, size, opacity }) => {
    const positionStyles = {
      'top-right': {
        top: '-10vh',
        right: '-10vw',
      },
      'bottom-left': {
        bottom: '-10vh',
        left: '-10vw',
      },
      'top-left': {
        top: '-10vh',
        left: '-10vw',
      },
      'bottom-right': {
        bottom: '-10vh',
        right: '-10vw',
      },
    };

    const pos = positionStyles[position as keyof typeof positionStyles] || positionStyles['top-right'];

    return {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, rgba(245, 204, 127, ${opacity}) 0%, rgba(245, 204, 127, 0) 70%)`,
      filter: 'blur(40px)',
      zIndex: 0,
      ...pos,
    };
  }
);

// Navigation items
const navItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
  { text: 'Agents', icon: <PsychologyIcon />, path: '/agents' },
  { text: 'Metrics', icon: <BarChartIcon />, path: '/metrics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #f5cc7f 0%, #c09c58 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <PsychologyIcon sx={{ mr: 1, color: '#c09c58' }} />
          Aura
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <Link href={item.path} key={item.text} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(245, 204, 127, 0.1)',
                  borderRight: '3px solid #c09c58',
                },
                cursor: 'pointer',
                backgroundColor: router.pathname === item.path ? 'rgba(245, 204, 127, 0.1)' : 'transparent',
                borderRight: router.pathname === item.path ? '3px solid #c09c58' : 'none'
              }}
            >
              <ListItemIcon sx={{ color: router.pathname === item.path ? '#c09c58' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    color: router.pathname === item.path ? '#c09c58' : 'inherit',
                    fontWeight: router.pathname === item.path ? 'bold' : 'normal' 
                  } 
                }}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );

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

      {/* App Bar */}
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
          background: 'rgba(18, 18, 18, 0.7)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #f5cc7f 0%, #c09c58 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PsychologyIcon sx={{ mr: 1, color: '#c09c58' }} />
            Aura
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Box
                key={item.text}
                component={Link}
                href={item.path}
                sx={{
                  mx: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  textDecoration: 'none',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: router.pathname === item.path ? 'rgba(245, 204, 127, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(245, 204, 127, 0.05)',
                  },
                }}
              >
                <Box component="span" sx={{ mr: 1, color: router.pathname === item.path ? '#c09c58' : 'inherit' }}>
                  {item.icon}
                </Box>
                <Typography
                  component="span"
                  sx={{
                    fontWeight: router.pathname === item.path ? 'bold' : 'normal',
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {children}
      </Box>

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
    </Box>
  );
} 