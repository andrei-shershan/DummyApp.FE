import React, { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  const [previewOpen, setPreviewOpen] = useState(false);

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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5 }}>
              <Box sx={{ width: { xs: '100%', md: 250 }, minWidth: { xs: '100%', md: 250 }, flexShrink: 0 }}>
                <Box
                  sx={{ width: '100%', minWidth: 250, height: 354, position: 'relative', overflow: 'hidden', bgcolor: 'grey.100', cursor: 'pointer' }}
                  onClick={() => setPreviewOpen(true)}
                >
                  <Box
                    component="img"
                    src={selectedArtwork.thumbnailUrl || selectedArtwork.imgUrl || ''}
                    alt={selectedArtwork.name}
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {isArtworkInBasket(selectedArtwork.id) ? (
                    <Button variant="contained" color="secondary" onClick={() => navigate('/basket')}>
                      View basket
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={handleAddToBasket}
                      disabled={actionLoading || basketLoading}
                    >
                      {basketLoading ? 'Adding...' : 'Add to basket'}
                    </Button>
                  )}
                  {selectedArtwork.imgUrl ? (
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setPreviewOpen(true)}
                    >
                      100%
                    </Button>
                  ) : null}
                </Box>
              </Box>

              <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 250 } }}>
                <Typography variant="h4" gutterBottom>
                  {selectedArtwork.name}
                </Typography>
                <Typography variant="body2" gutterBottom color="text.secondary">
                  Creator: {selectedArtwork.creatorId ?? 'Unknown'}
                </Typography>
                <Typography variant="body2" gutterBottom color="text.secondary">
                  Created: {selectedArtwork.creationDate ? new Date(selectedArtwork.creationDate).toLocaleDateString() : 'Unknown'}
                </Typography>
                <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                  {selectedArtwork.description ?? 'No description provided.'}
                </Typography>

                {showArtworkActions && (
                  <Button variant="contained" onClick={handleToggle} disabled={actionLoading || basketLoading}>
                    {actionLoading ? 'Saving...' : selectedArtwork.isActive ? 'Set Inactive' : 'Set Active'}
                  </Button>
                )}

                {(actionError || basketError) && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {basketError ?? actionError}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          View full size
          <IconButton aria-label="close" onClick={() => setPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: 'rgba(0,0,0,0.92)' }}>
          <Box sx={{ width: '100%', minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {(selectedArtwork?.imgUrl || selectedArtwork?.thumbnailUrl) ? (
              <Box
                component="img"
                src={selectedArtwork.imgUrl || selectedArtwork.thumbnailUrl}
                alt={selectedArtwork.name}
                sx={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }}
              />
            ) : null}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default ArtworkDetailsPage;
