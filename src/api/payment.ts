import { fetchClient } from './fetchClient';

export interface CheckoutResponse {
  url: string;
}

export async function checkoutBasket(): Promise<string> {
  const response = await fetchClient<CheckoutResponse>('/api/basket/checkout', {
    method: 'POST',
  });

  if (!response?.url) {
    throw new Error('Checkout URL was not returned by the server.');
  }

  return response.url;
}
