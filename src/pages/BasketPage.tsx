import React, { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
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
import PageLoadingOverlay from '../components/PageLoadingOverlay';
import { getBasketPrintSizes } from '../api/basket';
import { OrderAddressDto, PrintSizeDto } from '../types/api';

function BasketPage() {
  const { basketItems, basketLoading, basketError, basketStatus, basketAddress, payBasket, payOrder, activateBasket, saveBasketAddress, continueBasket, updateBasketItemQuantity } = useAppContext();
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingItemIds, setUpdatingItemIds] = useState<Record<string, boolean>>({});
  const [paying, setPaying] = useState(false);
  const [activating, setActivating] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [printSizes, setPrintSizes] = useState<PrintSizeDto[]>([]);
  const [orderAddress, setOrderAddress] = useState<OrderAddressDto>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    street: '',
    houseNumber: '',
    postalCode: ''
  });

  const isEditable = basketStatus === null || basketStatus === 'Active';
  const isSummaryMode = basketStatus === 'Processing';
  const hasItems = basketItems.length > 0;
  const isBasketReadyForReview = hasItems && basketItems.every(item => item.printSizeId != null && item.priceId != null);

  const handleItemUpdate = async (artworkId: string, quantity: number, printSizeId?: number, priceId?: number) => {
    if (!isEditable) {
      return;
    }

    setActionError(null);
    setUpdatingItemIds(prev => ({ ...prev, [artworkId]: true }));

    try {
      await updateBasketItemQuantity(artworkId, quantity, printSizeId, priceId);
    } catch (err: any) {
      setActionError(err?.message ?? 'Unable to update basket item.');
    } finally {
      setUpdatingItemIds(prev => ({ ...prev, [artworkId]: false }));
    }
  };

  const totalItems = basketItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAddressMode = basketStatus === 'Address';

  useEffect(() => {
    if (isAddressMode && basketAddress) {
      setOrderAddress(basketAddress);
    }
  }, [isAddressMode, basketAddress]);

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
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4, position: 'relative' }}>
      <PageLoadingOverlay open={basketLoading && hasItems} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Basket</Typography>
        <Typography variant="body1">Total items: {totalItems}</Typography>
      </Box>

      {basketStatus && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Status: {basketStatus}</Typography>
        </Box>
      )}

      {isSummaryMode && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Step 2 - View Summary</Typography>
          <Typography>Review the basket contents before editing again.</Typography>
        </Box>
      )}

      {!basketError && !isSummaryMode && hasItems && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Order summary</Typography>
          <Typography>{totalItems} item(s) ready for payment.</Typography>
        </Box>
      )}

      {basketLoading && !hasItems && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {basketError && (
        <Typography color="error">{basketError}</Typography>
      )}

      {!basketError && !hasItems && !basketLoading && (
        <Typography>Your basket is empty. Add an artwork to create a basket.</Typography>
      )}

      {!basketError && hasItems && !isSummaryMode && !isBasketReadyForReview && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          All items must have a print size and a price before you can review details.
        </Typography>
      )}

      {!basketLoading && !basketError && actionError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {actionError}
        </Typography>
      )}

      {!basketError && hasItems && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {isSummaryMode ? (
            <>
              <Button
                variant="outlined"
                onClick={async () => {
                  setActionError(null);
                  setActivating(true);

                  try {
                    await activateBasket();
                  } catch (err: any) {
                    setActionError(err?.message ?? 'Unable to edit basket.');
                  } finally {
                    setActivating(false);
                  }
                }}
                disabled={basketLoading || activating || paying}
              >
                Edit basket
              </Button>
              <Button
                variant="contained"
                onClick={async () => {
                  setActionError(null);
                  setPaying(true);

                  try {
                    const checkoutUrl = await payOrder();
                    window.location.href = checkoutUrl;
                  } catch (err: any) {
                    setActionError(err?.message ?? 'Unable to start checkout.');
                  } finally {
                    setPaying(false);
                  }
                }}
                disabled={basketLoading || paying || activating}
              >
                Pay order
              </Button>
            </>
          ) : (
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
              disabled={!isEditable || basketLoading || paying || !isBasketReadyForReview}
            >
              Review Details
            </Button>
          )}
        </Box>
      )}

      {!basketError && isAddressMode && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Step 2 - Shipping address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={orderAddress.firstName}
                onChange={event => setOrderAddress(prev => ({ ...prev, firstName: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={orderAddress.lastName}
                onChange={event => setOrderAddress(prev => ({ ...prev, lastName: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={orderAddress.email}
                onChange={event => setOrderAddress(prev => ({ ...prev, email: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={orderAddress.phone}
                onChange={event => setOrderAddress(prev => ({ ...prev, phone: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={orderAddress.country}
                onChange={event => setOrderAddress(prev => ({ ...prev, country: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={orderAddress.city}
                onChange={event => setOrderAddress(prev => ({ ...prev, city: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street"
                value={orderAddress.street}
                onChange={event => setOrderAddress(prev => ({ ...prev, street: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="House Number"
                value={orderAddress.houseNumber}
                onChange={event => setOrderAddress(prev => ({ ...prev, houseNumber: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Postal Code"
                value={orderAddress.postalCode}
                onChange={event => setOrderAddress(prev => ({ ...prev, postalCode: event.target.value }))}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={async () => {
                setActionError(null);
                setActivating(true);
                try {
                  await activateBasket();
                } catch (err: any) {
                  setActionError(err?.message ?? 'Unable to edit basket.');
                } finally {
                  setActivating(false);
                }
              }}
              disabled={basketLoading || activating || isSavingAddress}
            >
              Edit basket
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                setActionError(null);
                setIsSavingAddress(true);

                try {
                  await saveBasketAddress(orderAddress);
                  await continueBasket();
                } catch (err: any) {
                  setActionError(err?.message ?? 'Unable to save address.');
                } finally {
                  setIsSavingAddress(false);
                }
              }}
              disabled={basketLoading || activating || isSavingAddress || !orderAddress.firstName || !orderAddress.lastName || !orderAddress.email || !orderAddress.phone || !orderAddress.country || !orderAddress.city || !orderAddress.street || !orderAddress.houseNumber || !orderAddress.postalCode}
            >
              Continue
            </Button>
          </Box>
        </Box>
      )}

      {!basketError && hasItems && (
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
                    {!isSummaryMode && (
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
                  )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {isSummaryMode ? (
                      <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 2 }}>
                        <Typography>Size: {item.printSizeName ?? selectedPrintSize?.name ?? 'N/A'}</Typography>
                        <Typography>Quantity: {item.quantity}</Typography>
                        <Typography>Price: {item.priceValue != null ? item.priceValue.toFixed(2) : '-'}</Typography>
                        <Typography>
                          Total: {item.priceValue != null ? (item.priceValue * item.quantity).toFixed(2) : '-'}
                        </Typography>
                      </Box>
                    ) : (
                      <>
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
                      </>
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
