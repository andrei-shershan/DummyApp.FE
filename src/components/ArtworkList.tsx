import React, { useEffect, useState } from 'react';
import { getArtworks } from '../api/artworks';
import { ArtworkDto } from '../types/api';

interface ArtworkListProps {
  creatorId?: string;
  onSelect?: (id: string) => void;
}

function ArtworkList({ creatorId, onSelect }: ArtworkListProps) {
  const [artworks, setArtworks] = useState<ArtworkDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadArtworks() {
      setLoading(true);
      setError('');

      try {
        const data = await getArtworks(creatorId);
        setArtworks(data);
      } catch (err: any) {
        setError(err?.message ?? 'Unable to load artworks.');
      } finally {
        setLoading(false);
      }
    }

    loadArtworks();
  }, [creatorId]);

  return (
    <section style={{ width: '100%', maxWidth: '900px', marginTop: '1.5rem', textAlign: 'left' }}>
      <h2 style={{ color: '#61dafb' }}>{creatorId ? 'My Works' : 'Artworks'}</h2>
      {loading && <p>Loading artworks...</p>}
      {error && <p style={{ color: '#f97583' }}>{error}</p>}
      {!loading && !error && artworks.length === 0 && <p>No artworks found.</p>}
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {artworks.map(artwork => (
          <article
            key={artwork.id}
            onClick={onSelect ? () => onSelect(artwork.id) : undefined}
            style={{
              padding: '1rem',
              borderRadius: '0.6rem',
              border: '1px solid #444',
              background: '#111827',
              cursor: onSelect ? 'pointer' : 'default',
              transition: 'border-color 0.15s ease, transform 0.15s ease',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>{artwork.name ?? artwork.description ?? 'Untitled artwork'}</h3>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Name:</strong> {artwork.name ?? 'Untitled'}</p>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Description:</strong> {artwork.description}</p>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Created:</strong> {artwork.creationDate ? new Date(artwork.creationDate).toLocaleDateString() : 'Unknown'}</p>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Uploaded:</strong> {artwork.uploadDate ? new Date(artwork.uploadDate).toLocaleString() : 'Unknown'}</p>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Active:</strong> {artwork.isActive ? 'Yes' : 'No'}</p>
            {(artwork.imgUrl ?? artwork.thumbnailUrl) && (
              <img
                src={artwork.imgUrl ?? artwork.thumbnailUrl}
                alt={artwork.name ?? 'Artwork image'}
                style={{ width: '100%', maxWidth: '320px', marginTop: '0.75rem', borderRadius: '0.5rem' }}
              />
            )}
            {onSelect ? (
              <div style={{ marginTop: '0.75rem', color: '#61dafb', fontWeight: 'bold' }}>
                Click to view details
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default ArtworkList;
