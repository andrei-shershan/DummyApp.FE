import { fetchClient } from './fetchClient';

export interface SendVerificationCodeRequest {
  email: string;
}

export interface VerifyVerificationCodeRequest {
  email: string;
  code: string;
}

export async function sendVerificationCode(email: string): Promise<void> {
  await fetchClient<void>('/api/verification/send-code', {
    method: 'POST',
    data: { email },
  });
}

export async function verifyVerificationCode(email: string, code: string): Promise<void> {
  await fetchClient<void>('/api/verification/verify-code', {
    method: 'POST',
    data: { email, code },
  });
}
