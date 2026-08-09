import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';

function PortalHomePage() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const isAdmin = user?.roles?.includes('Admin');
  const isCreator = user?.roles?.includes('Creator');

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Portal
      </Typography>
      <Typography variant="body1" paragraph>
        This portal is for administrators and creators. Use it to manage artworks, users, and portal-specific tasks.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {isCreator || isAdmin ? (
          <Button variant="contained" onClick={() => navigate('/portal/my-works')}>
            MyArtworks
          </Button>
        ) : null}
        {isAdmin ? (
          <Button variant="outlined" onClick={() => navigate('/portal/admin')}>
            Admin Panel
          </Button>
        ) : null}
      </Box>

      <Typography variant="subtitle1">Account</Typography>
      <Typography>Signed in as <strong>{user?.email ?? user?.name ?? user?.sub}</strong>.</Typography>
      {user?.roles && <Typography>Roles: {user.roles.join(', ')}</Typography>}
    </Container>
  );
}

export default PortalHomePage;
