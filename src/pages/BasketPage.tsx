import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useAppContext } from '../context/AppContext';
import PageLoadingOverlay from '../components/PageLoadingOverlay';
import { getBasketPrintSizes } from '../api/basket';
import { OrderAddressDto, PrintSizeDto } from '../types/api';

function BasketPage() {
  const navigate = useNavigate();
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
  const basketTotalPrice = basketItems.reduce((sum, item) => sum + ((item.priceValue ?? 0) * item.quantity), 0);

  const truncateDescription = (text: string | null | undefined) => {
    const value = text ?? '';
    return value.length > 200 ? `${value.slice(0, 200).trimEnd()}...` : value;
  };

  const basketSummaryCompact = () => (
    <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom component="h2" sx={{ color: 'primary.main !important', fontWeight: 700 }}>
        Order summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {totalItems} item{totalItems !== 1 ? 's' : ''} · Total: {basketTotalPrice.toFixed(2)}
      </Typography>
      <List disablePadding>
        {basketItems.map(item => {
          const sizeName = item.printSizeName ?? printSizeOptions.find(size => size.id === item.printSizeId)?.name ?? 'N/A';
          return (
            <ListItem key={`${item.orderId}-${item.artworkId}`} sx={{ p: 1, alignItems: 'center' }}>
              <ListItemAvatar>
                <Avatar variant="rounded" src={item.thumbnailUrl} alt={item.name} sx={{ width: 100, height: 100 }} />
              </ListItemAvatar>
              <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {sizeName} · Qty {item.quantity} · {item.priceValue != null ? item.priceValue.toFixed(2) : '-'}
                </Typography>
              </Box>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="subtitle2" fontWeight="bold">
          Total: {basketTotalPrice.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );

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

      {isSummaryMode && (
        <Box sx={{ mb: 3 }}>
          {basketSummaryCompact()}
          <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Delivery details
            </Typography>
            {basketAddress ? (
              <Box>
                <Typography>{basketAddress.firstName} {basketAddress.lastName}</Typography>
                <Typography>{basketAddress.phone}</Typography>
                <Typography>{basketAddress.email}</Typography>
                <Typography>{basketAddress.street} {basketAddress.houseNumber}, {basketAddress.city}, {basketAddress.postalCode}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">Delivery address is not available.</Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              you will be redirected to Stripe
            </Typography>
          </Box>
          <Typography variant="h6">Step 3 - Order confirmation</Typography>
          <Typography>Review the basket contents and delivery details before payment.</Typography>
        </Box>
      )}

      {!basketError && hasItems && isAddressMode && (
        <Box sx={{ mb: 2 }}>
          {/* Summary card is shown inside the address step panel, do not duplicate here */}
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

      {!basketError && hasItems && isSummaryMode && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={async () => {
              setActionError(null);
              setActivating(true);

              try {
                await payBasket();
              } catch (err: any) {
                setActionError(err?.message ?? 'Unable to edit address.');
              } finally {
                setActivating(false);
              }
            }}
            disabled={basketLoading || activating || paying}
          >
            Edit address
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
        </Box>
      )}

      {!basketError && isAddressMode && (
        <Box sx={{ mb: 4 }}>
          {basketSummaryCompact()}
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

      {!basketError && hasItems && isEditable && (
        <List>
          {basketItems.map(item => {
            const currentPrintSizeId = item.printSizeId;
            const selectedPrintSize = printSizeOptions.find(size => size.id === currentPrintSizeId) ?? printSizeOptions[0];

            return (
              <React.Fragment key={`${item.orderId}-${item.artworkId}`}>
                <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, cursor: 'pointer' }}
                      onClick={() => navigate(`/artworks/${item.artworkId}`)}
                    >
                      <ListItemAvatar>
                        <Avatar variant="rounded" src={item.thumbnailUrl} alt={item.name} sx={{ width: 150, height: 150 }} />
                      </ListItemAvatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ '&:hover': { color: 'primary.main' } }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {truncateDescription(item.description)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
                      <Button
                        size="large"
                        variant="outlined"
                        disabled={!isEditable || basketLoading || updatingItemIds[item.artworkId]}
                        onClick={() => handleItemUpdate(item.artworkId, Math.max(item.quantity - 1, 0), item.printSizeId, item.priceId)}
                        sx={{ width: 48, height: 48, minWidth: 48, borderWidth: 2, fontSize: '1.25rem' }}
                      >
                        −
                      </Button>
                      <Typography variant="h6" sx={{ minWidth: 28, textAlign: 'center' }}>{item.quantity}</Typography>
                      <Button
                        size="large"
                        variant="outlined"
                        disabled={!isEditable || basketLoading || updatingItemIds[item.artworkId]}
                        onClick={() => handleItemUpdate(item.artworkId, item.quantity + 1, item.printSizeId, item.priceId)}
                        sx={{ width: 48, height: 48, minWidth: 48, borderWidth: 2, fontSize: '1.25rem' }}
                      >
                        +
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: '1 1 320px', minWidth: 240 }}>
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
                        <Box sx={{ width: '100%', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Select print size
                          </Typography>
                          <ButtonGroup variant="outlined" size="small" sx={{ flexWrap: 'wrap' }}>
                            {printSizeOptions.map(size => {
                              const price = size.prices[0];
                              const label = price ? `${size.name} - ${price.value.toFixed(2)}` : size.name;
                              return (
                                <Button
                                  key={size.id}
                                  onClick={async () => {
                                    const newPriceId = price?.id;
                                    await handleItemUpdate(item.artworkId, item.quantity, size.id, newPriceId);
                                  }}
                                  variant={currentPrintSizeId === size.id ? 'contained' : 'outlined'}
                                  disabled={!isEditable || basketLoading || updatingItemIds[item.artworkId] || !price}
                                  sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                                >
                                  {label}
                                </Button>
                              );
                            })}
                          </ButtonGroup>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}

      {!basketError && hasItems && isEditable && (
        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
            disabled={basketLoading || paying || !isBasketReadyForReview}
          >
            Continue
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default BasketPage;
