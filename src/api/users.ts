import { UserProfile } from '../types/api';
import { fetchClient } from './fetchClient';

export async function getCurrentUserProfile(): Promise<UserProfile> {
  return fetchClient<UserProfile>('/api/users/me');
}
