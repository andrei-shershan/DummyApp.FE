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

export interface RoleDto {
  id: string;
  name: string;
}
