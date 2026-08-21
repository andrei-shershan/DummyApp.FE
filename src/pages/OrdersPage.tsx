import React, { useEffect, useState } from 'react';
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
import { getCompletedOrders } from '../api/orders';
import { sendVerificationCode, verifyVerificationCode } from '../api/verification';
import { OrderSummaryDto } from '../types/api';

function OrdersPage() {
  const [completedOrders, setCompletedOrders] = useState<OrderSummaryDto[]>([]);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [completedError, setCompletedError] = useState<string | null>(null);
  const [completedLoaded, setCompletedLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loadCompletedOrders = async () => {
    setCompletedLoading(true);
    setCompletedError(null);

    try {
      const orders = await getCompletedOrders();
      setCompletedOrders(orders);
    } catch (error: any) {
      setCompletedError(error?.message ?? 'Unable to load completed orders.');
    } finally {
      setCompletedLoading(false);
      setCompletedLoaded(true);
    }
  };

  useEffect(() => {
    void loadCompletedOrders();
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
      setInfoMessage('Verification successful. You can now view your orders.');
      void loadCompletedOrders();
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Unable to verify the code.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Completed orders
          </Typography>
          <Typography color="text.secondary">Completed orders are loaded automatically when available.</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 520, mb: 4 }}>
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

      <>
        {completedLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {completedError && (
          <Typography color="error">{completedError}</Typography>
        )}

        {!completedLoading && completedLoaded && !completedError && completedOrders.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 4 }}>
            <Typography>No completed orders were found for this session.</Typography>
            <Button variant="contained" href="/artworks">Browse artworks</Button>
          </Box>
        )}

        {!completedLoading && completedLoaded && !completedError && completedOrders.length > 0 && (
          <Box>
            {completedOrders.map(order => (
              <Box key={order.orderId} sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                  <Typography variant="h6">Order {order.orderId}</Typography>
                  <Typography variant="body2" color="text.secondary">Status: {order.status}</Typography>
                </Box>

                <List disablePadding>
                  {order.items.map(item => (
                    <React.Fragment key={`${order.orderId}-${item.artworkId}`}>
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
              </Box>
            ))}
          </Box>
        )}
      </>
    </Container>
  );
}

export default OrdersPage;
