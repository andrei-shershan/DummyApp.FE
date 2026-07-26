import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useAppContext } from '../context/AppContext';
import { updateBasketItemQuantity } from '../api/basket';

function BasketPage() {
  const { basketItems, basketLoading, basketError, basketStatus, refreshBasketItems, payBasket } = useAppContext();
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingItemIds, setUpdatingItemIds] = useState<Record<string, boolean>>({});
  const [paying, setPaying] = useState(false);

  const isEditable = basketStatus === null || basketStatus === 'Active';
  const hasItems = basketItems.length > 0;

  const handleQuantityChange = async (artworkId: string, quantityDelta: number) => {
    if (!isEditable) {
      return;
    }

    setActionError(null);
    setUpdatingItemIds(prev => ({ ...prev, [artworkId]: true }));

    try {
      await updateBasketItemQuantity(artworkId, quantityDelta);
      await refreshBasketItems();
    } catch (err: any) {
      setActionError(err?.message ?? 'Unable to update basket item.');
    } finally {
      setUpdatingItemIds(prev => ({ ...prev, [artworkId]: false }));
    }
  };

  const totalItems = basketItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Basket</Typography>
        <Typography variant="body1">Total items: {totalItems}</Typography>
      </Box>

      {basketStatus && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Status: {basketStatus}</Typography>
        </Box>
      )}

      {!basketLoading && !basketError && hasItems && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Order summary</Typography>
          <Typography>{totalItems} item(s) ready for payment.</Typography>
        </Box>
      )}

      {basketLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!basketLoading && basketError && (
        <Typography color="error">{basketError}</Typography>
      )}

      {!basketLoading && !basketError && !hasItems && (
        <Typography>Your basket is empty. Add an artwork to create a basket.</Typography>
      )}

      {!basketLoading && !basketError && actionError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {actionError}
        </Typography>
      )}

      {!basketLoading && !basketError && hasItems && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={async () => {
              setActionError(null);
              setPaying(true);

              try {
                await payBasket();
              } catch (err: any) {
                setActionError(err?.message ?? 'Unable to pay order.');
              } finally {
                setPaying(false);
              }
            }}
            disabled={!isEditable || basketLoading || paying}
          >
            Pay Order
          </Button>
        </Box>
      )}

      {!basketLoading && !basketError && hasItems && (
        <List>
          {basketItems.map(item => (
            <React.Fragment key={`${item.orderId}-${item.artworkId}`}>
              <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <ListItemAvatar>
                    <Avatar variant="rounded" src={item.thumbnailUrl} alt={item.name} />
                  </ListItemAvatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!isEditable || basketLoading || updatingItemIds[item.artworkId]}
                      onClick={() => handleQuantityChange(item.artworkId, -1)}
                    >
                      -
                    </Button>
                    <Typography>{item.quantity}</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!isEditable || basketLoading || updatingItemIds[item.artworkId]}
                      onClick={() => handleQuantityChange(item.artworkId, 1)}
                    >
                      +
                    </Button>
                  </Box>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
}

export default BasketPage;
