'use client';
import React, { useState, useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import { ViewDocumentModal } from './ViewDocumentModal';
import { DeleteDocumentModal } from './DeleteDocumentModal';

export function OrganisationDocumentsCard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setIsDeleteModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="bg-white flex flex-col w-full h-full border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
        <div className="p-6 border-b border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">Organisation Documents</h2>
            <p className="text-[14px] text-gray-500">Upload the required KYC document for your organisation.</p>
          </div>
        </div>
        <div className="p-6 flex-1">
          <label className="block text-[14px] font-bold text-gray-700 mb-3">
            Tax Registration Certificate <span className="text-green-600">*</span>
          </label>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />

          {!uploadedFile ? (
            <div
              onClick={handleBoxClick}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-green-50/50 hover:border-green-300 transition-colors duration-300 cursor-pointer group h-[200px]"
            >
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-active:scale-90 group-hover:border-green-200 group-hover:shadow-md group-active:bg-green-100 transition-all duration-300">
                <Upload size={20} className="text-gray-500 group-hover:text-green-500 group-active:-translate-y-1 group-active:text-green-600 transition-all duration-300" />
              </div>
              <span className="text-[14px] font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors duration-300">Click to upload</span>
              <span className="text-[12px] text-gray-500">PDF, JPG or PNG - max 10 MB</span>
            </div>
          ) : (
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#DCFCE7] rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-[#16A34A]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-gray-900 leading-tight">{uploadedFile.name}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                    <span className="text-[14px] text-[#16A34A] font-medium">Uploaded · pending registry verification</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsViewModalOpen(true)}
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center hover:bg-blue-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ViewDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        file={uploadedFile}
      />

      <DeleteDocumentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRemoveFile}
        fileName={uploadedFile?.name || null}
      />
    </>
  );
}
