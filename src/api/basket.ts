import { BFF_HOST } from '../config';
import { fetchClient } from './fetchClient';
import { BasketItemDto, BasketSummaryDto } from '../types/api';

export async function addArtworkToBasket(artworkId: string): Promise<void> {
  await updateBasketItemQuantity(artworkId, 1);
}

export async function updateBasketItemQuantity(artworkId: string, quantity: number): Promise<void> {
  await fetchClient<void>('/api/basket/items', {
    method: 'POST',
    data: { artworkId, quantity },
  });
}

export async function getBasketSummary(): Promise<BasketSummaryDto | null> {
  const url = `${BFF_HOST}/api/basket`;
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to load basket summary.');
  }

  return (await response.json()) as BasketSummaryDto;
}

export async function payBasket(): Promise<void> {
  await fetchClient<void>('/api/basket/pay', {
    method: 'POST',
  });
}
