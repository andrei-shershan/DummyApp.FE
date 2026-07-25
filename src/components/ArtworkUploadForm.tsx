import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';
import { SeriesDto } from '../types/api';
import { getArtworkSeries } from '../api/artworks';

interface ArtworkFormData {
  name: string;
  description: string;
  creationDate: string;
  seriesName: string;
  uploadedImage: string | null;
  fileName: string | null;
}

function ArtworkUploadForm() {
  const { createArtwork, user } = useAppContext();
  const [form, setForm] = useState<ArtworkFormData>({
    name: '',
    description: '',
    creationDate: new Date().toISOString().split('T')[0],
    seriesName: '',
    uploadedImage: null,
    fileName: null,
  });
  const [seriesList, setSeriesList] = useState<SeriesDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm(prev => ({
        ...prev,
        uploadedImage: result.split(',')[1],
        fileName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    async function loadSeries() {
      if (!user?.id && !user?.sub) {
        return;
      }

      try {
        const creatorId = user.id || user.sub!;
        const series = await getArtworkSeries(creatorId);
        setSeriesList(series);
      } catch {
        // ignore series load failure for now
      }
    }

    loadSeries();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createArtwork({
        name: form.name,
        description: form.description,
        creationDate: new Date(form.creationDate).toISOString(),
        uploadedImage: form.uploadedImage,
        fileName: form.fileName,
        seriesName: form.seriesName,
      });
      setSuccess('Artwork created successfully.');
      setForm({ name: '', description: '', creationDate: new Date().toISOString().split('T')[0], seriesName: '', uploadedImage: null, fileName: null });
    } catch (err: any) {
      setError(err?.message ?? 'Unable to create artwork.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 4, maxWidth: 720 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Upload Artwork
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            multiline
            rows={4}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Creation Date"
            type="date"
            value={form.creationDate}
            InputLabelProps={{ shrink: true }}
            onChange={e => setForm(prev => ({ ...prev, creationDate: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Series Name"
            value={form.seriesName}
            onChange={e => setForm(prev => ({ ...prev, seriesName: e.target.value }))}
            fullWidth
            InputProps={{
              inputProps: {
                list: 'series-list',
              },
            }}
          />
          <datalist id="series-list">
            {seriesList.map(series => (
              <option key={series.id} value={series.name} />
            ))}
          </datalist>
          <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
            Upload Image
            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
          </Button>
          {form.fileName && <Typography variant="body2">Selected file: {form.fileName}</Typography>}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Button type="submit" variant="contained" disabled={loading || !form.name}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
            {success && <Typography color="success.main">{success}</Typography>}
            {error && <Typography color="error">{error}</Typography>}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ArtworkUploadForm;
