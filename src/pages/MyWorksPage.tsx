import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useAppContext } from '../context/AppContext';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkUploadForm from '../components/ArtworkUploadForm';
import { getArtworkPrerequisites } from '../api/artworks';

function MyWorksPage() {
  const navigate = useNavigate();
  const { user, artworks, loading, error, refreshArtworks } = useAppContext();
  const [prerequisiteLoading, setPrerequisiteLoading] = useState(true);
  const [prerequisiteError, setPrerequisiteError] = useState<string | null>(null);
  const creatorId = user?.id ?? user?.sub;

  useEffect(() => {
    if (creatorId) {
      refreshArtworks(creatorId, false);
    }
  }, [refreshArtworks, creatorId]);

  useEffect(() => {
    let mounted = true;

    async function loadPrerequisites() {
      setPrerequisiteLoading(true);
      setPrerequisiteError(null);

      try {
        await getArtworkPrerequisites();
      } catch (err: any) {
        if (!mounted) {
          return;
        }

        setPrerequisiteError(err?.message ?? 'Unable to load artwork prerequisites.');
      } finally {
        if (mounted) {
          setPrerequisiteLoading(false);
        }
      }
    }

    if (creatorId) {
      loadPrerequisites();
    } else {
      setPrerequisiteLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [creatorId]);

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

  if (prerequisiteLoading) {
    return (
      <Container maxWidth="md" sx={{ pt: 6, pb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading prerequisites...</Typography>
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
      {prerequisiteError && <Typography color="error">{prerequisiteError}</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && artworks.length === 0 && <Typography>No artworks found for your account.</Typography>}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {artworks.map(artwork => (
          <Grid item xs={12} sm={6} md={4} key={artwork.id}>
            <ArtworkCard artwork={artwork} onViewDetails={() => navigate(`/portal/my-works/${artwork.id}`)} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default MyWorksPage;
