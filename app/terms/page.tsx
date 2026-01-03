'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { AlertCircle, Scale, Activity, Ban } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function TermsPage() {
    const { t } = useLanguage()

    return (
        <div className="container max-w-4xl py-12 px-6">
            <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">
                {t('legal.terms')}
            </h1>

            <Alert variant="destructive" className="rounded-3xl border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 mb-10 pb-6">
                <AlertCircle className="h-5 w-5 !text-red-600 dark:!text-red-400" />
                <AlertTitle className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                    {t('legal.medical_disclaimer')}
                </AlertTitle>
                <AlertDescription className="text-base text-red-800 dark:text-red-300 leading-relaxed">
                    {t('legal.medical_disclaimer_text')}
                    <br /><br />
                    {t('legal.terms_page.not_medical_product_long')}
                </AlertDescription>
            </Alert>

            <div className="space-y-12">
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Scale className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold text-foreground">{t('legal.terms_page.s1_title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('legal.terms_page.s1_desc')}
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Activity className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold text-foreground">{t('legal.terms_page.s2_title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('legal.terms_page.s2_desc')}
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Ban className="w-6 h-6 text-red-500" />
                        <h2 className="text-2xl font-bold text-foreground">{t('legal.terms_page.s3_title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('legal.terms_page.s3_desc')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">{t('legal.terms_page.s4_title')}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('legal.terms_page.s4_desc')}
                    </p>
                </section>
            </div>

            <p className="text-xs text-muted-foreground mt-16 italic">
                {t('legal.terms_page.last_updated')}
            </p>
        </div>
    )
}
