import { CurrentUser } from '../types/api';
import { fetchClient } from './fetchClient';

export async function getCurrentUser(): Promise<CurrentUser> {
  return fetchClient<CurrentUser>('/me');
}
