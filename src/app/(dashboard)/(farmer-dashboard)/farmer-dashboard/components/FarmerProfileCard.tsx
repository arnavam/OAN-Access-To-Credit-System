import React from 'react';
import { CheckCircle2, MapPin, Leaf, Tractor, Activity } from 'lucide-react';

export default function FarmerProfileCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F1F3F4] p-6 flex flex-col md:flex-row gap-5 items-start h-full hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden z-0">
      
      {/* Decorative colored design filling the blank space */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-50/80 to-transparent -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-green-100 rounded-full blur-3xl opacity-70 -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-8 -left-12 w-32 h-32 bg-emerald-100 rounded-full blur-2xl opacity-60 -z-10 pointer-events-none"></div>
      
      {/* Avatar */}
      <div className="w-[72px] h-[72px] rounded-full bg-[#F3F4F6] text-[#374151] font-bold text-xl flex items-center justify-center shrink-0">
        AT
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* Name and Verified Badge */}
        <div className="flex items-center gap-3 mb-1.5">
          <h2 className="text-[22px] font-bold text-[#111827]">Almaz Tadesse</h2>
          <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-0.5 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>

        {/* ID and Location */}
        <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#6B7280] font-medium mb-4">
          <span>Farmer ID: <span className="font-bold text-[#4B5563]">ETH-2847</span></span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#16A34A]" />
            Oromia, Ethiopia
          </span>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-4 mt-4">
          {/* Land Size */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#86EFAC] bg-[#F0FDF4] text-[#15803D] text-[15px] font-bold transition-colors hover:bg-[#DCFCE7] shadow-sm">
            <MapPin className="w-5 h-5" />
            <span>Land: 3.5 ha</span>
          </div>
          
          {/* Crops */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#86EFAC] bg-[#F0FDF4] text-[#15803D] text-[15px] font-bold transition-colors hover:bg-[#DCFCE7] shadow-sm">
            <Leaf className="w-5 h-5" />
            <span>Crops: Teff, Maize</span>
          </div>
          
          {/* Livestock */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#86EFAC] bg-[#F0FDF4] text-[#15803D] text-[15px] font-bold transition-colors hover:bg-[#DCFCE7] shadow-sm">
            <Activity className="w-5 h-5" />
            <span>Livestock: 12 heads</span>
          </div>
        </div>
      </div>

    </div>
  );
}
