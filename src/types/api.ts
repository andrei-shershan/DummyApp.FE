export interface CurrentUser {
  isAuthenticated: boolean;
  id?: string;
  sub?: string;
  name?: string;
  email?: string;
  roles?: string[];
}

export interface ArtworkDto {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  creationDate: string;
  uploadDate: string;
  imgUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
  seriesName?: string | null;
}

export interface ArtworkCreateRequest {
  name: string;
  description?: string;
  creationDate: string;
  uploadedImage?: string | null;
  fileName?: string | null;
  seriesName?: string | null;
}

export interface SeriesDto {
  id: string;
  creatorId: string;
  name: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
}

export interface RoleDto {
  id: string;
  name: string;
}
