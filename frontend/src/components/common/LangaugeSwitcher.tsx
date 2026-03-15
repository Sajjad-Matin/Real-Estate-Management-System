import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fa', name: 'دری', flag: '🇦🇫' },
  { code: 'ps', name: 'پښتو', flag: '🇦🇫' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set document direction based on language
    const direction = i18n.language === 'fa' || i18n.language === 'ps' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative group">
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
        title="Change Language"
      >
        <Globe className="w-5 h-5 text-secondary" />
        <span className="text-sm text-secondary hidden md:inline">
          {languages.find(l => l.code === i18n.language)?.flag}
        </span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-48 bg-base border border-primary rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
              ${i18n.language === lang.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
              ${languages.indexOf(lang) === 0 ? 'rounded-t-lg' : ''}
              ${languages.indexOf(lang) === languages.length - 1 ? 'rounded-b-lg' : ''}
            `}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-sm font-medium text-primary">{lang.name}</span>
            {i18n.language === lang.code && (
              <span className="ml-auto text-primary-600">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;