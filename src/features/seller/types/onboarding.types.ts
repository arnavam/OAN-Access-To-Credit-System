export interface RegisterSellerPayload {
  email: string;
  full_name: string;
  password: string;
  phone_number: string;
}

export interface SaveOrgContactsPayload {
  gro_name: string;
  gro_mobile: string;
  ops_name: string;
  ops_mobile: string;
}

export interface UploadKycDocumentPayload {
  filename: string;
  filedata: string; // Base64 PDF
}

export interface UpdateBankStatusPayload {
  bank_code: string;
  new_status: 'Onboarding' | 'Active' | 'Suspended';
}
