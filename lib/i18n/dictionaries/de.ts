import { Dictionary } from "../types"

export const de: Dictionary = {
    common: {
        loading: "Lädt...",
        error: "Ein Fehler ist aufgetreten",
        save: "Speichern",
        cancel: "Abbrechen",
        delete: "Löschen",
        confirm: "Bestätigen",
        success: "Erfolg",
        custom: "Benutzerdefiniert"
    },
    navbar: {
        dashboard: "Dashboard",
        insights: "Einblicke",
        experiments: "Experimente",
        data: "Daten",
        upload_data: "Daten hochladen",
        settings: "Einstellungen",
        logout: "Abmelden",
        login: "Anmelden",
        signup: "Registrieren",
        profile: "Profil",
        welcome: "Willkommen",
        missing_steps_hint: "Schritte fehlen?",
        missing_steps_tooltip: "Lade Apple Health, Google Fit oder Samsung Health Schrittdaten hoch, um die Genauigkeit deines Gesundheits-Scores zu verbessern.",
        pem_status: {
            label: "PEM-Status",
            needs_data: "Daten fehlen",
            stable: "Stabil",
            danger: "PEM-Gefahr",
            reason_no_history: "Mind. 10 Tage + 1 Crash nötig",
            reason_no_recent_data: "Keine Daten in den letzten 7 Tagen",
            reason_no_crashes: "Keine historischen Crashes analysiert",
            prediction: "Vorausgesagter Crash: {day}",
            matches: "Entspricht historischen Triggern:",
            matches_personal: "Persönliche Risikomuster:",
            matches_general: "Allgemeine Risikoindikatoren:",
            explanation: "Erklärung",
            matches_personal_desc: "Entspricht Mustern aus deiner Vorgeschichte.",
            matches_general_desc: "Dein Durchschnittliche(s) {label} liegt deutlich über deinem Basiswert.",
            cumulative_load: "Hohe kumulative Belastung erkannt",
            exertion: "Belastung",
            activity: "Aktivität",
            danger_fallback: "Erhöhte Aktivitäts-Werte im Vergleich zu deiner Basislinie erkannt. Bitte prüfe dein Protokoll für Details.",
            stable_message: "Deine aktuelle Belastung liegt innerhalb deiner historisch sicheren Zone.",
            error_fetch: "Fehler beim Laden des PEM-Status",
            biometrics_title: "Biometrische Basiswerte",
            biometrics_stable: "Deine biometrischen Basiswerte sind im grünen Bereich. Keine Risikomuster erkannt.",
            status_optimal: "Optimal",
            status_normal: "Stabil",
            status_strained: "Belastet",
            status_unknown: "Keine Baseline"
        }
    },
    footer: {
        built_by: "Entwickelt von Felix Kania",
        contact: "Kontakt & Ideen: felixmkania@gmail.com"
    },
    dashboard: {
        title: "Gesundheitstrends",
        subtitle_prefix: "Verlauf deiner",
        subtitle_suffix: "im Zeitverlauf.",
        trend_mode: "Trend",
        metrics_dropdown: "Metriken (Max 2)",
        metrics_selected: "Ausgewählt",
        charts: {
            synced: "Synchronisiert mit Visible App",
            encrypted: "Daten auf Gerät verschlüsselt • Gradeben aktualisiert"
        },
        status: {
            stable: "Stabil",
            improving: "Verbesserung",
            declining: "Verschlechterung",
            worsening: "Verschlechterung",
            insufficient_data: "Keine Daten für diesen Zeitraum gefunden"
        },
        time_ranges: {
            d7: "7T",
            d30: "30T",
            m3: "3M",
            m6: "Letzte 6 Monate",
            y1: "1J",
            all: "Gesamtzeitraum"
        },
        cards: {
            average: "Metrik Durchschnitt",
            average_sub: "Basierend auf {range} Zeitraum",
            latest: "Letzter Wert",
            latest_sub: "Zuletzt aufgezeichnet",
            rest_days: "Ruhetage",
            rest_days_sub: "Empfohlen basierend auf Belastung",
            days: "Tage"
        },
        metrics: {
            composite_score: {
                label: "Symptom-Score",
                description: "Die Summe all deiner getrackten Symptome.",
                better: "Niedriger ist besser"
            },
            adjusted_score: {
                label: "MEasure-CFS Score",
                description: "Unser individueller Krankheits-Tracker, der alle Symptome, Vitalwerte und Belastungen berücksichtigt. Wir gehen davon aus, dass mehr Belastung wünschenswert ist.",
                better: "Niedriger ist besser"
            },
            hrv: {
                label: "HRV (Herzfrequenzvariabilität)",
                short_label: "HRV",
                description: "Misst die Zeitvariation zwischen Herzschlägen. Höhere Werte zeigen bessere Erholung.",
                better: "Höher ist besser"
            },
            resting_heart_rate: {
                label: "Ruhepuls",
                description: "Dein durchschnittlicher Puls in vollständiger Ruhe.",
                better: "Niedriger ist besser"
            },
            step_count: {
                label: "Schritte",
                description: "Tägliche Schrittzahl deines Gesundheits-Anbieters.",
                better: "Höher ist besser"
            },
            exertion_score: {
                label: "Belastung",
                description: "Die Summe all deiner getrackten Belastungen.",
                better: "Höher ist besser."
            },
            trend: "Trend",
            about: "Über",
            crashes: {
                label: "Crash (PEM)",
                description: "Tage, die in Visible als 'Crash' markiert wurden.",
                better: "Weniger ist besser"
            },
            sleep: {
                label: "Schlafprobleme",
                description: "Erfasst Schwierigkeiten mit der Schlafqualität und -dauer. Hoher Score = Schlechter Schlaf.",
                better: "Niedriger ist besser"
            }
        },
        crash_mode: "PEM Analyse",
        pem_days: "PEM-Tage"
    },
    landing: {
        hero: {
            badge: "Privacy-First Gesundheitsanalyse",
            title_main: "Verstehe deinen Körper.",
            title_highlight: "Meistere deine Energie.",
            subtitle: "Ein sicherer Raum für ME/CFS- und Long-Covid-Betroffene, um Daten von \"Visible\" und anderen Symptom-Tracking-Apps zu visualisieren. Erkenne Crash-Trigger, verfolge die Wirksamkeit von Medikamenten und finde deine Baseline—ohne Kompromisse beim Datenschutz.",
            dropzone: {
                title: "Analysiere deine CSV sofort",
                subtitle: "Zieh dein Visible-Export hierher, um zu beginnen",
                button_account: "Oder erstelle zuerst ein Konto",
                button_select: "Datei auswählen"
            },
            features: {
                secure: "Sichere Speicherung",
                instant: "Sofortige Einblicke"
            },
            transform_title: "Verstehe deine Gesundheit",
            predictive_insights: "mit datengestützten Analysen",
            drop_title: "Zieh deine Visible App Daten hierher, um zu beginnen",
            drop_title_generic: "Zieh deine App Daten hierher, um zu beginnen",
            drop_desc: "Lade CSV-Dateien von deiner Visible oder Bearable App hoch (weitere Apps folgen in Kürze). Deine Reise zur Klarheit beginnt hier.",
            create_account_hint: "Neu hier? Erstelle zuerst ein Konto →"
        },
        pillars: {
            phase: {
                title: "Phasenanalyse",
                desc: "Identifiziere Aufbau-, Crash- und Erholungsphasen mit überlagerter Epochenanalyse. Erkenne Muster in deinen biologischen Daten."
            },
            meds: {
                title: "Medikamenten-Tracking",
                desc: "Multivariate Regression isoliert die Wirkung jeder Behandlung. Wisse genau, was funktioniert, mit statistischer Sicherheit."
            },
            recovery: {
                title: "PEM-Gefahren-Erkennung",
                desc: "Stoppe Crashs, bevor sie entstehen. Unser Algorithmus erkennt subtile biometrische Veränderungen, die ein drohendes PEM-Ereignis signalisieren, und gibt dir die Kontrolle, dich rechtzeitig auszuruhen."
            }
        },
        steps: {
            prefix: "Schritt",
            "01": {
                title: "Lade deine Biomarker-Daten hoch",
                desc: "Importiere CSV-Dateien von jedem Symptom-Tracker. Wir unterstützen HRV, Ruhepuls, Aktivitätslevel, Schlafdaten und eigene Symptomprotokolle."
            },
            "02": {
                title: "KI analysiert Muster",
                desc: "Unsere Engine identifiziert Crash-Zyklen, berechnet die Belastungsintensität und erstellt deine einzigartige biologische Signatur."
            },
            "03": {
                title: "Erhalte vorausschauende Einblicke",
                desc: "Erhalte handlungsorientierte Empfehlungen, bevor ein Crash eintritt. Verfolge die Wirksamkeit von Behandlungen und verstehe die Warnsignale deines Körpers."
            },
            metrics: {
                hrv: "HRV",
                rhr: "Ruhepuls",
                sleep: "Schlafqualität"
            },
            analysis: {
                buildup: "AUFBAU",
                event: "EREIGNIS",
                recovery: "ERHOLUNG"
            },
            status: {
                crash_risk: "Crash-Risiko",
                high: "HOCH",
                recovery_status: "Erholungsstatus",
                impact: "Auswirkung"
            }
        },
        privacy_badge: {
            title: "Privacy-First Design",
            desc: "Deine Gesundheitsdaten sind sensibel. Die gesamte Verarbeitung ist sicher, verschlüsselt und wird niemals geteilt. Deine Daten gehören dir, immer."
        },
        cta: {
            title: "Bereit, die Kontrolle über deine Gesundheit zu übernehmen?",
            desc: "Schließe dich Patienten an, die Daten in Erholung verwandeln. Beginne noch heute mit der Analyse deiner Biomarker.",
            button_signup: "Kostenloses Konto erstellen",
            button_demo: "Demo ansehen"
        },
        why: {
            title: "Warum deine Trends analysieren?",
            subtitle: "Rohdaten sind schwer zu lesen bei Brain Fog. Wir verwandeln deine täglichen Check-ins in klare, freundliche Geschichten, die dir helfen, für deine Gesundheit einzutreten.",
            cards: {
                privacy: {
                    title: "Privatsphäre per Design",
                    desc: "Deine Gesundheitsdaten sind sensibel. Deshalb nutzen wir Row Level Security (RLS). Du besitzt deine Daten, punktum."
                },
                baseline: {
                    title: "Verstehe deine Baseline",
                    desc: "Korreliere HRV, Symptome und Ruhe, um deinen sicheren Energiebereich zu finden. Identifiziere Crash-Auslöser, bevor sie passieren."
                },
                patients: {
                    title: "Gemacht für Patienten",
                    desc: "Speziell für die chronisch kranke Gemeinschaft entwickelt. Hoher Kontrast, geringe kognitive Belastung und Pacing-fokussiert."
                }
            }
        },
        teaser: {
            title: "Muster erkennen, Balance finden.",
            subtitle: "Unsere fortschrittliche Analyse-Engine hilft dir zu bewerten, ob das neue Supplement wirklich wirkt oder ob \"Resting Pacing\" deine Baseline-Werte verbessert.",
            list: {
                pem: "PEM (Post-Exertional Malaise) Erkennung",
                meds: "Medikamenten-Wirksamkeits-Tracking",
                symptom: "Symptom-Korrelations-Matrix",
                trends: "HRV & Ruhepuls Trends"
            },
            cta: "Kostenlos starten",
            card_insight: "Wöchentliche Einblicke"
        },
        footer: {
            copyright: "MEasure-CFS. Open Source & Community Driven."
        }
    },
    experiments: {
        page_title: "Statistische Experimente",
        intro: {
            title: "Plattform-Einführung",
            welcome: "Willkommen in deinem biologischen Labor. Diese Seite hilft dir, den unabhängigen Einfluss von Medikamenten, Nahrungsergänzungsmitteln und Lebensstiländerungen mittels OLS-Regression zu isolieren.",
            overlap_title: "Überlappungs-Isolation",
            overlap_desc: "Unsere Engine trennt mathematisch die Effekte mehrerer Interventionen, auch wenn sie sich zeitlich überschneiden.",
            zscore_title: "Z-Score Auswirkung",
            zscore_desc: "Sieh genau, um wie viele Standardabweichungen (σ) sich deine HRV oder dein Puls unabhängig für jedes Medikament verschoben hat."
        },
        actions: {
            start_new: "Neues Experiment starten",
            log_new: "Neues Experiment erfassen",
            edit: "Experiment bearbeiten",
            delete: "Experiment löschen",
            save: "Experiment starten",
            update: "Experiment aktualisieren",
            cancel: "Abbrechen",
            confirm_delete: "Bist du sicher, dass du dieses Experiment löschen möchtest?"
        },
        form: {
            name: "Name",
            dosage: "Dosis (Optional)",
            category: "Kategorie",
            start_date: "Startdatum",
            end_date: "Enddatum (Optional)",
            categories: {
                lifestyle: "Lebensstil (Pacing, Ruhe)",
                medication: "Medikament",
                supplement: "Nahrungsergänzung",
                other: "Sonstiges"
            }
        },
        active: {
            title: "Aktuell aktiv",
            day: "Aktiv • Tag",
            confidence: "Modell-Konfidenz",
            confidence_hint: "Benötigt ~30 Tage für volle Genauigkeit.",
            impact_title: "Unabhängiger Gesundheits-Einfluss (kontrolliert auf Überlappungen)",
            no_active_title: "Keine aktiven Experimente",
            no_active_desc: "Starte ein neues Experiment, um zu verfolgen, wie Interventionen deine Gesundheit beeinflussen."
        },
        history: {
            title: "Historisches Archiv",
            independent_outcome: "Unabhängiges Ergebnis",
            influence: "Einfluss",
            no_history: "Keine abgeschlossenen Experimente im Archiv."
        },
        impact: {
            insufficient: "Noch nicht genügend Daten, um unabhängigen Einfluss zu isolieren.",
            significance: {
                significant: "Signifikant",
                trend: "Trend",
                positive: "Positiv",
                negative: "Negativ",
                neutral: "Neutral"
            }
        }
    },
    upload: {
        title: "Daten verwalten",
        subtitle_prefix: "Importiere deine",
        subtitle_highlight: "Visible",
        subtitle_manage: "Überprüfe und verwalte deine Trends.",
        description_empty: "Visualisiere dein Energie-Envelope und deine Symptommuster sicher.",
        description_data: "Lade neue Dateien hoch, um Daten hinzuzufügen oder bestehende Einträge zu verwalten.",
        private_badge: "Private & lokale Verarbeitung",
        trust_badge: "Deine Gesundheitsdaten werden zu 100 % lokal in deinem Browser verarbeitet.",
        tabs: {
            visible: "Visible App (CSV)",
            bearable: "Bearable App (CSV)",
            apple: "Apple Health Schritte (XML)",
            google: "Google Fit Schritte (CSV)",
            samsung: "Samsung Health Schritte (CSV)"
        },
        dropzone: {
            idle: "Ziehe deine Visible-Exportdatei hierher oder klicke unten, um sie auszuwählen.",
            active: "Datei hier ablegen...",
            success: "Upload abgeschlossen!",
            error: "Upload fehlgeschlagen",
            uploading: "Wird hochgeladen...",
            button_upload: "Neue Datei hochladen",
            button_select: "Datei auswählen",
            button_retry: "Erneut versuchen"
        },
        data_log: {
            title: "Datenprotokoll",
            delete_all: "Alle Daten löschen",
            delete_confirm: "WARNUNG: Dies löscht ALLE deine hochgeladenen Gesundheitsdaten. Diese Aktion kann nicht rückgängig gemacht werden. Bist du sicher?",
            delete_entry_confirm: "Bist du sicher, dass du diesen Eintrag löschen möchtest?",
            provider_coming_soon: "Anbieter demnächst verfügbar",
            provider_built_hint: "Integrationen für {provider} werden gerade entwickelt. Ändere deinen Anbieter in den Einstellungen, wenn du einen anderen nutzen möchtest.",
            hide_import: "Import-Tools ausblenden",
            table: {
                date: "Datum",
                rhr: "Ruhepuls",
                hrv: "HRV",
                steps: "Schritte",
                symptoms: "Symptome",
                action: "Aktion",
                empty: "Keine aktuellen Einträge gefunden.",
                recent_hint: "Zeigt die letzten 500 Einträge an."
            }
        }
    },
    legal: {
        impressum: "Impressum",
        privacy: "Datenschutzerklärung",
        terms: "Nutzungsbedingungen",
        agree_terms_privacy: "Ich akzeptiere die Nutzungsbedingungen und die Datenschutzerklärung.",
        agree_health_data: "Ich willige ausdrücklich in die Verarbeitung meiner sensiblen Gesundheitsdaten ein, wie in der Datenschutzerklärung beschrieben (Art. 9 DSGVO).",
        medical_disclaimer: "Medizinischer Haftungsausschluss",
        medical_disclaimer_text: "Diese App dient ausschließlich Informationszwecken und bietet keine medizinische Beratung, Diagnose oder Behandlung. Lassen Sie sich immer von Ihrem Arzt beraten.",
        not_medical_product: "Kein Medizinprodukt",
        copyright: "© 2025 Visible Analytics. Alle Rechte vorbehalten.",
        info_ddg: "Angaben gemäß § 5 DDG",
        operator: "Betreiber der Webseite",
        country: "Deutschland",
        email: "E-Mail",
        disclaimer_title: "Haftungsausschluss",
        disclaimer_text: "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.",
        privacy_page: {
            intro: "Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.",
            health_data_title: "Wichtiger Hinweis zu Gesundheitsdaten",
            health_data_text: "Wir verarbeiten sensible Gesundheitsdaten (z. B. Symptom-Scores, HRV-Werte) gemäß Art. 9 Abs. 2 lit. a DSGVO ausschließlich auf Grundlage Ihrer ausdrücklichen Einwilligung.",
            s1_title: "1. Datenerfassung auf dieser Webseite",
            s1_operator: "Betreiber: Die Datenverarbeitung auf dieser Webseite erfolgt durch den Webseitenbetreiber (siehe Impressum).",
            s1_how: "Wie erfassen wir Ihre Daten? Ihre Daten werden dadurch erhoben, dass Sie uns diese mitteilen. Hierbei handelt es sich um Daten, die Sie bei der Anmeldung eingeben oder durch den Upload von CSV-Dateien (z.B. Visible Export) bereitstellen.",
            s1_purpose: "Wofür nutzen wir Ihre Daten? Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Webseite zu gewährleisten. Andere Daten werden zur Analyse Ihres Gesundheitsverlaufs (Visualisierung von Korrelationen) genutzt.",
            s2_title: "2. Hosting und Dateninfrastruktur",
            s2_text: "Wir hosten die Daten bei unserem Partner Supabase. Die Daten werden in verschlüsselter Form gespeichert. Wir haben Maßnahmen getroffen, um Ihre Daten vor unbefugtem Zugriff zu schützen. Eine Weitergabe Ihrer Gesundheitsdaten an Dritte zu Werbezwecken findet unter keinen Umständen statt.",
            s3_title: "3. Ihre Rechte",
            s3_intro: "Sie haben jederzeit das Recht:",
            s3_rights: [
                "Auskunft über Ihre gespeicherten Daten zu erhalten (Art. 15 DSGVO)",
                "Die Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)",
                "Die Löschung Ihrer Daten zu verlangen ('Recht auf Vergessenwerden', Art. 17 DSGVO)",
                "Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO)",
                "Ihre Einwilligung mit Wirkung für die Zukunft zu widerrufen"
            ],
            s3_delete_hint: "Sie können Ihren gesamten Account und alle Daten jederzeit in den Einstellungen löschen.",
            last_updated: "Stand: Dezember 2025"
        },
        terms_page: {
            not_medical_product_long: "Diese App ist KEIN Medizinprodukt im Sinne der EU-Medizinprodukteverordnung (MDR). Sie dient ausschließlich der Visualisierung und Korrelation von bereits existierenden Gesundheitsdaten für Ihr persönliches Wohlbefinden. Die App stellt keine Diagnosen, gibt keine Therapieempfehlungen und ersetzt nicht den Besuch bei einem qualifizierten Arzt. Wenn Sie medizinische Beschwerden haben, suchen Sie bitte umgehend professionelle Hilfe auf.",
            s1_title: "1. Geltungsbereich",
            s1_desc_en: "Track-ME is provided 'as is' without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.",
            s1_desc_de: "Durch die Nutzung der Web-App 'Visible Analytics' erklären Sie sich mit den folgenden Nutzungsbedingungen einverstanden. Die App wird von Felix Kania als kostenloses Tool zur Verfügung gestellt.",
            s2_title: "2. Leistungsumfang",
            s2_desc_en: "The Insights feature provides statistical correlations based on your data. These are mathematical observations 'as calculated' and do not imply medical causation. Always consult a healthcare professional for medical advice.",
            s2_desc_de: "'Visible Analytics' ermöglicht Nutzern den Upload von Gesundheitsdaten (z.B. aus der Visible App oder Apple Health) zur grafischen Aufarbeitung und statistischen Auswertung persönlicher Trends. Wir übernehmen keine Garantie für die ständige Verfügbarkeit der App oder die Fehlerfreiheit der Berechnungen.",
            s3_title: "3. Haftungsbeschränkung",
            s3_desc: "Die Nutzung der App erfolgt auf eigene Gefahr. Wir haften nicht für Schäden, die aus der Nutzung oder im Vertrauen auf die von der App bereitgestellten Grafiken oder Statistiken entstehen. Dies gilt insbesondere für Entscheidungen bezüglich Ihrer Gesundheit, die Sie auf Grundlage der App treffen.",
            s4_title: "4. Änderungen der Bedingungen",
            s4_desc: "Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Die aktuelle Fassung ist stets über die Webseite abrufbar.",
            last_updated: "Zuletzt aktualisiert: 30. Dezember 2024"
        }
    },
    authCodeError: {
        title: "Link abgelaufen",
        description: "Es sieht so aus, als ob dieser Bestätigungslink bereits verwendet wurde oder abgelaufen ist. Aus Sicherheitsgründen kann jeder Link nur einmal verwendet werden.",
        button_login: "Anmeldung versuchen",
        button_home: "Zurück zur Startseite",
        help_title: "Hilfe benötigt?",
        help_text: "Wenn du dich noch nicht eingeloggt hast, versuche einen neuen Link anzufordern, indem du deine E-Mail erneut auf der Login- oder Registrierungsseite eingibst. Wenn das Problem weiterhin besteht, kontaktiere uns gerne."
    },
    auth: {
        login: {
            testimonial: {
                quote: "MEasure-CFS verwandelt meinen Brain Fog in einen klaren Plan. Es ist das erste Mal, dass ich meinen Energie-Einbrüchen voraus bin."
            }
        }
    }
}
