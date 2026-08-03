export interface InviteUserPayload {
  email: string;
  full_name: string;
  role: 'A2C Bank Admin' | 'A2C Bank Agent';
  password: string;
}

export interface UpdateUserProfilePayload {
  email: string;
  full_name?: string;
  role?: 'A2C Bank Admin' | 'A2C Bank Agent';
}

// Consolidated user update: change full_name, role and/or enabled state in a
// single call. `email` identifies the target user; send only the fields you
// want to change (omitting all of them is a valid no-op).
export interface UpdateUserPayload {
  email: string;
  full_name?: string;
  role?: 'A2C Bank Admin' | 'A2C Bank Agent';
  enabled?: boolean;
}
