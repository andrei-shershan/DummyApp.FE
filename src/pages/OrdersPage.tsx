import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useAppContext } from '../context/AppContext';

function OrdersPage() {
  const { basketItems, basketLoading, basketError, basketStatus, refreshBasketItems } = useAppContext();
  const [hasFetchedOrder, setHasFetchedOrder] = useState(false);

  useEffect(() => {
    if (hasFetchedOrder) {
      return;
    }

    setHasFetchedOrder(true);
    refreshBasketItems().catch(() => {
      // error is handled in context state
    });
  }, [hasFetchedOrder, refreshBasketItems]);

  const totalItems = basketItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = basketItems.reduce((sum, item) => sum + ((item.priceValue ?? 0) * item.quantity), 0);

  const statusLabel = basketStatus ? basketStatus : 'Unknown';
  const statusDescription = basketStatus
    ? basketStatus.toLowerCase() === 'completed'
      ? 'This order has been paid successfully.'
      : basketStatus.toLowerCase() === 'processing'
      ? 'Payment is in progress and the order is being processed.'
      : basketStatus.toLowerCase() === 'active'
      ? 'This order is active and ready for checkout.'
      : `Order status is ${basketStatus}.`
    : 'No order summary is available yet.';

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Orders
          </Typography>
          <Typography color="text.secondary">Review your current order status and summary.</Typography>
        </Box>
        {basketStatus && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Status: {statusLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statusDescription}
            </Typography>
          </Box>
        )}
      </Box>

      {basketLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!basketLoading && basketError && (
        <Typography color="error">{basketError}</Typography>
      )}

      {!basketLoading && !basketError && basketItems.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 4 }}>
          <Typography>No current order was found.</Typography>
          <Button variant="contained" href="/artworks">Browse artworks</Button>
        </Box>
      )}

      {!basketLoading && !basketError && basketItems.length > 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Order summary</Typography>
            <Typography variant="body1">{totalItems} item(s)</Typography>
          </Box>

          <List disablePadding>
            {basketItems.map(item => (
              <React.Fragment key={`${item.orderId}-${item.artworkId}`}>
                <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch', py: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                    <ListItemAvatar>
                      <Avatar variant="rounded" src={item.thumbnailUrl} alt={item.name} sx={{ width: 80, height: 80 }} />
                    </ListItemAvatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.description}
                      </Typography>
                      <Typography variant="body2">Quantity: {item.quantity}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.priceValue != null ? `${item.priceValue.toFixed(2)} PLN` : 'Price pending'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: {item.priceValue != null ? `${(item.priceValue * item.quantity).toFixed(2)} PLN` : '—'}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Total amount
            </Typography>
            <Typography variant="h6">{totalAmount.toFixed(2)} PLN</Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default OrdersPage;
