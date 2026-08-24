import { UpdateCurrentUserProfileRequest, UploadCurrentUserAvatarRequest, UserProfile } from '../types/api';
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

export async function uploadCurrentUserAvatar(data: UploadCurrentUserAvatarRequest): Promise<UserProfile> {
  return fetchClient<UserProfile>('/api/users/me/avatar', {
    method: 'PUT',
    data,
  });
}
