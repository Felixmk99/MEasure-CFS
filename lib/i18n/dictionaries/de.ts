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
        missing_steps_tooltip: "Lade Apple Health Schrittdaten hoch, um die Genauigkeit deines Gesundheits-Scores zu verbessern."
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
            all: "Gesamt"
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
                description: "Tägliche Schrittzahl (Apple Health).",
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
            transform_title: "Verwandle Gesundheitsdaten",
            predictive_insights: "in vorausschauende Erkenntnisse",
            drop_title: "Zieh deine Daten hierher, um zu beginnen",
            drop_desc: "Lade CSV-Dateien von Visible, Bearable, Daylio, Symptom Shark, Guava oder MyDataHelps hoch. Deine Reise zu vorausschauender Gesundheit beginnt hier.",
            create_account_hint: "Neu hier? Erstelle zuerst ein Konto →"
        },
        pillars: {
            phase: {
                title: "Phasenanalyse",
                desc: "Identifiziere Aufbau-, Crash- und Erholungsphasen mit überlagerter Epochenanalyse. Erkenne biologisches Flüstern, bevor Symptome auftreten."
            },
            meds: {
                title: "Medikamenten-Tracking",
                desc: "Multivariate Regression isoliert die Wirkung jeder Behandlung. Wisse genau, was funktioniert, mit statistischer Sicherheit."
            },
            recovery: {
                title: "Erholungs-Einblicke",
                desc: "Erkenne die Hystereselücke – wenn du dich okay fühlst, aber deine Biologie noch nicht bereit ist. Verhindere Rückfälle durch vorausschauendes Handeln."
            }
        },
        steps: {
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
        subtitle_manage: "Überprüfe und verwalte deine Trends chronischer Krankheiten.",
        description_empty: "Visualisiere dein Energiebudget und Symptommuster sicher.",
        description_data: "Lade neue Dateien hoch, um Daten anzuhängen oder bestehende Einträge zu verwalten.",
        private_badge: "Privat & Lokal verarbeitet",
        tabs: {
            visible: "Visible App (CSV)",
            apple: "Apple Health Schritte (XML)"
        },
        dropzone: {
            idle: "Zieh dein Visible-Export hierher oder klicke, um zu durchsuchen.",
            active: "Datei hier ablegen...",
            success: "Upload vollständig!",
            error: "Upload fehlgeschlagen",
            uploading: "Lädt hoch...",
            button_upload: "Neue Datei hochladen",
            button_select: "Datei auswählen",
            button_retry: "Erneut versuchen"
        },
        data_log: {
            title: "Datenprotokoll",
            delete_all: "Alle Daten löschen",
            delete_confirm: "WARNUNG: Dies löscht ALLE deine hochgeladenen Gesundheitsdaten. Diese Aktion kann nicht rückgängig gemacht werden. Bist du sicher?",
            table: {
                date: "Datum",
                rhr: "RHR",
                hrv: "HRV",
                steps: "Schritte",
                symptoms: "Symptome",
                action: "Aktion",
                empty: "Keine aktuellen Einträge gefunden."
            }
        }
    }
}
