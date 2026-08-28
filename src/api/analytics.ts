import { AnalyticsEventDto } from '../types/api';
import { fetchClient } from './fetchClient';

export async function getAnalytics(periodDays: number): Promise<AnalyticsEventDto[]> {
  const params = new URLSearchParams();
  params.set('periodDays', periodDays.toString());

  return fetchClient<AnalyticsEventDto[]>(`/api/admin/analytics?${params.toString()}`);
}
