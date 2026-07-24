import { ArtworkDto, ArtworkCreateRequest } from '../types/api';
import { fetchClient } from './fetchClient';

export async function getArtworks(creatorId?: string): Promise<ArtworkDto[]> {
  const query = creatorId ? `?creatorId=${encodeURIComponent(creatorId)}` : '';
  return fetchClient<ArtworkDto[]>(`/api/artworks${query}`);
}

export async function getArtworkById(id: string): Promise<ArtworkDto> {
  return fetchClient<ArtworkDto>(`/api/artworks/${id}`);
}

export async function toggleArtworkActive(id: string, isActive: boolean): Promise<ArtworkDto> {
  return fetchClient<ArtworkDto>(`/api/artworks/${id}/active`, {
    method: 'PUT',
    data: { isActive },
  });
}

export async function createArtwork(data: ArtworkCreateRequest): Promise<ArtworkDto> {
  return fetchClient<ArtworkDto>('/api/artworks', {
    method: 'POST',
    data,
  });
}
