'use client';

import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const languages = [
  { code: 'en', label: 'English', country: 'United States', flag: '🇺🇸' },
  { code: 'am', label: 'Amharic', country: 'Ethiopia', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromo', country: 'Ethiopia', flag: '🇪🇹' },
  { code: 'ar', label: 'Arabic', country: 'Saudi Arabia', flag: '🇸🇦' },
];

export function LanguageSelector() {
  const [activeLanguage, setActiveLanguage] = useState(languages[0]!);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!languageMenuRef.current) return;
      if (!languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  return (
    <div className="relative" ref={languageMenuRef}>
      <button
        onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
        className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 group border rounded-full px-3.5 py-1.5 hover:shadow-sm cursor-pointer ${isLanguageMenuOpen ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-gray-50'}`}
      >
        <span className={`text-base transition-transform duration-300 ${isLanguageMenuOpen ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-12'}`}>
          {activeLanguage.flag}
        </span>
        <span className={`transition-colors duration-300 ${isLanguageMenuOpen ? 'text-blue-700' : 'group-hover:text-blue-600'}`}>{activeLanguage.label}</span>
      </button>
      {isLanguageMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              type="button"
              key={lang.code}
              onClick={() => { setActiveLanguage(lang); setIsLanguageMenuOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2 group/item">
                <span className="transition-transform duration-300 group-hover/item:scale-125 group-hover/item:rotate-12">{lang.flag}</span>
                <span className={activeLanguage.code === lang.code ? 'font-bold' : ''}>{lang.label}</span>
              </span>
              {activeLanguage.code === lang.code && <Check className="w-4 h-4 text-[#16A34A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
