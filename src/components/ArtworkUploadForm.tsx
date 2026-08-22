import React, { useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';
import { NewTagRequest, TagDto, TagGroupDto } from '../types/api';

interface ArtworkFormData {
  name: string;
  description: string;
  creationDate: string;
  uploadedImage: string | null;
  fileName: string | null;
  fileType: string | null;
}

interface ArtworkUploadFormProps {
  prerequisites: TagGroupDto[];
}

function ArtworkUploadForm({ prerequisites }: ArtworkUploadFormProps) {
  const { createArtwork } = useAppContext();
  const [form, setForm] = useState<ArtworkFormData>({
    name: '',
    description: '',
    creationDate: new Date().toISOString().split('T')[0],
    uploadedImage: null,
    fileName: null,
    fileType: null,
  });
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
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

  const seriesOptions = useMemo(() => {
    return prerequisites.find(group => group.tagType === 'Series')?.tags ?? [];
  }, [prerequisites]);

  const tagOptions = useMemo(() => {
    return prerequisites.find(group => group.tagType === 'None')?.tags ?? [];
  }, [prerequisites]);

  const availableNewTagName = newTagName.trim();
  const totalTagCount = selectedTagIds.length + newTags.length + (selectedSeriesId ? 1 : newSeriesName ? 1 : 0);

  const handleAddNewTag = () => {
    const tagName = availableNewTagName;
    if (!tagName || newTags.includes(tagName)) {
      return;
    }

    if (totalTagCount >= 10) {
      setError('A maximum of 10 tags is allowed.');
      return;
    }

    setNewTags(prev => [...prev, tagName]);
    setNewTagName('');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const existingTagIds = [...selectedTagIds];
    if (selectedSeriesId) {
      existingTagIds.push(selectedSeriesId);
    }

    const newTagRequests: NewTagRequest[] = newTags.map(name => ({ name, type: 'None' }));
    if (newSeriesName.trim()) {
      newTagRequests.push({ name: newSeriesName.trim(), type: 'Series' });
    }

    try {
      await createArtwork({
        name: form.name,
        description: form.description,
        creationDate: new Date(form.creationDate).toISOString(),
        uploadedImage: form.uploadedImage,
        fileName: form.fileName,
        existingTagIds: existingTagIds.length ? existingTagIds : undefined,
        newTags: newTagRequests.length ? newTagRequests : undefined,
      });
      setSuccess('Artwork created successfully.');
      setForm({ name: '', description: '', creationDate: new Date().toISOString().split('T')[0], uploadedImage: null, fileName: null, fileType: null });
      setSelectedSeriesId(null);
      setNewSeriesName('');
      setSelectedTagIds([]);
      setNewTagName('');
      setNewTags([]);
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
          <Box sx={{ display: 'grid', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
            <Typography variant="subtitle1">Tags and Series</Typography>
            <Autocomplete
              options={seriesOptions}
              getOptionLabel={(option: TagDto) => option.name}
              value={seriesOptions.find(option => option.id === selectedSeriesId) ?? null}
              onChange={(event, value) => {
                setSelectedSeriesId(value?.id ?? null);
                if (value) {
                  setNewSeriesName('');
                }
              }}
              renderInput={params => <TextField {...params} label="Select series" />}
              clearOnEscape
            />
            <TextField
              label="Or create new series"
              value={newSeriesName}
              onChange={e => {
                setNewSeriesName(e.target.value);
                if (e.target.value) {
                  setSelectedSeriesId(null);
                }
              }}
              helperText="Leave empty to keep no series selection."
              fullWidth
            />
            <Autocomplete
              multiple
              options={tagOptions}
              getOptionLabel={(option: TagDto) => option.name}
              value={tagOptions.filter(option => selectedTagIds.includes(option.id))}
              onChange={(event, value) => setSelectedTagIds(value.map(item => item.id))}
              renderInput={params => <TextField {...params} label="Select existing tags" />}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Add new tag"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                fullWidth
              />
              <Button type="button" variant="outlined" onClick={handleAddNewTag}>
                Add
              </Button>
            </Box>
            {newTags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {newTags.map(tag => (
                  <Chip key={tag} label={tag} onDelete={() => setNewTags(prev => prev.filter(item => item !== tag))} />
                ))}
              </Box>
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Total tags: {totalTagCount}/10. Series counts as one tag.
            </Typography>
          </Box>
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
