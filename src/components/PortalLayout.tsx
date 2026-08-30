import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { BFF_HOST } from '../config';
import { useAppContext } from '../context/AppContext';
import AppFooter from './AppFooter';

const drawerWidth = 280;

interface NavItem {
  label: string;
  path?: string;
  onClick: () => void;
}

function PortalLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser, authError, userLoading } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user && !userLoading) {
      refreshUser().catch(() => {
        // refreshUser handles auth errors and redirect will occur below if needed
      });
    }
  }, [refreshUser, user, userLoading]);

  useEffect(() => {
    if (user && user.isAuthenticated === false && !userLoading) {
      const loginUrl = `${BFF_HOST}/login?returnUrl=${encodeURIComponent(window.location.href)}`;
      window.location.replace(loginUrl);
    }
  }, [user, userLoading, location.pathname]);

  const isAuthenticated = user?.isAuthenticated === true;
  const isAdmin = user?.roles?.includes('Admin');
  const isCreator = user?.roles?.includes('Creator');

  useEffect(() => {
    if (!userLoading && isAuthenticated) {
      if (location.pathname.endsWith('/admin') && !isAdmin) {
        navigate('/portal', { replace: true });
      }
      if (location.pathname.endsWith('/analytics') && !isAdmin) {
        navigate('/portal', { replace: true });
      }
      if (location.pathname.endsWith('/my-account') && !(isCreator || isAdmin)) {
        navigate('/portal', { replace: true });
      }
      if (location.pathname.endsWith('/my-works') && !(isCreator || isAdmin)) {
        navigate('/portal', { replace: true });
      }
    }
  }, [isAdmin, isAuthenticated, isCreator, location.pathname, navigate, userLoading]);

  const handleDrawerToggle = () => {
    setMobileOpen(prev => !prev);
  };

  const handleLogout = () => {
    window.location.href = `${BFF_HOST}/logout`;
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navItems = useMemo(() => {
    const items: NavItem[] = [
      {
        label: 'Portal Home',
        path: '/portal',
        onClick: () => navigate('/portal'),
      },
    ];

    if (isAuthenticated) {
      if (isCreator || isAdmin) {
        items.push({
          label: 'My Account',
          path: '/portal/my-account',
          onClick: () => navigate('/portal/my-account'),
        });
      }

      if (isCreator || isAdmin) {
        items.push({
          label: 'MyArtworks',
          path: '/portal/my-works',
          onClick: () => navigate('/portal/my-works'),
        });
      }

      if (isAdmin) {
        items.push({
          label: 'Admin Panel',
          path: '/portal/admin',
          onClick: () => navigate('/portal/admin'),
        });

        items.push({
          label: 'Analytics',
          path: '/portal/analytics',
          onClick: () => navigate('/portal/analytics'),
        });
      }

      items.push({
        label: 'Log Out',
        onClick: handleLogout,
      });
    }

    return items;
  }, [isAuthenticated, isAdmin, isCreator, navigate]);

  if (userLoading || (!user && !authError)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading portal...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Redirecting to login...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 800, px: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/portal')}>
              <Typography variant="h6" noWrap component="div">
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                  Dummy
                </Box>
                <Box component="span" sx={{ color: 'secondary.main', fontWeight: 700, ml: 0.5 }}>
                  Druk
                </Box>
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.72, mt: 0.2 }}>
                Made by Humans
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navItems.map(item => {
                  const active = item.path ? location.pathname.startsWith(item.path) : false;
                  return (
                    <Button
                      key={item.label}
                      color="inherit"
                      variant="text"
                      onClick={item.onClick}
                      sx={{
                        borderBottom: active ? '2px solid' : '2px solid transparent',
                        borderColor: active ? 'secondary.main' : 'transparent',
                        borderRadius: 0,
                        pb: 1,
                        color: active ? 'text.primary' : 'inherit',
                        '&:hover': {
                          borderBottom: '2px solid',
                          borderColor: 'secondary.main',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            )}

            {isMobile && (
              <IconButton color="inherit" edge="end" onClick={handleDrawerToggle} aria-label="open navigation drawer">
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Box>
      </AppBar>

      <Box component="nav">
        <Drawer
          anchor="right"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          <Box sx={{ width: drawerWidth, p: 2 }} role="presentation" onClick={handleDrawerToggle}>
            <Typography variant="h6" gutterBottom sx={{ cursor: 'pointer' }} onClick={() => navigate('/portal')}>
              DummyApp
            </Typography>
            <Divider />
            <List>
              {navItems.map(item => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    selected={item.path ? location.pathname.startsWith(item.path) : false}
                    onClick={item.onClick}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, px: 2, py: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 800 }}>
          <Outlet />
        </Box>
      </Box>
      <AppFooter />
    </Box>
  );
}

export default PortalLayout;
