import { UpdateCurrentUserProfileRequest, UserProfile } from '../types/api';
import { fetchClient } from './fetchClient';

export async function getCurrentUserProfile(): Promise<UserProfile> {
  return fetchClient<UserProfile>('/api/users/me');
}

export async function updateCurrentUserProfile(data: UpdateCurrentUserProfileRequest): Promise<UserProfile> {
  return fetchClient<UserProfile>('/api/users/me', {
    method: 'PUT',
    data,
  });
}
