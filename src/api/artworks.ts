import { ArtworkDto, ArtworkCreateRequest, SeriesDto } from '../types/api';
import { fetchClient } from './fetchClient';

export async function getArtworks(creatorId?: string, isActive = true): Promise<ArtworkDto[]> {
  const params = new URLSearchParams();
  if (creatorId) {
    params.append('creatorId', creatorId);
  }
  params.append('isActive', String(isActive));

  return fetchClient<ArtworkDto[]>(`/api/artworks?${params.toString()}`);
}

export async function getArtworkById(id: string, activeOnly = true): Promise<ArtworkDto> {
  const params = new URLSearchParams({ activeOnly: String(activeOnly) });
  return fetchClient<ArtworkDto>(`/api/artworks/${id}?${params.toString()}`);
}

export async function getArtworkSeries(creatorId: string): Promise<SeriesDto[]> {
  const params = new URLSearchParams({ creatorId });
  return fetchClient<SeriesDto[]>(`/api/artworks/series?${params.toString()}`);
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
