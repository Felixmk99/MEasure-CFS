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
                    Diese App ist <strong>kein Medizinprodukt</strong> im Sinne der EU-Medizinprodukteverordnung (MDR). Sie dient ausschließlich der Visualisierung und Korrelation von bereits existierenden Gesundheitsdaten für Ihr persönliches Wohlbefinden. Die App stellt keine Diagnosen, gibt keine Therapieempfehlungen und ersetzt nicht den Besuch bei einem qualifizierten Arzt. Wenn Sie medizinische Beschwerden haben, suchen Sie bitte umgehend professionelle Hilfe auf.
                </AlertDescription>
            </Alert>

            <div className="space-y-12">
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Scale className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold text-foreground">1. Geltungsbereich</h2>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Track-ME is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.</p>
                    <p className="text-muted-foreground leading-relaxed">
                        Durch die Nutzung der Web-App &quot;Visible Analytics&quot; erklären Sie sich mit den folgenden Nutzungsbedingungen einverstanden. Die App wird von Felix Kania als kostenloses Tool zur Verfügung gestellt.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Activity className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold text-foreground">2. Leistungsumfang</h2>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">The Insights feature provides statistical correlations based on your data. These are mathematical observations &quot;as calculated&quot; and do not imply medical causation. Always consult a healthcare professional for medical advice.</p>
                    <p className="text-muted-foreground leading-relaxed">
                        &quot;Visible Analytics&quot; ermöglicht Nutzern den Upload von Gesundheitsdaten (z.B. aus der Visible App oder Apple Health) zur grafischen Aufarbeitung und statistischen Auswertung persönlicher Trends. Wir übernehmen keine Garantie für die ständige Verfügbarkeit der App oder die Fehlerfreiheit der Berechnungen.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Ban className="w-6 h-6 text-red-500" />
                        <h2 className="text-2xl font-bold text-foreground">3. Haftungsbeschränkung</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        Die Nutzung der App erfolgt auf eigene Gefahr. Wir haften nicht für Schäden, die aus der Nutzung oder im Vertrauen auf die von der App bereitgestellten Grafiken oder Statistiken entstehen. Dies gilt insbesondere für Entscheidungen bezüglich Ihrer Gesundheit, die Sie auf Grundlage der App treffen.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">4. Änderungen der Bedingungen</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Die aktuelle Fassung ist stets über die Webseite abrufbar.
                    </p>
                </section>
            </div>

            <p className="text-xs text-muted-foreground mt-16 italic">
                Zuletzt aktualisiert: 30. Dezember 2024
            </p>
        </div>
    )
}
