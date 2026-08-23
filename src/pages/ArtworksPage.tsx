import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import ArtworkCard from '../components/ArtworkCard';
import { getArtworksPage, getArtworkFilters } from '../api/artworks';
import { ArtworkAuthorDto, ArtworkDto, TagGroupDto } from '../types/api';

function ArtworksPage() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<ArtworkDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<TagGroupDto[]>([]);
  const [authors, setAuthors] = useState<ArtworkAuthorDto[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadFilters() {
      try {
        const filterResult = await getArtworkFilters();
        setFilters(filterResult.tagGroups);
        setAuthors(filterResult.authors);
      } catch (err: any) {
        setError(err?.message ?? 'Unable to load artwork filters.');
      }
    }

    loadFilters();
  }, []);

  useEffect(() => {
    async function loadArtworksPage() {
      setLoading(true);
      setError(null);

      try {
        const pageResult = await getArtworksPage(selectedAuthorId || undefined, true, pageNumber, pageSize, selectedTagIds);
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
  }, [pageNumber, pageSize, selectedTagIds, selectedAuthorId]);

  const pageSizes = [10, 20, 50, 100];
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endIndex = Math.min(totalCount, pageNumber * pageSize);

  const toggleTagSelection = (tagId: string) => {
    setPageNumber(1);
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setPageNumber(1);
    setSelectedTagIds([]);
    setSelectedAuthorId('');
  };

  const toggleAuthorSelection = (authorId: string) => {
    setPageNumber(1);
    setSelectedAuthorId(prev => (prev === authorId ? '' : authorId));
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Artworks
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Select tags and author to narrow the artwork list. Multiple tags are combined with AND semantics.
            </Typography>
          </Box>
          <Button variant="outlined" size="small" onClick={clearFilters} disabled={selectedTagIds.length === 0 && !selectedAuthorId}>
            Clear Filters
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Box sx={{ minWidth: 240, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Author
            </Typography>
            <FormControl component="fieldset" variant="standard">
              <FormGroup>
                {authors.map(author => (
                  <FormControlLabel
                    key={author.id}
                    control={
                      <Checkbox
                        checked={selectedAuthorId === author.id}
                        onChange={() => toggleAuthorSelection(author.id)}
                        name={author.fullName}
                      />
                    }
                    label={author.fullName}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Box>
          {filters.map(group => (
            <Box key={group.tagType} sx={{ minWidth: 220, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {group.tagType}
              </Typography>
              <FormControl component="fieldset" variant="standard">
                <FormGroup>
                  {group.tags.map(tag => (
                    <FormControlLabel
                      key={tag.id}
                      control={
                        <Checkbox
                          checked={selectedTagIds.includes(tag.id)}
                          onChange={() => toggleTagSelection(tag.id)}
                          name={tag.name}
                        />
                      }
                      label={tag.name}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Box>
          ))}
        </Stack>
      </Paper>

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
