import { BFF_HOST } from '../config';
import { fetchClient } from './fetchClient';
import { BasketSummaryDto, PrintSizeDto } from '../types/api';

export async function addArtworkToBasket(artworkId: string): Promise<void> {
  await fetchClient<void>('/api/basket/items', {
    method: 'POST',
    data: { artworkId, quantity: 1 },
  });
}

export async function updateBasketItemQuantity(artworkId: string, quantity: number, printSizeId?: number, priceId?: number): Promise<void> {
  await fetchClient<void>(`/api/basket/items/${artworkId}`, {
    method: 'PATCH',
    data: { quantity, printSizeId, priceId },
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

export async function getBasketPrintSizes(): Promise<PrintSizeDto[]> {
  return fetchClient<PrintSizeDto[]>('/api/basket/print-sizes');
}

export async function payBasket(): Promise<void> {
  await fetchClient<void>('/api/basket/pay', {
    method: 'POST',
  });
}
