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
                label: "Symptom Score",
                description: "Gesamtüberblick deiner Gesundheit basierend auf Symptom-Schwere.",
                better: "Niedriger ist besser"
            },
            adjusted_score: {
                label: "MEasure-CFS Score",
                description: "Your daily energy budget status. High score = High symptoms / Low energy.",
                better: "Lower is better"
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
                description: "Dein selbstberichtetes Level an physischer und mentaler Anstrengung.",
                better: "Höhere Werte zeigen mehr Aktivität"
            },
            trend: "Trend",
            about: "Über",
            crashes: {
                label: "Crash (PEM)",
                description: "Tage, die in Visible als 'Crash' markiert wurden.",
                better: "Weniger ist besser"
            }
        },
        crash_mode: "PEM Analyse",
        pem_days: "PEM-Tage"
    },
    landing: {
        hero: {
            badge: "Privacy-First Health Analytics",
            title_main: "Understand your body.",
            title_highlight: "Master your energy.",
            subtitle: "A secure, friendly space for ME/CFS and Long Covid warriors to visualize \"Visible\" app data. Spot crash triggers, track medication efficacy, and find your baseline—without compromising privacy.",
            dropzone: {
                title: "Analyze your CSV instantly",
                subtitle: "Drag & Drop your Visible export here to start",
                button_account: "Or create an account first"
            },
            features: {
                secure: "Secure Storage",
                instant: "Instant Insights"
            }
        },
        why: {
            title: "Why analyze your trends?",
            subtitle: "Raw data is hard to read when you have brain fog. We turn your daily check-ins into clear, friendly stories that help you advocate for your health.",
            cards: {
                privacy: {
                    title: "Private by Design",
                    desc: "Your health data is sensitive. That's why we use Row Level Security (RLS). You own your data, full stop."
                },
                baseline: {
                    title: "Understand Your Baseline",
                    desc: "Correlate HRV, symptoms, and rest to find your safe energy envelope. Identify crash triggers before they happen."
                },
                patients: {
                    title: "Made for Patients",
                    desc: "Designed specifically for the chronic illness community. High contrast, low cognitive load, and pacing-focused."
                }
            }
        },
        teaser: {
            title: "Spot patterns, find balance.",
            subtitle: "Our advanced analytics engine helps you evaluate if that new supplement is actually working, or if \"Resting Pacing\" is improving your baseline scores.",
            list: {
                pem: "PEM (Post-Exertional Malaise) Detection",
                meds: "Medication Efficacy Tracking",
                symptom: "Symptom Correlation Matrix",
                trends: "HRV & Resting Heart Rate Trends"
            },
            cta: "Get Started for Free",
            card_insight: "Weekly Insights"
        },
        footer: {
            copyright: "MEasure-CFS. Open Source & Community Driven."
        }
    },
    experiments: {
        page_title: "Statistical Experimentation",
        intro: {
            title: "Platform Introduction",
            welcome: "Welcome to your biological laboratory. This page helps you isolate the independent impact of medications, supplements, and lifestyle changes using Ordinary Least Squares (OLS) regression.",
            overlap_title: "Overlap Isolation",
            overlap_desc: "Our engine mathematically separates the effects of multiple interventions, even if they overlap in time.",
            zscore_title: "Z-Score Impact",
            zscore_desc: "See exactly how many standard deviations (σ) your HRV or Heart Rate shifted independently for each med."
        },
        actions: {
            start_new: "Start New Experiment",
            log_new: "Log New Experiment",
            edit: "Edit Experiment",
            delete: "Delete Experiment",
            save: "Start Experiment",
            update: "Update Experiment",
            cancel: "Cancel",
            confirm_delete: "Are you sure you want to delete this experiment?"
        },
        form: {
            name: "Name",
            dosage: "Dosage (Optional)",
            category: "Category",
            start_date: "Start Date",
            end_date: "End Date (Optional)",
            categories: {
                lifestyle: "Lifestyle (Pacing, Rest)",
                medication: "Medication",
                supplement: "Supplement",
                other: "Other"
            }
        },
        active: {
            title: "Currently Active",
            day: "Active • Day",
            confidence: "Model Confidence",
            confidence_hint: "Requires ~30 days for full accuracy.",
            impact_title: "Independent Health Impact (Controlled for overlaps)",
            no_active_title: "No active experiments",
            no_active_desc: "Start a new experiment to track how interventions affect your health."
        },
        history: {
            title: "Historical Archive",
            independent_outcome: "Independent Outcome",
            influence: "Influence",
            no_history: "No concluded experiments in the archive."
        },
        impact: {
            insufficient: "Insufficient data to isolate independent impact yet.",
            significance: {
                positive: "Positive",
                negative: "Negative",
                neutral: "Neutral",
                likely_positive: "Likely Positive",
                likely_negative: "Likely Negative"
            }
        }
    },
    upload: {
        title: "Manage Data",
        subtitle_prefix: "Import your",
        subtitle_highlight: "Visible",
        subtitle_manage: "Review and manage your chronic illness trends.",
        description_empty: "Visualize your energy envelope and symptom patterns securely.",
        description_data: "Upload new files to append data or manage existing entries.",
        private_badge: "Private & Local Processing",
        tabs: {
            visible: "Visible App (CSV)",
            apple: "Apple Health Steps (XML)"
        },
        dropzone: {
            idle: "Drag and drop your Visible export here, or click below to browse.",
            active: "Drop the file here...",
            success: "Upload Complete!",
            error: "Upload Failed",
            uploading: "Uploading...",
            button_upload: "Upload New File",
            button_select: "Select File",
            button_retry: "Try Again"
        },
        data_log: {
            title: "Data Log",
            delete_all: "Delete All Data",
            delete_confirm: "WARNING: This will delete ALL your uploaded health data. This action cannot be undone. Are you sure?",
            table: {
                date: "Datum",
                hrv: "HRV",
                steps: "Schritte",
                symptoms: "Symptome",
                action: "Aktion",
                empty: "Keine Einträge gefunden."
            }
        }
    }
}
