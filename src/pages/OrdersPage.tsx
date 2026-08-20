import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useAppContext } from '../context/AppContext';
import PageLoadingOverlay from '../components/PageLoadingOverlay';
import { sendVerificationCode, verifyVerificationCode } from '../api/verification';

function OrdersPage() {
  const { basketItems, basketLoading, basketError, basketStatus } = useAppContext();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

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

  useEffect(() => {
    const completedOrdersCookie = document.cookie
      .split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith('CompletedOrders='));

    if (completedOrdersCookie) {
      setVerified(true);
    }
  }, []);

  const handleSendVerification = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitLoading(true);
    try {
      await sendVerificationCode(email);
      setVerificationSent(true);
      setInfoMessage('Verification code has been sent to your email. Please enter the code below.');
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Unable to send verification code.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!code || code.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setSubmitLoading(true);
    try {
      await verifyVerificationCode(email, code);
      setVerified(true);
      setInfoMessage('Verification successful. You can now view your orders.');
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Unable to verify the code.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!verified) {
    return (
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 520, mx: 'auto', pt: 4 }}>
          <Typography variant="h4">Completed orders verification</Typography>
          <Typography color="text.secondary">
            To view your completed orders, please enter the email address where we can send a verification code.
          </Typography>

          {infoMessage && (
            <Typography color="success.main">{infoMessage}</Typography>
          )}

          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}

          <TextField
            label="Email"
            value={email}
            type="email"
            disabled={submitLoading || verificationSent}
            onChange={event => setEmail(event.target.value)}
            fullWidth
          />

          {verificationSent && (
            <TextField
              label="Verification code"
              value={code}
              onChange={event => setCode(event.target.value)}
              fullWidth
              inputProps={{ maxLength: 6 }}
            />
          )}

          <Button
            variant="contained"
            onClick={verificationSent ? handleVerifyCode : handleSendVerification}
            disabled={submitLoading || (verificationSent ? !code : !email)}
          >
            {verificationSent ? 'Verify code' : 'Send verification code'}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4, position: 'relative' }}>
      <PageLoadingOverlay open={basketLoading && basketItems.length > 0} />
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

      {basketLoading && basketItems.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {basketError && (
        <Typography color="error">{basketError}</Typography>
      )}

      {!basketError && basketItems.length === 0 && !basketLoading && (
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
