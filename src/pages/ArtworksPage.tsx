import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';
import ArtworkCard from '../components/ArtworkCard';

function ArtworksPage() {
  const navigate = useNavigate();
  const { artworks, loading, error, refreshArtworks } = useAppContext();

  useEffect(() => {
    refreshArtworks();
  }, [refreshArtworks]);

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Artworks
      </Typography>
      {loading && <Typography>Loading artworks...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && artworks.length === 0 && <Typography>No artworks found.</Typography>}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {artworks.map(artwork => (
          <Grid item xs={12} sm={6} md={4} key={artwork.id}>
            <ArtworkCard artwork={artwork} onViewDetails={() => navigate(`/artworks/${artwork.id}`)} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ArtworksPage;
