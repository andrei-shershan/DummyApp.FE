export interface CurrentUser {
  isAuthenticated: boolean;
  id?: string;
  sub?: string;
  name?: string;
  email?: string;
  roles?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  avatarUrl?: string | null;
  avatarSmallUrl?: string | null;
}

export interface UpdateCurrentUserProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UploadCurrentUserAvatarRequest {
  fileName: string;
  base64Image: string;
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
}

export interface ArtworkAuthorDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface ArtworkFiltersDto {
  tagGroups: TagGroupDto[];
  authors: ArtworkAuthorDto[];
}

export interface NewTagRequest {
  name: string;
  type: 'None' | 'Series';
}

export interface ArtworkCreateRequest {
  name: string;
  description?: string;
  creationDate: string;
  uploadedImage?: string | null;
  fileName?: string | null;
  existingTagIds?: string[];
  newTags?: NewTagRequest[];
}

export interface BasketItemDto {
  orderId: string;
  artworkId: string;
  name: string;
  description: string;
  imgUrl: string;
  thumbnailUrl: string;
  quantity: number;
  printSizeId?: number;
  printSizeName?: string;
  priceId?: number;
  priceValue?: number;
}

export interface OrderAddressDto {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  postalCode: string;
}

export interface BasketSummaryDto {
  items: BasketItemDto[];
  status: string;
  address?: OrderAddressDto;
}

export interface OrderSummaryDto {
  orderId: string;
  items: BasketItemDto[];
  status: string;
  email: string;
  address?: OrderAddressDto;
}

export interface PriceDto {
  id: number;
  printSizeId: number;
  value: number;
  updatedAt: string;
  isDeleted: boolean;
}

export interface PrintSizeDto {
  id: number;
  name: string;
  prices: PriceDto[];
}

export interface AdminUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
}

export interface TagDto {
  id: string;
  name: string;
  type: string;
}

export interface TagGroupDto {
  tagType: string;
  tags: TagDto[];
}

export interface RoleDto {
  id: string;
  name: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}
