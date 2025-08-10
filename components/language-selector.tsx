'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SUPPORTED_LANGUAGES, type Language } from '@/lib/translations'

interface LanguageSelectorProps {
  currentLang: Language
  onLanguageChange: (language: string) => void
  label?: string
}

export function LanguageSelector({ currentLang, onLanguageChange, label }: LanguageSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      {label && <Label className="text-sm">{label}:</Label>}
      <Select value={currentLang} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <SelectItem key={code} value={code}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
