import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';

interface ArtworkFormData {
  name: string;
  description: string;
  creationDate: string;
  uploadedImage: string | null;
  fileName: string | null;
  fileType: string | null;
}

function ArtworkUploadForm() {
  const { createArtwork } = useAppContext();
  const [form, setForm] = useState<ArtworkFormData>({
    name: '',
    description: '',
    creationDate: new Date().toISOString().split('T')[0],
    uploadedImage: null,
    fileName: null,
    fileType: null,
  });
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
      const [, base64] = result.split(',');
      setForm(prev => ({
        ...prev,
        uploadedImage: base64,
        fileName: file.name,
        fileType: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

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
      });
      setSuccess('Artwork created successfully.');
      setForm({ name: '', description: '', creationDate: new Date().toISOString().split('T')[0], uploadedImage: null, fileName: null, fileType: null });
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
          <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
            Upload Image
            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
          </Button>
          {form.fileName && <Typography variant="body2">Selected file: {form.fileName}</Typography>}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Image should be portrait A4, at least 1024px wide, and no more than 10 MB.
          </Typography>
          {form.uploadedImage && (
            <Box sx={{ width: '100%', maxWidth: 360, aspectRatio: '1 / 1.414', overflow: 'hidden', borderRadius: 2, border: 1, borderColor: 'divider', mt: 1 }}>
              <Box
                component="img"
                src={`data:${form.fileType ?? 'image/png'};base64,${form.uploadedImage}`}
                alt={form.fileName ?? 'Uploaded artwork preview'}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}
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
