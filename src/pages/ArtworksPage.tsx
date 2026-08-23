import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ArtworkCard from '../components/ArtworkCard';
import { getArtworksPage } from '../api/artworks';
import { ArtworkDto } from '../types/api';

function ArtworksPage() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<ArtworkDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadArtworksPage() {
      setLoading(true);
      setError(null);

      try {
        const pageResult = await getArtworksPage(undefined, true, pageNumber, pageSize);
        setArtworks(pageResult.items);
        setTotalCount(pageResult.totalCount);
      } catch (err: any) {
        setError(err?.message ?? 'Unable to load artworks.');
        setArtworks([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }

    loadArtworksPage();
  }, [pageNumber, pageSize]);

  const pageSizes = [10, 20, 50, 100];
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endIndex = Math.min(totalCount, pageNumber * pageSize);

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Artworks
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="body1">
          Showing {startIndex}–{endIndex} of {totalCount}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">Show:</Typography>
          <ButtonGroup variant="outlined" size="small">
            {pageSizes.map(size => (
              <Button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setPageNumber(1);
                }}
                variant={pageSize === size ? 'contained' : 'outlined'}
              >
                {size}
              </Button>
            ))}
          </ButtonGroup>
        </Stack>
      </Stack>

      {loading && <Typography>Loading artworks...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && artworks.length === 0 && <Typography>No artworks found.</Typography>}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {artworks.map(artwork => (
          <Grid item xs={12} sm={6} md={4} key={artwork.id}>
            <ArtworkCard artwork={artwork} onViewDetails={() => navigate(`/artworks/${artwork.id}`)} />
          </Grid>
        ))}
      </Grid>

      {!loading && !error && totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={(_, value) => setPageNumber(value)}
            color="primary"
          />
        </Stack>
      )}
    </Container>
  );
}

export default ArtworksPage;
