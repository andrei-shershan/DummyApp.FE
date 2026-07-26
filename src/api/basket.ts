import { BFF_HOST } from '../config';
import { fetchClient } from './fetchClient';
import { BasketItemDto } from '../types/api';

export async function addArtworkToBasket(artworkId: string): Promise<void> {
  await updateBasketItemQuantity(artworkId, 1);
}

export async function updateBasketItemQuantity(artworkId: string, quantity: number): Promise<void> {
  await fetchClient<void>('/api/basket/items', {
    method: 'POST',
    data: { artworkId, quantity },
  });
}

export async function getBasketItems(): Promise<BasketItemDto[]> {
  const url = `${BFF_HOST}/api/basket/items`;
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to load basket items.');
  }

  return (await response.json()) as BasketItemDto[];
}
