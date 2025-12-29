import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  const handleLanguageChange = (languageCode: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    if (language) {
      setLanguage(language);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLanguage.code} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[180px] border-border/50">
          <SelectValue>
            <span className="flex items-center gap-2">
              {currentLanguage.nativeName}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-background border-border">
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};