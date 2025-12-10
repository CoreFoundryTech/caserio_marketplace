import { create } from 'zustand'
import { es } from '../locales/es'
import { en } from '../locales/en'

type Locale = 'es' | 'en'
type Translation = typeof es

interface LocaleStore {
    currentLocale: Locale
    t: Translation
    setLocale: (locale: Locale) => void
}

export const useLocales = create<LocaleStore>((set) => ({
    currentLocale: 'es',
    t: es,
    setLocale: (locale) => set({
        currentLocale: locale,
        t: locale === 'es' ? es : en
    })
}))
