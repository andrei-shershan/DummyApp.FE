import { AdminUserDto, RoleDto, PrintSizeDto } from '../types/api';
import { fetchClient } from './fetchClient';

export async function getAdminUsers(): Promise<AdminUserDto[]> {
  return fetchClient<AdminUserDto[]>('/api/admin/users');
}

export async function getRoles(): Promise<RoleDto[]> {
  return fetchClient<RoleDto[]>('/api/admin/roles');
}

export async function getPrintSizes(): Promise<PrintSizeDto[]> {
  return fetchClient<PrintSizeDto[]>('/api/admin/print-sizes');
}

export async function toggleUserActive(userId: string, isActive: boolean): Promise<AdminUserDto> {
  return fetchClient<AdminUserDto>(`/api/admin/users/${encodeURIComponent(userId)}/active`, {
    method: 'PUT',
    data: { isActive },
  });
}

// TEst
