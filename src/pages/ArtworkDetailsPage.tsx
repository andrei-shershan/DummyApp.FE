import React, { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAppContext } from '../context/AppContext';

function ArtworkDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const isMyWorksRoute = useMatch('/my-works/:id') != null;
  const navigate = useNavigate();
  const { selectedArtwork, loadingDetail, error, loadArtworkById, toggleArtworkActive, user } = useAppContext();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadArtworkById(id, !isMyWorksRoute);
    }
  }, [id, isMyWorksRoute, loadArtworkById]);

  const handleToggle = async () => {
    if (!selectedArtwork) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await toggleArtworkActive(selectedArtwork.id);
    } catch (err: any) {
      setActionError(err?.message ?? 'Unable to update artwork status.');
    } finally {
      setActionLoading(false);
    }
  };

  const canManageArtwork = user?.roles?.includes('Creator') || user?.roles?.includes('Admin');
  const showArtworkActions = isMyWorksRoute && canManageArtwork;
  const backRoute = isMyWorksRoute ? '/my-works' : '/artworks';

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Button variant="outlined" onClick={() => navigate(backRoute)} sx={{ mb: 3 }}>
        Back
      </Button>
      {loadingDetail && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color="error">{error}</Typography>}
      {selectedArtwork && !loadingDetail && (
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {selectedArtwork.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {selectedArtwork.description ?? 'No description provided.'}
            </Typography>
            <Typography variant="body2">Creator ID: {selectedArtwork.creatorId ?? 'Unknown'}</Typography>
            <Typography variant="body2">Created: {(selectedArtwork.creationDate) ? new Date(selectedArtwork.creationDate).toLocaleDateString() : 'Unknown'}</Typography>
            <Typography variant="body2" paragraph>
              Status: {selectedArtwork.isActive ? 'Active' : 'Inactive'}
            </Typography>
            {(selectedArtwork.imgUrl ?? selectedArtwork.imgUrl) && (
              <Box component="img" src={selectedArtwork.imgUrl ?? selectedArtwork.imgUrl} alt={selectedArtwork.name} sx={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 2, mb: 3 }} />
            )}
            {showArtworkActions && (
              <Button variant="contained" onClick={handleToggle} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : selectedArtwork.isActive ? 'Set Inactive' : 'Set Active'}
              </Button>
            )}
            {actionError && <Typography color="error" sx={{ mt: 2 }}>{actionError}</Typography>}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default ArtworkDetailsPage;
