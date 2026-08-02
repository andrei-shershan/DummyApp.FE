import React, { useEffect, useMemo, useState } from 'react';
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useAppContext } from '../context/AppContext';
import { getBasketPrintSizes } from '../api/basket';
import { PrintSizeDto } from '../types/api';

function BasketPage() {
  const { basketItems, basketLoading, basketError, basketStatus, refreshBasketItems, payBasket, updateBasketItemQuantity } = useAppContext();
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingItemIds, setUpdatingItemIds] = useState<Record<string, boolean>>({});
  const [paying, setPaying] = useState(false);
  const [printSizes, setPrintSizes] = useState<PrintSizeDto[]>([]);

  const isEditable = basketStatus === null || basketStatus === 'Active' || basketStatus === 'Processing';
  const hasItems = basketItems.length > 0;

  const handleItemUpdate = async (artworkId: string, quantity: number, printSizeId?: number, priceId?: number) => {
    if (!isEditable) {
      return;
    }

    setActionError(null);
    setUpdatingItemIds(prev => ({ ...prev, [artworkId]: true }));

    try {
      await updateBasketItemQuantity(artworkId, quantity, printSizeId, priceId);
      await refreshBasketItems();
    } catch (err: any) {
      setActionError(err?.message ?? 'Unable to update basket item.');
    } finally {
      setUpdatingItemIds(prev => ({ ...prev, [artworkId]: false }));
    }
  };

  const totalItems = basketItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    async function loadPrintSizes() {
      try {
        const sizes = await getBasketPrintSizes();
        setPrintSizes(sizes);
      } catch {
        setPrintSizes([]);
      }
    }

    if (hasItems) {
      loadPrintSizes();
    }
  }, [hasItems]);

  const printSizeOptions = useMemo(() => printSizes, [printSizes]);

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
                setActionError(err?.message ?? 'Unable to review details.');
              } finally {
                setPaying(false);
              }
            }}
            disabled={!isEditable || basketLoading || paying}
          >
            Review Details
          </Button>
        </Box>
      )}

      {!basketLoading && !basketError && hasItems && (
        <List>
          {basketItems.map(item => {
            const currentPrintSizeId = item.printSizeId;
            const selectedPrintSize = printSizeOptions.find(size => size.id === currentPrintSizeId) ?? printSizeOptions[0];
            const currentPriceId = item.priceId ?? selectedPrintSize?.prices[0]?.id;
            const itemPrices = selectedPrintSize?.prices ?? [];

            return (
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
                        onClick={() => handleItemUpdate(item.artworkId, Math.max(item.quantity - 1, 0), item.printSizeId, item.priceId)}
                      >
                        -
                      </Button>
                      <Typography>{item.quantity}</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!isEditable || basketLoading || updatingItemIds[item.artworkId]}
                        onClick={() => handleItemUpdate(item.artworkId, item.quantity + 1, item.printSizeId, item.priceId)}
                      >
                        +
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    <FormControl sx={{ minWidth: 180 }} size="small">
                      <InputLabel id={`print-size-label-${item.artworkId}`}>Print Size</InputLabel>
                      <Select
                        labelId={`print-size-label-${item.artworkId}`}
                        value={currentPrintSizeId ?? ''}
                        label="Print Size"
                        onChange={async event => {
                          const newPrintSizeId = Number(event.target.value);
                          const selectedSize = printSizeOptions.find(size => size.id === newPrintSizeId);
                          const newPriceId = selectedSize?.prices[0]?.id;

                          await handleItemUpdate(item.artworkId, item.quantity, newPrintSizeId, newPriceId);
                        }}
                        disabled={!isEditable || basketLoading || updatingItemIds[item.artworkId]}
                      >
                        {printSizeOptions.map(size => (
                          <MenuItem key={size.id} value={size.id}>
                            {size.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 180 }} size="small">
                      <InputLabel id={`price-label-${item.artworkId}`}>Price</InputLabel>
                      <Select
                        labelId={`price-label-${item.artworkId}`}
                        value={currentPriceId ?? ''}
                        label="Price"
                        onChange={async event => {
                          const newPriceId = Number(event.target.value);
                          await handleItemUpdate(item.artworkId, item.quantity, selectedPrintSize?.id, newPriceId);
                        }}
                        disabled={!isEditable || basketLoading || updatingItemIds[item.artworkId] || itemPrices.length === 0}
                      >
                        {itemPrices.map(price => (
                          <MenuItem key={price.id} value={price.id}>
                            {price.value.toFixed(2)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {item.priceValue != null && (
                      <Typography sx={{ alignSelf: 'center' }}>
                        Selected price: {item.priceValue.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Container>
  );
}

export default BasketPage;
