'use client';

import { useI18n } from '@/contexts/I18nContext';
import { Language } from '@/lib/i18n';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

export default function LanguageSelector() {
  try {
    const { language, changeLanguage } = useI18n();

    return (
      <div className="relative w-full">
        <select
          value={language || 'en'}
          onChange={(e) => {
            try {
              changeLanguage(e.target.value as Language);
            } catch (err) {
              console.error('Error changing language:', err);
            }
          }}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer w-full"
          aria-label="Select language"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LanguageSelector error:', error);
    // Fallback: render a simple select if context fails
    return (
      <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="en">🇬🇧 English</option>
        <option value="it">🇮🇹 Italiano</option>
        <option value="ar">🇸🇦 العربية</option>
        <option value="uk">🇺🇦 Українська</option>
      </select>
    );
  }
}

