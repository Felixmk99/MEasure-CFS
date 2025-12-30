'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MapPin, User } from 'lucide-react'

export default function ImpressumPage() {
    const { t } = useLanguage()

    return (
        <div className="container max-w-4xl py-12 px-6">
            <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">
                {t('legal.impressum')}
            </h1>

            <Card className="rounded-3xl border-muted-foreground/20 shadow-sm overflow-hidden mb-8">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Angaben gemäß § 5 DDG
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="font-semibold text-foreground">Felix Kania</p>
                            <p className="text-sm text-muted-foreground">Betreiber der Webseite</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="text-foreground">[Strasse, Hausnummer]</p>
                            <p className="text-foreground">[PLZ, Stadt]</p>
                            <p className="text-foreground">Deutschland</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="text-foreground">Email: [Deine Email-Adresse]</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Haftungsausschluss</h2>
                    <p>
                        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Medizinischer Haftungsausschluss</h2>
                    <p className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-blue-900 dark:text-blue-200">
                        {t('legal.medical_disclaimer_text')}
                    </p>
                </section>

                <p className="text-xs pt-8">
                    Quelle: Erstellt mit dem Impressum-Generator von e-recht24.de
                </p>
            </div>
        </div>
    )
}
