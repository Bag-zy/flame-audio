'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/ui/icons';

// Common languages with their codes and native names
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'auto', name: 'Auto-detect', nativeName: 'Auto-detect' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageSelect: (language: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageSelect,
  disabled = false 
}: LanguageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter languages based on search term
  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the display name for the selected language
  const getSelectedLanguageName = () => {
    if (selectedLanguage === 'auto') return 'Auto-detect';
    const lang = LANGUAGES.find(l => l.code === selectedLanguage);
    return lang ? `${lang.name} (${lang.nativeName})` : selectedLanguage;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="language">Language</Label>
      
      <Select 
        value={selectedLanguage} 
        onValueChange={onLanguageSelect}
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a language">
            {getSelectedLanguageName()}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {/* Search input */}
          <div className="px-3 py-2 border-b">
            <div className="relative">
              <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search languages..."
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          {/* Language list */}
          <div className="max-h-[250px] overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  <div className="flex items-center">
                    <span className="font-medium">{language.name}</span>
                    <span className="text-gray-500 ml-2">{language.nativeName}</span>
                    {language.code === 'en' && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No languages found
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
      
      {disabled && (
        <p className="text-xs text-gray-500">
          Language selection is disabled for translation tasks (always translates to English)
        </p>
      )}
    </div>
  );
}
