import React, { useEffect, useState } from 'react';
import { BFF_HOST } from '../config';

interface ArtworkDetailsProps {
  id: number;
  onBack: () => void;
  canToggleActive?: boolean;
}

interface Artwork {
  id: number;
  creatorId: string;
  name: string;
  description: string;
  creationDate: string;
  uploadDate: string;
  imgUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
}

function ArtworkDetails({ id, onBack, canToggleActive }: ArtworkDetailsProps) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    async function loadArtwork() {
      setLoading(true);
      setError('');
      setSaveError('');
      setSaveSuccess('');

      try {
        const url = `${BFF_HOST}/api/artworks/${id}`;
        const response = await fetch(url, { credentials: 'include' });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Artwork not found.');
          }

          const message = await response.text();
          throw new Error(`HTTP ${response.status}: ${message}`);
        }

        const data = await response.json();
        setArtwork(data);
      } catch (err: any) {
        setError(err?.message ?? 'Unable to load artwork.');
      } finally {
        setLoading(false);
      }
    }

    loadArtwork();
  }, [id]);

  async function toggleActive(): Promise<void> {
    if (!artwork) {
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const response = await fetch(`${BFF_HOST}/api/artworks/${id}/active`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !artwork.isActive }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setArtwork(data);
      setSaveSuccess(`Artwork is now ${data.isActive ? 'active' : 'inactive'}.`);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Unable to update artwork status.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ width: '100%', maxWidth: '850px', marginTop: '1.5rem', textAlign: 'left' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 0.9rem',
          borderRadius: '0.45rem',
          border: '1px solid #61dafb',
          background: 'transparent',
          color: '#61dafb',
          cursor: 'pointer',
        }}
      >
        ← Back to My Works
      </button>

      {loading ? (
        <p>Loading artwork details...</p>
      ) : error ? (
        <p style={{ color: '#f97583' }}>{error}</p>
      ) : artwork ? (
        <div style={{ padding: '1rem', borderRadius: '0.6rem', border: '1px solid #444', background: '#111827' }}>
          <h2 style={{ margin: '0 0 0.75rem', color: '#61dafb' }}>{artwork.name}</h2>
          <p style={{ margin: '0.4rem 0', color: '#aaa' }}><strong>Description:</strong> {artwork.description}</p>
          <p style={{ margin: '0.4rem 0', color: '#aaa' }}><strong>Creator:</strong> {artwork.creatorId}</p>
          <p style={{ margin: '0.4rem 0', color: '#aaa' }}><strong>Created:</strong> {new Date(artwork.creationDate).toLocaleDateString()}</p>
          <p style={{ margin: '0.4rem 0', color: '#aaa' }}><strong>Uploaded:</strong> {new Date(artwork.uploadDate).toLocaleString()}</p>
          <p style={{ margin: '0.4rem 0', color: '#aaa' }}><strong>Status:</strong> {artwork.isActive ? 'Active' : 'Inactive'}</p>
          {canToggleActive ? (
            <button
              type="button"
              disabled={saving}
              onClick={toggleActive}
              style={{
                marginTop: '0.75rem',
                padding: '0.6rem 1rem',
                borderRadius: '0.45rem',
                border: '1px solid #61dafb',
                background: saving ? '#223344' : 'transparent',
                color: '#61dafb',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : artwork.isActive ? 'Set Inactive' : 'Set Active'}
            </button>
          ) : null}
          {saveSuccess ? <p style={{ marginTop: '0.75rem', color: '#85e89d' }}>{saveSuccess}</p> : null}
          {saveError ? <p style={{ marginTop: '0.75rem', color: '#f97583' }}>{saveError}</p> : null}
          {artwork.imgUrl && (
            <img
              src={artwork.imgUrl}
              alt={artwork.name}
              style={{ width: '100%', maxWidth: '100%', marginTop: '1rem', borderRadius: '0.5rem' }}
            />
          )}
        </div>
      ) : (
        <p style={{ color: '#aaa' }}>Artwork data is not available.</p>
      )}
    </section>
  );
}

export default ArtworkDetails;
