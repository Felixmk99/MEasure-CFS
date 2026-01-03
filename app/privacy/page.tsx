'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Lock, Eye, Database, Trash2 } from 'lucide-react'

export default function PrivacyPage() {
    const { t, dictionary } = useLanguage()

    return (
        <div className="container max-w-4xl py-12 px-6">
            <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">
                {t('legal.privacy')}
            </h1>

            <section className="mb-12 space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('legal.privacy_page.intro')}
                </p>
                <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-3xl border border-green-100 dark:border-green-900/20 flex items-start gap-4">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-green-900 dark:text-green-200">{t('legal.privacy_page.health_data_title')}</h3>
                        <p className="text-sm text-green-800 dark:text-green-300">
                            {t('legal.privacy_page.health_data_text')}
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid gap-8">
                <Card className="rounded-3xl border-muted-foreground/20 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{t('legal.privacy_page.s1_title')}</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                            <p>
                                {t('legal.privacy_page.s1_operator')}
                            </p>
                            <p>
                                {t('legal.privacy_page.s1_how')}
                            </p>
                            <p>
                                {t('legal.privacy_page.s1_purpose')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-muted-foreground/20 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{t('legal.privacy_page.s2_title')}</h2>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {t('legal.privacy_page.s2_text')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-muted-foreground/20 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                                <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{t('legal.privacy_page.s3_title')}</h2>
                        </div>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>{t('legal.privacy_page.s3_intro')}</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {dictionary.legal.privacy_page.s3_rights.map((right: string, index: number) => (
                                    <li key={index}>{right}</li>
                                ))}
                            </ul>
                            <p className="flex items-center gap-2 text-red-600 dark:text-red-400 mt-4 font-medium">
                                <Trash2 className="w-4 h-4" />
                                {t('legal.privacy_page.s3_delete_hint')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <p className="text-xs text-muted-foreground mt-12">
                {t('legal.privacy_page.last_updated')}
            </p>
        </div>
    )
}
