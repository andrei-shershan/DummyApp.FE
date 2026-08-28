import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getAnalytics } from '../api/analytics';
import { AnalyticsEventDto } from '../types/api';

const filterOptions = [
  { label: '1 day', value: 1 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
];

function AnalyticsPage() {
  const [periodDays, setPeriodDays] = useState(7);
  const [data, setData] = useState<AnalyticsEventDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const analytics = await getAnalytics(periodDays);
        setData(analytics);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [periodDays]);

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {filterOptions.map(option => (
          <Button
            key={option.value}
            variant={option.value === periodDays ? 'contained' : 'outlined'}
            onClick={() => setPeriodDays(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && data.length === 0 && (
        <Typography>No data for selected period.</Typography>
      )}

      <Grid container spacing={2}>
        {data.map(item => (
          <Grid item xs={12} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Event {item.id}
                </Typography>
                <Typography variant="body2">OrderId: {item.orderId}</Typography>
                <Typography variant="body2">Status: {item.status}</Typography>
                <Typography variant="body2">Email: {item.email}</Typography>
                <Typography variant="body2">SiteId: {item.siteId}</Typography>
                <Typography variant="body2">Timestamp: {new Date(item.eventTimestamp).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default AnalyticsPage;
