"use client";
import { Portal } from '@/components/Portal';
import { toast } from '@/lib/toast';
import { Eye, FileText, UploadCloud, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function SignedConsentForm() {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file) return;

      // MIME type check (LC-032)
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        toast.error('Invalid file type. Please upload a PDF document (.pdf).');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Size limit check (LC-033)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller PDF file.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setUploadedFile(file);
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 h-full flex flex-col justify-center">
        {!uploadedFile ? (
          <>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Signed Consent Form</h4>
            <p className="text-xs text-gray-500 mb-4">Physical copy signed by farmer</p>

            <div
              onClick={handleUploadClick}
              className="border-2 border-dashed border-gray-200 rounded-xl bg-white p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#16A34A] hover:bg-[#F0FDF4] transition-colors"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <UploadCloud className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">Drag and drop files here</p>
              <p className="text-xs text-gray-500 mt-1">Or</p>
              <p className="text-sm font-medium text-gray-900 mt-1">Click Browse files to select a file</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Signed Consent Form</h4>
                <p className="text-xs text-gray-500">Physical copy signed by farmer</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsViewModalOpen(true)}
                  className="flex items-center gap-1.5 border border-[#16A34A] text-[#16A34A] px-3 py-1.5 rounded-lg text-sm font-bold bg-[#F0FDF4] hover:bg-[#DCFCE7] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl bg-white p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate pr-2">{uploadedFile.name}</h4>
                    <button
                      onClick={handleUploadClick}
                      className="flex items-center gap-1.5 border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors shrink-0"
                      title="Reupload"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Reupload
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB / {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-[#16A34A] h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </>
        )}
      </div>

      {isViewModalOpen && fileUrl && uploadedFile && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-lg text-gray-900">Document Viewer</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors group">
                  <X className="w-5 h-5 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
              <div className="flex-1 p-4 sm:p-8 bg-gray-100/50 flex items-center justify-center overflow-hidden">
                {uploadedFile.type.includes('image') ? (
                  <img src={fileUrl} className="w-full h-full object-contain rounded shadow-sm border border-gray-200 bg-white" alt="Document" />
                ) : (
                  <iframe src={fileUrl} className="w-full h-full rounded shadow-sm border border-gray-200 bg-white" title="Document Viewer" />
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
      />
    </>
  );
}
