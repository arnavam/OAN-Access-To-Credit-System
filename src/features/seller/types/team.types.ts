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
