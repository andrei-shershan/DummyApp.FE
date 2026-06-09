import React, { useState } from 'react';
import { BFF_HOST } from '../config';

interface ArtworkFormData {
  name: string;
  description: string;
  creationDate: string;
  isActive: boolean;
  uploadedImage: string | null;
}

interface Props {
  onCreated?: (id: number) => void;
}

function ArtworkUploadForm({ onCreated }: Props) {
  const [form, setForm] = useState<ArtworkFormData>({
    name: '',
    description: '',
    creationDate: new Date().toISOString().split('T')[0],
    isActive: true,
    uploadedImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setForm(prev => ({ ...prev, uploadedImage: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BFF_HOST}/api/artworks`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          creationDate: new Date(form.creationDate).toISOString(),
          imgUrl: '',
          smallImgUrl: '',
          isActive: form.isActive,
          uploadedImage: form.uploadedImage,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const result = await response.json();
      setSuccess(`Artwork created (id: ${result.id})`);
      setForm({ name: '', description: '', creationDate: new Date().toISOString().split('T')[0], isActive: true, uploadedImage: null });
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginTop: '1.5rem', textAlign: 'left', maxWidth: '420px' }}>
      <h3 style={{ marginBottom: '0.75rem', color: '#61dafb' }}>Upload Artwork</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
            style={inputStyle}
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </label>
        <label>
          Creation date
          <input
            type="date"
            value={form.creationDate}
            onChange={e => setForm(prev => ({ ...prev, creationDate: e.target.value }))}
            required
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
          />
          Active
        </label>
        <label>
          Image
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', marginTop: '0.25rem' }} />
        </label>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Uploading...' : 'Create'}
        </button>
        {error && <span style={{ color: '#f97583' }}>{error}</span>}
        {success && <span style={{ color: '#85e89d' }}>{success}</span>}
      </form>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '0.25rem',
  padding: '0.35rem 0.5rem',
  borderRadius: '0.3rem',
  border: '1px solid #444',
  background: '#1a1a2e',
  color: '#fff',
  fontSize: '0.9rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.45rem 1rem',
  borderRadius: '0.4rem',
  border: '1px solid #61dafb',
  background: 'transparent',
  color: '#61dafb',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

export default ArtworkUploadForm;
