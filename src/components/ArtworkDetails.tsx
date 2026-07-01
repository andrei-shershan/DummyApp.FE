import React, { useEffect, useState } from 'react';
import { BFF_HOST } from '../config';

interface ArtworkDetailsProps {
  id: number;
  onBack: () => void;
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

function ArtworkDetails({ id, onBack }: ArtworkDetailsProps) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadArtwork() {
      setLoading(true);
      setError('');

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
