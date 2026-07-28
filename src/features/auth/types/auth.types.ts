import type { RawUserResponse } from '@/features/auth/api/authApi';

export type User =
  | { kind: 'bank_admin'; email: string; name: string; bankId: string; bankCode: string; bankName: string; bankStatus: 'Onboarding' | 'Active' | 'Suspended' }
  | { kind: 'bank_agent'; email: string; name: string; bankId: string; bankCode: string; bankName: string; bankStatus: 'Onboarding' | 'Active' | 'Suspended' }
  | { kind: 'dev_agent'; email: string; name: string }
  | { kind: 'marketplace'; email: string; name: string }
  | { kind: 'farmer'; email: string; name: string };

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

// user_type is authoritative — derived once by the backend at login/get_me,
// not re-derived from roles on the frontend.
export function classifyUser(raw: RawUserResponse): User {
  const {
    email,
    full_name: name,
    user_type,
    bank,
    bank_id: bankId,
    bank_code: bankCode,
    bank_name: bankName,
    bank_status: bankStatus,
  } = raw;
  const resolvedBankName = bankName ?? bank;

  switch (user_type) {
    case 'bank_admin':
      if (!bankId) throw new Error('Bank Admin user is missing bank_id field');
      if (!bankCode) throw new Error('Bank Admin user is missing bank_code field');
      if (!resolvedBankName) throw new Error('Bank Admin user is missing bank_name field');
      if (!bankStatus) throw new Error('Bank Admin user is missing bank_status field');
      return { kind: 'bank_admin', email, name, bankId, bankCode, bankName: resolvedBankName, bankStatus };
    case 'bank_agent':
      if (!bankId) throw new Error('Bank Agent user is missing bank_id field');
      if (!bankCode) throw new Error('Bank Agent user is missing bank_code field');
      if (!resolvedBankName) throw new Error('Bank Agent user is missing bank_name field');
      if (!bankStatus) throw new Error('Bank Agent user is missing bank_status field');
      return { kind: 'bank_agent', email, name, bankId, bankCode, bankName: resolvedBankName, bankStatus };
    case 'dev_agent':
      return { kind: 'dev_agent', email, name };
    case 'marketplace':
      return { kind: 'marketplace', email, name };
    case 'farmer':
      return { kind: 'farmer', email, name };
    default:
      throw new Error(`Unrecognized user_type from API: ${user_type}`);
  }
}
