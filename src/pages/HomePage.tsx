import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useAppContext } from '../context/AppContext';

function HomePage() {
  const { user, loading, error } = useAppContext();
  const isCreator = user?.roles?.includes('Creator');

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to DummyApp
      </Typography>
      <Typography variant="body1" paragraph>
        This application is built with Material UI, global API state, and mobile-first responsive navigation.
      </Typography>

      {loading && <Typography>Loading user details...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Box sx={{ mt: 3, display: 'grid', gap: 2 }}>
          {user?.isAuthenticated ? (
            <Typography>
              Signed in as <strong>{user.email ?? user.name ?? user.sub}</strong>.
            </Typography>
          ) : (
            <Alert severity="info">Please sign in to access creator and admin features.</Alert>
          )}

          {isCreator ? (
            <Alert severity="info">Creator dashboard and upload are available on the My Works page.</Alert>
          ) : null}
        </Box>
      )}
    </Container>
  );
}

export default HomePage;
