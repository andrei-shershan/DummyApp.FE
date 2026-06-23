import React, { useEffect, useState } from 'react';
import { BFF_HOST } from '../config';

interface Artwork {
  id: number;
  creatorId: string;
  name: string;
  publicName: string;
  description: string;
  creationDate: string;
  uploadDate: string;
  imgUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
}

interface ArtworkListProps {
  creatorId?: string;
}

function ArtworkList({ creatorId }: ArtworkListProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadArtworks() {
      setLoading(true);
      setError('');

      try {
        const url = creatorId ? `${BFF_HOST}/api/artworks/creator/${encodeURIComponent(creatorId)}` : `${BFF_HOST}/api/artworks`;
        const response = await fetch(url, {
          credentials: 'include',
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(`HTTP ${response.status}: ${message}`);
        }

        const data = await response.json();
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
          <article key={artwork.id} style={{ padding: '1rem', borderRadius: '0.6rem', border: '1px solid #444', background: '#111827' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>{artwork.publicName || artwork.name}</h3>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Name:</strong> {artwork.name}</p>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Description:</strong> {artwork.description}</p>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Created:</strong> {new Date(artwork.creationDate).toLocaleDateString()}</p>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Uploaded:</strong> {new Date(artwork.uploadDate).toLocaleString()}</p>
            <p style={{ margin: '0.3rem 0', color: '#aaa' }}><strong>Active:</strong> {artwork.isActive ? 'Yes' : 'No'}</p>
            {artwork.imgUrl && (
              <img
                src={artwork.imgUrl}
                alt={artwork.publicName || artwork.name}
                style={{ width: '100%', maxWidth: '320px', marginTop: '0.75rem', borderRadius: '0.5rem' }}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default ArtworkList;
