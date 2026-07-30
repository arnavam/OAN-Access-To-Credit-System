'use client';

import { onboardingService, type BankProfile } from '@/features/seller/api/onboarding.service';
import { toast } from '@/lib/toast';
import { ArrowRight, Camera, Eye, FileText, Folder, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const inputClass = (disabled: boolean) =>
  `w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#16A34A] ${
    disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
  }`;

export default function OrganizationManagementTab({ readOnly = false }: { readOnly?: boolean }) {
  const [profile, setProfile] = useState<BankProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycUploading, setKycUploading] = useState(false);
  const [kycProgress, setKycProgress] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const kycInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onboardingService.getBankProfile()
      .then((res) => setProfile(res.data))
      .catch(() => toast.error('Failed to load organization profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly && profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!profile || readOnly) return;
    setSaving(true);
    try {
      await onboardingService.updateBankProfile({
        bank_name: profile.bank_name,
        ...(profile.brand_name !== undefined && { brand_name: profile.brand_name }),
        ...(profile.website !== undefined && { website: profile.website }),
        registered_street: profile.registered_street,
        ...(profile.registered_kebele_village !== undefined && { registered_kebele_village: profile.registered_kebele_village }),
        ...(profile.registered_woreda_district !== undefined && { registered_woreda_district: profile.registered_woreda_district }),
        registered_city: profile.registered_city,
        registered_country: profile.registered_country,
        registered_postal_code: profile.registered_postal_code,
        registered_email: profile.registered_email,
        registered_phone: profile.registered_phone,
        ...(logoPreview || profile.logo ? { logo: logoPreview || profile.logo } : {}),
      });
      toast.success('Organization profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleKycUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setKycFile(file);
    setKycUploading(true);
    setKycProgress(0);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Content = (reader.result as string).split(',')[1] ?? '';
        try {
          await onboardingService.uploadKycDocument({ filename: file.name, filedata: base64Content });
          setKycProgress(100);
          if (profile) setProfile({ ...profile, kyc_document_uploaded: true });
          toast.success('KYC document uploaded successfully');
        } catch (err: any) {
          toast.error(err.message || 'Failed to upload KYC document');
          setKycFile(null);
        } finally {
          setKycUploading(false);
        }
      };
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setKycProgress(Math.round((event.loaded / event.total) * 80));
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to read file');
      setKycUploading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="py-12 text-center text-gray-500 font-medium bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">Loading organization details...</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* SECTION 1: Organization Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900">Organization Details</h2>
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#16A34A] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Change'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {[
            { label: 'Legal Name', name: 'bank_name', placeholder: 'Ethiopia OpenAgriNet PLC', required: true },
            { label: 'Registration Number', name: 'bank_code', placeholder: 'REG-ET-20231042', required: true },
            { label: 'Street address', name: 'registered_street', placeholder: 'Enter Street address', required: true },
            { label: 'Kebele / Village', name: 'registered_kebele_village', placeholder: 'Enter Kebele / Village' },
            { label: 'Woreda / District', name: 'registered_woreda_district', placeholder: 'Enter Woreda / District' },
            { label: 'City', name: 'registered_city', placeholder: 'Enter City', required: true },
            { label: 'Country', name: 'registered_country', placeholder: 'Enter Country', required: true },
            { label: 'Postal code', name: 'registered_postal_code', placeholder: 'Enter Postal code', required: true },
            { label: 'Organization Type', name: 'entity_type', placeholder: 'e.g. Bank, Microfinance Institution', required: true },
            { label: 'Website URL', name: 'website', placeholder: 'https://www.example.com', type: 'url' },
          ].map(({ label, name, placeholder, required, type }) => (
            <div key={name}>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={type ?? 'text'}
                name={name}
                value={(profile as any)[name] || ''}
                onChange={handleChange}
                disabled={readOnly}
                placeholder={placeholder}
                className={inputClass(readOnly)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Branding */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Branding</h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                {logoPreview || profile.logo ? (
                  <img src={logoPreview || profile.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#16A34A] font-bold text-lg">oan</span>
                )}
              </div>
              {!readOnly && (
                <>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#16A34A] rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-[#15803d] transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{profile.brand_name || profile.bank_name || 'Ethiopia OpenAgriNet'}</p>
              {!readOnly && (
                <button onClick={() => logoInputRef.current?.click()} className="text-[#16A34A] text-xs font-semibold hover:underline mt-0.5">
                  Upload new photo
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand_name"
                value={profile.brand_name || profile.bank_name || ''}
                onChange={handleChange}
                disabled={readOnly}
                placeholder="Ethiopia OpenAgriNet"
                className={`w-64 ${inputClass(readOnly)}`}
              />
            </div>
            {!readOnly && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 bg-[#16A34A] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shrink-0"
              >
                Save Change
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: KYC / Compliance — admin only */}
      {!readOnly && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900">KYC / Compliance</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <p className="text-xs font-bold text-gray-900">KYC &amp; Compliance Documents</p>
                <p className="text-xs text-gray-400">KYC &amp; Compliance Documents</p>
              </div>
              <input type="file" ref={kycInputRef} accept=".pdf" className="hidden" onChange={handleKycUpload} />
              <div
                onClick={() => kycInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-32"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200/60 flex items-center justify-center mb-2">
                  <Folder className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-xs font-bold text-gray-700">Drag and drop files here</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Or click to browse PDF files</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-900">KYC &amp; Compliance Documents</p>
                  <p className="text-xs text-gray-400">
                    {profile?.kyc_document_uploaded ? 'Document on file' : 'No document uploaded yet'}
                  </p>
                </div>
                {profile?.kyc_document && (
                  <a
                    href={profile.kyc_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 border border-[#16A34A] text-[#16A34A] hover:bg-green-50 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </a>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between h-32">
                {kycFile || profile?.kyc_document_uploaded ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        {kycUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {kycFile?.name ?? 'KYC_Compliance.pdf'}
                        </p>
                        {kycFile && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {(kycFile.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-500">{kycProgress || 100}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#16A34A] h-full rounded-full transition-all duration-300"
                        style={{ width: `${kycProgress || 100}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                    No document uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Bottom save banner — admin only */}
      {!readOnly && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex justify-end shadow-sm">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#16A34A] hover:bg-[#15803d] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <span>Update Organization Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
