'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Lock, Eye, Database, Trash2 } from 'lucide-react'

export default function PrivacyPage() {
    const { t } = useLanguage()

    return (
        <div className="container max-w-4xl py-12 px-6">
            <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">
                {t('legal.privacy')}
            </h1>

            <section className="mb-12 space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>
                <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-3xl border border-green-100 dark:border-green-900/20 flex items-start gap-4">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-green-900 dark:text-green-200">Wichtiger Hinweis zu Gesundheitsdaten</h3>
                        <p className="text-sm text-green-800 dark:text-green-300">
                            Wir verarbeiten sensible Gesundheitsdaten (z. B. Symptom-Scores, HRV-Werte) gemäß <strong>Art. 9 Abs. 2 lit. a DSGVO</strong> ausschließlich auf Grundlage Ihrer ausdrücklichen Einwilligung.
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
                            <h2 className="text-xl font-bold text-foreground">1. Datenerfassung auf dieser Webseite</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                            <p>
                                <strong>Betreiber:</strong> Die Datenverarbeitung auf dieser Webseite erfolgt durch den Webseitenbetreiber (siehe Impressum).
                            </p>
                            <p>
                                <strong>Wie erfassen wir Ihre Daten?</strong> Ihre Daten werden dadurch erhoben, dass Sie uns diese mitteilen. Hierbei handelt es sich um Daten, die Sie bei der Anmeldung eingeben oder durch den Upload von CSV-Dateien (z.B. Visible Export) bereitstellen.
                            </p>
                            <p>
                                <strong>Wofür nutzen wir Ihre Daten?</strong> Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Webseite zu gewährleisten. Andere Daten werden zur Analyse Ihres Gesundheitsverlaufs (Visualisierung von Korrelationen) genutzt.
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
                            <h2 className="text-xl font-bold text-foreground">2. Hosting und Dateninfrastruktur</h2>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Wir hosten die Daten bei unserem Partner <strong>Supabase</strong>. Die Daten werden in verschlüsselter Form gespeichert. Wir haben Maßnahmen getroffen, um Ihre Daten vor unbefugtem Zugriff zu schützen. Eine Weitergabe Ihrer Gesundheitsdaten an Dritte zu Werbezwecken findet unter keinen Umständen statt.
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-muted-foreground/20 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                                <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">3. Ihre Rechte</h2>
                        </div>
                        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                            <p>Sie haben jederzeit das Recht:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                <li>Auskunft über Ihre gespeicherten Daten zu erhalten (Art. 15 DSGVO)</li>
                                <li>Die Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</li>
                                <li>Die Löschung Ihrer Daten zu verlangen (&quot;Recht auf Vergessenwerden&quot;, Art. 17 DSGVO)</li>
                                <li>Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO)</li>
                                <li>Ihre Einwilligung mit Wirkung für die Zukunft zu widerrufen</li>
                            </ul>
                            <p className="flex items-center gap-2 text-red-600 dark:text-red-400 mt-4 font-medium">
                                <Trash2 className="w-4 h-4" />
                                Sie können Ihren gesamten Account und alle Daten jederzeit in den Einstellungen löschen.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <p className="text-xs text-muted-foreground mt-12">
                Stand: Dezember 2025
            </p>
        </div>
    )
}
