import { fetchClient } from './fetchClient';
import { OrderSummaryDto } from '../types/api';

export async function getCompletedOrders(): Promise<OrderSummaryDto[]> {
  try {
    return await fetchClient<OrderSummaryDto[]>('/api/orders/completed');
  } catch (error: any) {
    if (error?.statusCode === 404) {
      return [];
    }

    throw error;
  }
}
