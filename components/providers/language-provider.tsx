'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Locale, Dictionary } from '@/lib/i18n/types'
import { en } from '@/lib/i18n/dictionaries/en'
import { de } from '@/lib/i18n/dictionaries/de'

type LanguageProviderProps = {
    children: React.ReactNode
    initialLocale?: Locale
}

type LanguageContextType = {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string, values?: Record<string, string | number>) => string
    dictionary: Dictionary
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children, initialLocale = 'en' }: LanguageProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale)

    // Load persisted preference or detect domain
    useEffect(() => {
        const hostname = window.location.hostname.toLowerCase()
        const saved = localStorage.getItem('track-me-locale') as Locale

        // Smart domain-based defaulting (Client-side fallback)
        const domainDefault: Locale = hostname.endsWith('.de') ? 'de' : 'en'

        if (saved && (saved === 'en' || saved === 'de')) {
            // Only update if saved preference differs from SSR language
            if (saved !== locale) {
                // Wrap in setTimeout to avoid synchronous cascading render lint error
                setTimeout(() => setLocaleState(saved), 0)
            }
        } else if (domainDefault !== locale) {
            // If no saved pref, and client domain detection suggests different language than server, update
            setTimeout(() => setLocaleState(domainDefault), 0)
        }
    }, [locale])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem('track-me-locale', newLocale)
    }

    const dictionary = locale === 'de' ? de : en

    const t = (path: string, values?: Record<string, string | number>): string => {
        const keys = path.split('.')
        let current: unknown = dictionary
        for (const key of keys) {
            if (typeof current !== 'object' || current === null || (current as Record<string, unknown>)[key] === undefined) {
                console.warn(`Translation missing for key: ${path}`)
                return path
            }
            current = (current as Record<string, unknown>)[key]
        }

        let result = current as string
        if (values) {
            Object.entries(values).forEach(([key, value]) => {
                result = result.replace(`{${key}}`, String(value))
            })
        }
        return result
    }

    // Prevent hydration mismatch by rendering children only after mount, 
    // or by accepting that server rendered initial EN and client might switch to DE.
    // Ideally we render children always, but let the text update. 
    // Since we are doing Client-Side only switch for now, just returning children is fine.
    // However, to avoid flash of wrong content if default is EN and user prefers DE,
    // we might see a flicker. That's acceptable for this scope.

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, dictionary }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
