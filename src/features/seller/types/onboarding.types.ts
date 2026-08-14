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

export interface RegisterBankPayload {
  bank_name: string;
  brand_name: string;
  registered_street: string;
  registered_zone: string;
  registered_region: string;
  registered_postal_code: string;
  registered_email: string;
  registered_phone: string;
  website: string;
}

export interface UpdateBankStatusPayload {
  new_status: 'In Review' | 'Active' | 'Suspended';
}

