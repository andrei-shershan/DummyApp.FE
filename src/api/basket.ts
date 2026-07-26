import { fetchClient } from './fetchClient';
import { BasketItemDto } from '../types/api';

export async function addArtworkToBasket(artworkId: string): Promise<void> {
  await fetchClient<void>('/api/basket/items', {
    method: 'POST',
    data: { artworkId },
  });
}

export async function getBasketItems(): Promise<BasketItemDto[]> {
  return fetchClient<BasketItemDto[]>('/api/basket/items');
}
