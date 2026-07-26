import React from 'react';
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
import { useAppContext } from '../context/AppContext';

function BasketPage() {
  const { basketItems, basketLoading, basketError } = useAppContext();

  const hasItems = basketItems.length > 0;

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Basket</Typography>
        <Typography variant="body1">Total items: {basketItems.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
      </Box>

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

      {!basketLoading && !basketError && hasItems && (
        <List>
          {basketItems.map(item => (
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
