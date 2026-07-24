import { fetchClient } from './fetchClient';

export async function sendInvite(email: string): Promise<void> {
  await fetchClient<void>('/api/admin/invite', {
    method: 'POST',
    data: { email },
  });
}
