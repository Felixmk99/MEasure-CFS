import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import React from 'react'

export function Footer() {
    const { t } = useLanguage()

    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p className="font-medium text-foreground">Visible Analytics</p>
                        <p>{t('legal.copyright')}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        <Link href="/impressum" className="hover:text-foreground transition-colors">
                            {t('legal.impressum')}
                        </Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">
                            {t('legal.privacy')}
                        </Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">
                            {t('legal.terms')}
                        </Link>
                        <a href="mailto:felixmkania@gmail.com" className="hover:text-foreground transition-colors">
                            {t('footer.contact')}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
