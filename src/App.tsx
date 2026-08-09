import React, { useState } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
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
import InviteRegisterRedirectPage from './pages/InviteRegisterRedirectPage';
import PortalLayout from './components/PortalLayout';
import PortalHomePage from './pages/PortalHomePage';

const drawerWidth = 280;

interface NavItem {
  label: string;
  onClick: () => void;
}

function PublicLayout() {
  const theme = useTheme();
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
      onClick: () => navigate('/artworks'),
    },
    {
      label: `Basket${basketCount > 0 ? ` (${basketCount})` : ''}`,
      onClick: () => navigate('/basket'),
    },
    {
      label: 'Orders',
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
            <ListItemButton onClick={item.onClick}>
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
              <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.8, letterSpacing: 1 }}>
                Art Gallery
              </Typography>
              <Typography variant="h6" noWrap component="div">
                DummyApp
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navItems.map(item => (
                  <Button key={item.label} color="inherit" onClick={item.onClick}>
                    {item.label}
                  </Button>
                ))}
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
        <Route path="my-works" element={<MyWorksPage />} />
        <Route path="my-works/:id" element={<ArtworkDetailsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="my-works" element={<Navigate to="/portal/my-works" replace />} />
      <Route path="my-works/:id" element={<Navigate to="/portal/my-works/:id" replace />} />
      <Route path="admin" element={<Navigate to="/portal/admin" replace />} />
    </Routes>
  );
}

export default App;
