import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage, getCurrentLanguage, type SupportedLanguage } from '../i18n';

export function LanguageSelector() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(getCurrentLanguage());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    changeLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === currentLang);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-xs sm:text-sm transition-colors"
        title={t('settings.uiLanguage')}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
        <span className="hidden sm:inline">{currentLanguage?.flag}</span>
        <span className="hidden md:inline text-slate-300">{currentLanguage?.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[140px] overflow-hidden">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-3 py-2 hover:bg-slate-600 transition-colors flex items-center gap-2 ${
                currentLang === lang.code ? 'bg-slate-600/50' : ''
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="text-sm text-slate-200">{lang.name}</span>
              {currentLang === lang.code && (
                <span className="ml-auto text-sky-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
