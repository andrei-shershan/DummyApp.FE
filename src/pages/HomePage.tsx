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
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4, position: 'relative', zIndex: 1 }}>
      <Typography variant="h6" paragraph sx={{ maxWidth: 720, lineHeight: 1.4 }}>
        DummyDruk is a contemporary art gallery exploring the limits of authorship, taste, and technological progress.
      </Typography>
      <Typography variant="body1" paragraph sx={{ maxWidth: 720, color: 'text.secondary', lineHeight: 1.75 }}>
        We present works created at the intersection of human intention and machine-assisted imagination. Every piece has been carefully generated, selected, named, contextualized, and, where necessary, described as “important.”
      </Typography>
      <Typography variant="body1" paragraph sx={{ maxWidth: 720, color: 'text.secondary', lineHeight: 1.75 }}>
        In an age of infinite images, we believe the real challenge is knowing which ones to take seriously.
      </Typography>

      {loading && <Typography>Loading user details...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Box sx={{ mt: 3, display: 'grid', gap: 2 }}>
          {user?.isAuthenticated ? (
            <Typography>
              Signed in as <strong>{user.email ?? user.name ?? user.sub}</strong>.
            </Typography>
          ) : null}

          {isCreator ? (
            <Alert severity="info">Creator dashboard and upload are available on the My Works page.</Alert>
          ) : null}
        </Box>
      )}
    </Container>
  );
}

export default HomePage;
