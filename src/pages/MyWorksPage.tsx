import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkUploadForm from '../components/ArtworkUploadForm';

function MyWorksPage() {
  const navigate = useNavigate();
  const { user, artworks, loading, error, refreshArtworks } = useAppContext();
  const creatorId = user?.id ?? user?.sub;

  useEffect(() => {
    if (creatorId) {
      refreshArtworks(creatorId, false);
    }
  }, [refreshArtworks, creatorId]);

  if (!creatorId) {
    return (
      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Works
        </Typography>
        <Typography>Please sign in to view your artworks.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Works
      </Typography>
      <ArtworkUploadForm />
      {loading && <Typography>Loading your artworks...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && artworks.length === 0 && <Typography>No artworks found for your account.</Typography>}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {artworks.map(artwork => (
          <Grid item xs={12} sm={6} md={4} key={artwork.id}>
            <ArtworkCard artwork={artwork} onViewDetails={() => navigate(`/my-works/${artwork.id}`)} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default MyWorksPage;
