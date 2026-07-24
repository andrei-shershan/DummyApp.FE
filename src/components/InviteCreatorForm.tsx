import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';

function InviteCreatorForm() {
  const { sendInvite } = useAppContext();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await sendInvite(email);
      setStatus('Invite sent successfully.');
      setEmail('');
    } catch (err: any) {
      setStatus(`Failed to send invite: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Invite Creator
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, maxWidth: 480 }}>
          <TextField
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="creator@example.com"
            required
            fullWidth
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button type="submit" variant="contained" disabled={loading || email.trim() === ''}>
              {loading ? 'Sending...' : 'Send Invite'}
            </Button>
            {status && (
              <Typography color={status.startsWith('Failed') ? 'error' : 'success.main'}>{status}</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default InviteCreatorForm;
