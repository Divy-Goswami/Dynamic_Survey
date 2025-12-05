import { useState, useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material'
import { getLanguage, setLanguage, getTranslation } from '@/i18n/translations'

interface LanguageSelectorProps {
  onChange?: (language: string) => void
  compact?: boolean
}

export default function LanguageSelector({ onChange, compact }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState(getLanguage())

  useEffect(() => {
    const lang = getLanguage()
    setCurrentLang(lang)
  }, [])

  const handleChange = (lang: string) => {
    setLanguage(lang)
    setCurrentLang(lang)
    onChange?.(lang)
    // Reload page to apply translations
    window.location.reload()
  }

  if (compact) {
    return (
      <Select
        value={currentLang}
        onChange={(e) => handleChange(e.target.value)}
        size="small"
        sx={{ minWidth: 100 }}
      }}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="de">Deutsch</MenuItem>
        <MenuItem value="zh">中文</MenuItem>
        <MenuItem value="ja">日本語</MenuItem>
      </Select>
    )
  }

  return (
    <FormControl fullWidth>
      <InputLabel>Language</InputLabel>
      <Select
        value={currentLang}
        onChange={(e) => handleChange(e.target.value)}
        label="Language"
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="de">Deutsch</MenuItem>
        <MenuItem value="zh">中文</MenuItem>
        <MenuItem value="ja">日本語</MenuItem>
      </Select>
    </FormControl>
  )
}

