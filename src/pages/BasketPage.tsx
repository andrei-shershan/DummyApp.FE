import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { getBasketItems } from '../api/basket';
import { BasketItemDto } from '../types/api';;;;

function BasketPage() {
  const [items, setItems] = useState<BasketItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCookie, setHasCookie] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadBasket() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/basket/items', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 404) {
          setHasCookie(false);
          setItems([]);
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to load basket.');
        }

        setHasCookie(true);

        const basketItems = await getBasketItems();
        setItems(basketItems);
      } catch (err: any) {
        setError(err?.message ?? 'Unable to load basket.');
      } finally {
        setLoading(false);
      }
    }

    loadBasket();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Basket
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Typography color="error">{error}</Typography>
      )}

      {!loading && !error && hasCookie === false && (
        <Typography>Your basket is empty. Add an artwork to create a basket.</Typography>
      )}

      {!loading && !error && hasCookie === true && items.length === 0 && (
        <Typography>Your basket is empty.</Typography>
      )}

      {!loading && !error && items.length > 0 && (
        <List>
          {items.map(item => (
            <React.Fragment key={`${item.orderId}-${item.artworkId}`}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar variant="rounded" src={item.thumbnailUrl} alt={item.name} />
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Quantity: {item.quantity}
                      </Typography>
                      <br />
                      {item.description}
                    </>
                  }
                />
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
