import { BFF_HOST } from '../config';
import { fetchClient } from './fetchClient';
import { BasketSummaryDto, OrderAddressDto, PrintSizeDto } from '../types/api';

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

export async function getBasketAddress(): Promise<OrderAddressDto | null> {
  const url = `${BFF_HOST}/api/basket/address`;
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to load basket address.');
  }

  return (await response.json()) as OrderAddressDto;
}

export async function saveBasketAddress(address: OrderAddressDto): Promise<void> {
  await fetchClient<void>('/api/basket/address', {
    method: 'POST',
    data: address,
  });
}

export async function setBasketStatus(status: string): Promise<void> {
  await fetchClient<void>('/api/basket/status', {
    method: 'POST',
    data: { status },
  });
}

export async function reviewBasket(): Promise<void> {
  await setBasketStatus('Address');
}

export async function continueBasket(): Promise<void> {
  await setBasketStatus('Processing');
}

export async function activateBasket(): Promise<void> {
  await setBasketStatus('Active');
}
