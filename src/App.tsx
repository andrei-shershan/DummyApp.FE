import React, { useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import { useAppContext } from './context/AppContext';
import HomePage from './pages/HomePage';
import ArtworksPage from './pages/ArtworksPage';
import MyWorksPage from './pages/MyWorksPage';
import ArtworkDetailsPage from './pages/ArtworkDetailsPage';
import BasketPage from './pages/BasketPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import MyAccountPage from './pages/MyAccountPage';
import InviteRegisterRedirectPage from './pages/InviteRegisterRedirectPage';
import PortalLayout from './components/PortalLayout';
import PortalHomePage from './pages/PortalHomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import AppFooter from './components/AppFooter';

const drawerWidth = 280;

interface NavItem {
  label: string;
  path?: string;
  onClick: () => void;
}

function PublicLayout() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { basketCount } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(prev => !prev);
  };

  const navItems: NavItem[] = [
    {
      label: 'Artworks',
      path: '/artworks',
      onClick: () => navigate('/artworks'),
    },
    {
      label: `Basket${basketCount > 0 ? ` (${basketCount})` : ''}`,
      path: '/basket',
      onClick: () => navigate('/basket'),
    },
    {
      label: 'Orders',
      path: '/orders',
      onClick: () => navigate('/orders'),
    },
  ];

  const drawer = (
    <Box sx={{ width: drawerWidth, p: 2 }} role="presentation" onClick={handleDrawerToggle}>
      <Typography variant="h6" gutterBottom sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>DummyApp</Typography>
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
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 800, px: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/') }>
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
          {drawer}
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="artworks" element={<ArtworksPage />} />
        <Route path="artworks/:id" element={<ArtworkDetailsPage />} />
        <Route path="basket" element={<BasketPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="register/*" element={<InviteRegisterRedirectPage />} />
      </Route>

      <Route path="portal" element={<PortalLayout />}>
        <Route index element={<PortalHomePage />} />
        <Route path="my-account" element={<MyAccountPage />} />
        <Route path="my-works" element={<MyWorksPage />} />
        <Route path="my-works/:id" element={<ArtworkDetailsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="my-works" element={<Navigate to="/portal/my-works" replace />} />
      <Route path="my-works/:id" element={<Navigate to="/portal/my-works/:id" replace />} />
      <Route path="admin" element={<Navigate to="/portal/admin" replace />} />
    </Routes>
  );
}

export default App;
