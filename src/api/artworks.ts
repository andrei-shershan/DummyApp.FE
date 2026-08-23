import { ArtworkDto, ArtworkCreateRequest, PaginatedResult, TagGroupDto } from '../types/api';
import { fetchClient } from './fetchClient';

export async function getArtworks(creatorId?: string, isActive = true): Promise<ArtworkDto[]> {
  const params = new URLSearchParams();
  if (creatorId) {
    params.append('creatorId', creatorId);
  }
  params.append('isActive', String(isActive));

  return fetchClient<ArtworkDto[]>(`/api/artworks?${params.toString()}`);
}

export async function getArtworkPrerequisites(): Promise<TagGroupDto[]> {
  return fetchClient<TagGroupDto[]>('/api/artworks/pre-requisit');
}

export async function getArtworkFilters(): Promise<TagGroupDto[]> {
  return fetchClient<TagGroupDto[]>('/api/artworks/filters');
}

export async function getArtworkById(id: string, activeOnly = true): Promise<ArtworkDto> {
  const params = new URLSearchParams({ activeOnly: String(activeOnly) });
  return fetchClient<ArtworkDto>(`/api/artworks/${id}?${params.toString()}`);
}

export async function getArtworksPage(creatorId?: string, isActive = true, pageNumber = 1, pageSize = 10, tagIds?: string[]): Promise<PaginatedResult<ArtworkDto>> {
  const params = new URLSearchParams({
    isActive: String(isActive),
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });

  if (creatorId) {
    params.append('creatorId', creatorId);
  }

  if (tagIds?.length) {
    tagIds.forEach(tagId => params.append('tagIds', tagId));
  }

  return fetchClient<PaginatedResult<ArtworkDto>>(`/api/artworks/page?${params.toString()}`);
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
