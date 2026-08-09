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
import { addArtworkToBasket } from '../api/basket';
import PageLoadingOverlay from '../components/PageLoadingOverlay';

function ArtworkDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const myWorksMatch = useMatch('/my-works/:id');
  const portalMyWorksMatch = useMatch('/portal/my-works/:id');
  const isMyWorksRoute = myWorksMatch != null || portalMyWorksMatch != null;
  const navigate = useNavigate();
  const { selectedArtwork, loadingDetail, error, loadArtworkById, toggleArtworkActive, user, isArtworkInBasket, refreshBasketItems } = useAppContext();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [basketError, setBasketError] = useState<string | null>(null);
  const [basketLoading, setBasketLoading] = useState(false);

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
  const backRoute = isMyWorksRoute ? '/portal/my-works' : '/artworks';

  const handleAddToBasket = async () => {
    if (!selectedArtwork) {
      return;
    }

    setBasketLoading(true);
    setBasketError(null);

    try {
      await addArtworkToBasket(selectedArtwork.id);
      await refreshBasketItems();
    } catch (err: any) {
      setBasketError(err?.message ?? 'Unable to add artwork to basket.');
    } finally {
      setBasketLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4, position: 'relative' }}>
      <PageLoadingOverlay open={selectedArtwork != null && basketLoading} />
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {isArtworkInBasket(selectedArtwork.id) ? (
                <Button variant="contained" color="secondary" onClick={() => navigate('/basket')}>
                  View basket
                </Button>
              ) : (
                <Button variant="contained" onClick={handleAddToBasket} disabled={actionLoading || basketLoading}>
                  {basketLoading ? 'Adding...' : 'Add to basket'}
                </Button>
              )}
              {showArtworkActions && (
                <Button variant="contained" onClick={handleToggle} disabled={actionLoading || basketLoading}>
                  {actionLoading ? 'Saving...' : selectedArtwork.isActive ? 'Set Inactive' : 'Set Active'}
                </Button>
              )}
            </Box>
            {(actionError || basketError) && (
              <Typography color="error" sx={{ mt: 2 }}>
                {basketError ?? actionError}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default ArtworkDetailsPage;
