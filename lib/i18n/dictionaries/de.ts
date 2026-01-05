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
        custom: "Benutzerdefiniert",
        unknown: "Unbekannt",
        metric_labels: {
            step_count: "Schritte",
            hrv: "HRV",
            resting_heart_rate: "Ruhepuls",
            symptom_score: "Symptom-Score",
            exertion_score: "Gesamtbelastung",
            composite_score: "Symptom-Score",
            adjusted_score: "MEasure-CFS Score",
            sleep: "Schlaf",
            fatigue: "Fatigue",
            anxiety: "Angst",
            cough: "Husten",
            depression: "Depression",
            fever: "Fieber",
            headaches: "Kopfschmerzen",
            headache: "Kopfschmerz",
            lightheadedness: "Benommenheit",
            "memory/mental": "Konzentrationsstörungen",
            "muscle weakness": "Muskelschwäche",
            nausea: "Übelkeit",
            "physical exertion": "Physische Belastung",
            "cognitive exertion": "Kognitive Belastung",
            "emotional exertion": "Emotionale Belastung",
            "social exertion": "Soziale Belastung",
            work: "Arbeit",
            stress: "Stress",
            palpitations: "Herzklopfen",
            stability_score: "Stabilitäts-Score",
            muscle_aches: "Muskelschmerzen",
            energy: "Energie"
        }
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
            label: "PEM-Risikoanalyse",
            needs_data: "Nicht genügend Daten",
            stable: "Stabiler Bereich",
            danger: "Akute Crash-Gefahr",
            reason_no_history: "Datenbasis fehlt (mind. 10 Tage + 1 Crash)",
            reason_no_recent_data: "Keine aktuellen Daten (letzte 7 Tage)",
            reason_no_crashes: "Keine bekannten Crashes zur Analyse",
            prediction: "Prognose: Crash am {day} möglich",
            matches: "Übereinstimmung mit Crash-Triggern:",
            matches_personal: "Individuelle Risikomuster:",
            matches_general: "Allgemeine Warnsignale:",
            explanation: "Details",
            matches_personal_desc: "Deine aktuellen Werte ähneln Phasen, die früher zu einem Crash geführt haben.",
            matches_general_desc: "Deine durchschnittliche {label} ist deutlich höher als dein übliches Toleranzniveau.",
            cumulative_load: "Kritische Gesamtbelastung",
            exertion: "Belastung",
            activity: "Aktivität",
            danger_fallback: "Deine Belastungswerte überschreiten deine Baseline signifikant.",
            stable_message: "Deine aktuelle Aktivität liegt innerhalb deiner individuellen Belastungsgrenzen.",
            error_fetch: "Analyse konnte nicht geladen werden",
            biometrics_title: "Biometrische Stabilität",
            biometrics_stable: "Biometrische Werte unauffällig. Keine akuten Warnzeichen.",
            status_optimal: "Optimal",
            status_normal: "Stabil",
            status_strained: "Beansprucht",
            status_unknown: "Unzureichende Daten",
            no_personal_matches: "Keine individuellen Risikomuster erkannt.",
            no_general_matches: "Belastung im grünen Bereich."
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
        compare_mode: "Vergleichen",
        pem_mode: "PEM",
        select_placeholder: "Metrik auswählen",
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
                label: "Track-Me Score",
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
                description: "Verfolgt Schwierigkeiten mit Schlafqualität und -dauer. Hoher Score = Schlechter Schlaf.",
                better: "Niedriger ist besser"
            },
            palpitations: {
                label: "Herzklopfen",
                description: "Verfolgt Herzrhythmusstörungen.",
                better: "Niedriger ist besser"
            },
            stability_score: {
                label: "Stabilitäts-Score",
                description: "Verfolgt die tägliche Energiestabilität.",
                better: "Höher ist besser"
            },
            muscle_aches: {
                label: "Muskelschmerzen",
                description: "Verfolgt die Intensität von Muskelschmerzen.",
                better: "Niedriger ist besser"
            },
            energy: {
                label: "Energie",
                description: "Selbstberichtetes Energieniveau.",
                better: "Höher ist besser"
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
            subtitle: "Ein sicherer Raum für ME/CFS- und Long-Covid-Betroffene, um Daten von \"Visible\" und anderen Symptom-Tagebuch-Apps zu visualisieren und analysieren. Erkenne Crash-Trigger, verfolge die Wirksamkeit von Medikamenten und finde deine Baseline—ohne Kompromisse beim Datenschutz.",
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
            transform_title: "Verstehe deinen Körper",
            predictive_insights: "durch datenbasierte Einblicke",
            drop_title: "Zieh deine Visible App Daten hierher, um zu beginnen",
            drop_title_generic: "Zieh deine Visible App Daten hierher, um zu beginnen",
            drop_desc: "Lade CSV-Dateien von deiner Visible oder Bearable App hoch (weitere Apps folgen in Kürze).",
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
                desc: "Stoppe Crashs, bevor sie entstehen. Unser Algorithmus erkennt subtile Veränderungen, die ein drohendes PEM-Ereignis signalisieren, und gibt dir die Kontrolle, dich rechtzeitig auszuruhen."
            }
        },
        steps: {
            prefix: "Schritt",
            label_01: "Schritt 01",
            label_02: "Schritt 02",
            label_03: "Schritt 03",
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
                rhr: "RHR",
                sleep: "Schlafqualität",
                adjusted_score: "MEasure-CFS Score"
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
            title: "Bereit, deine Erkrankung besser zu verstehen?",
            desc: "Schließe dich Patienten an, die Daten in Erkenntnisse verwandeln. Beginne noch heute mit der Analyse deiner Krankheitsdaten.",
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
            name_placeholder: "z.B. Low Dose Naltrexone",
            dosage_placeholder: "z.B. 0,5mg",
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
            confidence_desc: "Statistische Konfidenz basierend auf dem aktuellen Datenvolumen und der Varianz.",
            impact_title: "Unabhängiger Gesundheits-Einfluss (kontrolliert auf Überlappungen)",
            no_active_title: "Keine aktiven Experimente",
            no_active_desc: "Starte ein neues Experiment, um zu verfolgen, wie Interventionen deine Gesundheit beeinflussen.",
            started_at: "Gestartet am {date}"
        },
        history: {
            title: "Historisches Archiv",
            independent_outcome: "Unabhängiges Ergebnis",
            outcome_positive: "Positiver",
            outcome_negative: "Negativer",
            outcome_neutral: "Neutraler",
            influence: "Einfluss",
            no_history: "Keine abgeschlossenen Experimente im Archiv."
        },
        impact: {
            insufficient: "Noch nicht genügend Daten, um unabhängigen Einfluss zu isolieren.",
            no_significant: "Noch keine statistisch signifikanten Auswirkungen für dieses Experiment erkannt.",
            high_confidence_desc: "Sehr wahrscheinlich ein realer Effekt (95% Konfidenz).",
            trend_desc: "Angedeuteter Trend, aber möglicherweise werden mehr Daten benötigt.",
            not_significant_desc: "Nicht statistisch signifikant.",
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
            samsung: "Samsung Health Schritte (CSV)",
            csv: "CSV Datei"
        },
        dropzone: {
            idle: "Ziehe deinen Export hierher oder klicke unten, um ihn auszuwählen.",
            active: "Datei hier ablegen...",
            success: "Upload erfolgreich!",
            error: "Upload fehlgeschlagen",
            uploading: "Daten werden übertragen...",
            parsing: "Datei wird analysiert...",
            button_upload: "Neue Datei hochladen",
            button_select: "Datei auswählen",
            button_retry: "Erneut versuchen",
            title_visible: "Visible-CSV hochladen",
            title_apple: "Apple-Health-Export hochladen",
            title_google: "Google-Fit-Export hochladen",
            title_samsung: "Samsung-Health-Export hochladen",
            title_bearable: "Bearable-Export hochladen",
            title_csv: "CSV-Datei hochladen",
            hint_visible: "Ziehe deinen Visible-Export hierher, um deine Trends zu sehen.",
            hint_apple: "Ziehe die export.xml hierher. Wir extrahieren nur Schritte, die zu deinen Visible-Daten passen.",
            hint_google: "Ziehe deine Google-Fit-CSV für tägliche Aktivitäten hierher.",
            hint_samsung: "Ziehe deine Samsung-Health-Schritt-CSV hierher.",
            hint_bearable: "Ziehe deine Bearable-CSV hierher, um deine Gesundheitsdaten zu importieren.",
            hint_csv: "Lade eine Datei mit den Spalten 'Datum' und 'Schritte' hoch.",
            file_type_csv: "Unterstützt .csv Dateien",
            file_type_xml: "Unterstützt .xml Dateien"
        },
        messages: {
            invalid_file: "Ungültige Datei. Bitte lade die korrekte {provider}-Exportdatei hoch.",
            file_too_large: "Datei ist zu groß. Maximale Größe ist 100MB.",
            parsing_file: "{provider}-Datei wird analysiert...",
            processing_measurements: "{count} Messwerte werden verarbeitet...",
            login_required: "Du musst eingeloggt sein, um Daten hochzuladen.",
            uploading_days: "{count} Tage werden hochgeladen...",
            checking_existing: "Vorhandene Datensätze werden geprüft...",
            no_new_data: "Alle Daten in dieser Datei sind bereits in deinem Verlauf vorhanden. Keine neuen Tage zum Hinzufügen.",
            adding_days: "{count} neue Tage werden hinzugefügt...",
            processed_progress: "{current} / {total} Tage verarbeitet...",
            parse_error: "Fehler beim Analysieren der Datei: {error}",
            no_steps_found: "Keine Schrittzähler-Daten in dieser Datei gefunden.",
            no_matching_dates: "Keine übereinstimmenden Daten in deiner Datei gefunden (basierend auf deinen vorhandenen Gesundheitsdaten).",
            found_matching_days: "{count} Tage mit neuen Schrittdaten gefunden.",
            success_steps: "{count} Tage Schritte erfolgreich importiert!",
            requires_data: "Bitte lade zuerst Gesundheitsdaten (Visible/Bearable) hoch, um die zu trackenden Tage zu definieren.",
            missing_columns_error: "Fehlende Spalten: {columns}. Bitte überprüfe die CSV-Kopfzeile.",
            delete_confirm: "WARNUNG: Dies löscht ALLE deine hochgeladenen Gesundheitsdaten. Diese Aktion kann nicht rückgängig gemacht werden. Bist du sicher?",
            delete_entry_confirm: "Bist du sicher, dass du diesen Eintrag löschen möchtest?",
            provider_coming_soon: "Anbieter folgt bald",
            provider_built_hint: "Integrationen für {provider} werden derzeit entwickelt. Ändere deinen Anbieter in den Einstellungen, falls du einen anderen verwenden möchtest.",
            hide_import: "Import-Tools ausblenden"
        },
        data_log: {
            title: "Datenprotokoll",
            delete_all: "Alle Daten löschen",
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
    settings: {
        title: "Einstellungen",
        subtitle: "Verwalte dein Konto.",
        sidebar: {
            profile: "Profil",
            security: "Sicherheit",
            preferences: "Einstellungen",
            data_export: "Daten & Export",
            soon: "Bald"
        },
        profile: {
            title: "Öffentliches Profil",
            description: "Diese Informationen werden in deinem Profil angezeigt.",
            first_name: "Vorname",
            last_name: "Nachname",
            button_save: "Änderungen speichern",
            button_saving: "Speichert..."
        },
        personal: {
            title: "Persönliche Details",
            description: "Verwalte deine Kontaktinformationen.",
            email: "E-Mail-Adresse"
        },
        symptom_integration: {
            title: "Integration der Symptom-Tracker",
            description: "Wähle die App aus, mit der du deine täglichen Symptome verfolgst.",
            provider_label: "Symptom-Anbieter",
            placeholder: "Symptom-Tracker auswählen",
            hint: "Dies schaltet den Uploader im Tab 'Daten' um. Bestehende Daten werden niemals überschrieben.",
            visible: "Visible App",
            bearable: "Bearable App"
        },
        step_integration: {
            title: "Integration von Gesundheitsdaten",
            description: "Wähle die App aus, die deine täglichen Schrittdaten bereitstellt.",
            provider_label: "Schrittdaten-Anbieter",
            placeholder: "Schritt-Anbieter auswählen",
            hint: "Bestimmt, welcher Schritt-Uploader im Tab 'Daten' angezeigt wird.",
            apple: "Apple Health",
            google: "Google Fit",
            samsung: "Samsung Health",
            whoop: "Whoop",
            garmin: "Garmin",
            csv: "CSV Datei",
            soon: "Bald"
        },
        delete_account: {
            title: "Konto löschen",
            description: "Unwiderrufliche Aktion. Bitte lies die folgenden Informationen sorgfältig durch.",
            warning_title: "Warnung",
            warning_access: "Das Löschen deines Kontos führt zum sofortigen Verlust deines Zugangs.",
            warning_data: "Dein Analyse-Verlauf wird permanent gelöscht (sichere Löschung).",
            warning_recovery: "Eine Kontowiederherstellung ist nicht möglich.",
            confirm_label_before: "Zur Bestätigung, gib bitte ",
            confirm_label_after: " unten ein",
            confirm_keyword: "LÖSCHEN",
            button_delete: "Unwiderruflich löschen",
            button_deleting: "Daten werden gelöscht...",
            success_toast: "Konto erfolgreich gelöscht.",
            error_toast: "Fehler beim Löschen der Kontodaten: {error}",
            error_fallback: "Fehler beim Löschen des Kontos aus dem Authentifizierungssystem.",
            signout_failed: "Konto gelöscht, aber Abmeldung fehlgeschlagen. Bitte Browser-Cache leeren."
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
            s1_desc: "Durch die Nutzung der Web-App 'Visible Analytics' erklären Sie sich mit den folgenden Nutzungsbedingungen einverstanden. Die App wird von Felix Kania als kostenloses Tool zur Verfügung gestellt.",
            s2_title: "2. Leistungsumfang",
            s2_desc: "'Visible Analytics' ermöglicht Nutzern den Upload von Gesundheitsdaten (z.B. aus der Visible App oder Apple Health) zur grafischen Aufarbeitung und statistischen Auswertung persönlicher Trends. Wir übernehmen keine Garantie für die ständige Verfügbarkeit der App oder die Fehlerfreiheit der Berechnungen.",
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
        common: {
            email: "E-Mail-Adresse",
            password: "Passwort",
            placeholder_email: "name@beispiel.de",
            placeholder_password: "••••••••",
            privacy_guaranteed: "Datenschutz garantiert",
            privacy_quote: "MEasure-CFS speichert deine Gesundheitsdaten sicher bei Supabase, geschützt durch Row Level Security (RLS) und verschlüsselt. Es werden keine Daten geteilt."
        },
        login: {
            title_start: "Willkommen",
            title_highlight: "zurück",
            subtitle: "Melde dich an, um deine Fortschritte zu sehen.",
            forgot_password: "Passwort vergessen?",
            button_signin: "Anmelden",
            no_account: "Noch kein Konto?",
            button_create: "Kostenloses Konto erstellen",
            error_invalid: "Ungültige Zugangsdaten. Wenn du noch kein Konto hast, registriere dich bitte.",
            testimonial: {
                quote: "MEasure-CFS hilft mir dabei PEM effektiver zu vermeiden."
            }
        },
        signup: {
            title_start: "Beginne deine",
            title_highlight: "Krankheit zu verstehen",
            subtitle: "Erstelle eine sichere Umgebung, um deine Symptome zu analysieren.",
            first_name: "Vorname",
            last_name: "Nachname",
            placeholder_first_name: "Max",
            placeholder_last_name: "Mustermensch",
            password_hint: "Muss mindestens 8 Zeichen lang sein",
            button_create: "Konto erstellen",
            already_have_account: "Hast du bereits ein Konto?",
            button_login: "Anmelden",
            feature_baseline_title: "Verstehe deine Baseline",
            feature_baseline_desc: "Lerne dein Energie-Envelope kennen.",
            feature_design_title: "Patientenorientiertes Design",
            feature_design_desc: "Für Menschen mit chronischen Krankheiten entwickelt.",
            error_exists: "Konto existiert bereits. Bitte melde dich an.",
            success_pending: "Konto erstellt! Bitte prüfe deine E-Mails zur Bestätigung. Danach kannst du dich anmelden und mit dem Hochladen deiner Daten im Dashboard beginnen.",
            success_confirm: "Prüfe deine E-Mails für den Bestätigungslink."
        }
    },
    insights: {
        hero: {
            title: "Einblicke",
            desc: "Tiefgehende Analyse deiner gesamten Gesundheitsdaten, um versteckte Muster in deiner Genesung zu finden.",
            all_time: "Gesamtzeitanalyse",
            last_updated: "Zuletzt aktualisiert: {date}"
        },
        empty: {
            title: "Noch keine Einblicke",
            desc: "Du musst zuerst Gesundheitsdaten hochladen, bevor wir deine Symptommuster analysieren können.",
            button: "Erste CSV hochladen"
        },
        gathering: {
            title: "Sammle biologische Daten",
            desc: "Wir benötigen mindestens 7 Tage Daten, um statistisch signifikante Einblicke zu geben. Tracke weiter!",
            progress: "Aktueller Fortschritt: {count} / 7 Tage"
        },
        patterns: {
            title: "Handlungsmuster",
            safe_zones: "Sicherheitszonen",
            safe_zone_detected: "Sicherheitszone erkannt",
            same_day: "Effekte am selben Tag",
            next_day: "Effekte am nächsten Tag",
            two_day: "2 Tage verzögerte Effekte",
            insufficient_data: "Tracke deine Symptome weiter, um biologische Einblicke zu erhalten.",
            cards: {
                today: "Heute",
                plus_1_day: "+1 Tag",
                plus_2_days: "+2 Tage",
                impact: {
                    direct: "Direkte Auswirkung",
                    high_warning: "Warnung vor starker Auswirkung",
                    helpful_connection: "Hilfreicher Zusammenhang",
                    helpful_pattern: "Hilfreiches Muster",
                    direct_connection: "Direkte Verbindung",
                    hidden_lag: "Verzögerte Warnung"
                }
            }
        },
        clusters: {
            title: "Biologische Cluster",
            heatmap: {
                title: "Symptom-Korrelations-Heatmap",
                lag_zero: "(Verzögerung = 0)",
                desc: "Identifiziert Zusammenhänge zwischen Symptomen am selben Tag. Grün = positive Korrelation, Rot = negative Korrelation.",
                showing: "Zeige {count} von {total} Metriken",
                legend: "Legende:",
                strong_negative: "Stark Negativ",
                strong_positive: "Stark Positiv",
                insufficient: "Unzureichende Daten",
                correlation: "Korrelation",
                strength: {
                    strong: "Stark",
                    moderate: "Mittel",
                    weak: "Schwach",
                    very_weak: "Sehr schwach"
                },
                relation: {
                    positive: "Positive",
                    negative: "Negative",
                    neutral: "Neutrale",
                    suffix: "Beziehung"
                }
            }
        },
        logic: {
            reduces: "Reduziert",
            increases: "Erhöht",

            // Neutral wording (Start with Metric Name)
            recommendation_pattern: "{metric} > {value}",
            threshold_desc: "{metric} < {limit} hält {impact} niedriger.",

            keep: "Halte",
            watch: "Beobachte",
            above: "über",
            below: "unter",
            by: "um ~",
            from: "von",
            to: "auf",
            // threshold_desc: "Das Einhalten von unter {limit} {metric} hält dein {impact} deutlich niedriger."
        },
        footer: {
            disclaimer: "Statistische Einblicke dienen nur zu Informationszwecken und sind kein medizinischer Rat. Konsultiere immer deinen Arzt."
        },
        pem_analysis: {
            title: "PEM Analyse",
            no_clusters: {
                title: "Keine PEM-Cluster erkannt",
                desc: "Keine Crashes im ausgewählten Zeitraum gefunden.",
                desc_short: "Datenmenge noch nicht ausreichend für vollständige Zyklus-Analyse."
            },
            phase1: {
                title: "Phase 1: Aufbau",
                cumulative: "Kumulative Belastung erkannt",
                confidence: "Konfidenz:",
                no_pattern: "Kein klares Triggermuster",
                no_pattern_desc: "Keine akuten statistischen Spitzen in deinen Metriken während der 7-tägigen Aufbauphase gefunden. Deine Crashes könnten durch einen 'schleichenden Prozess' kumulativer Grundbelastung verursacht sein."
            },
            phase2: {
                title: "Phase 2: Das Ereignis",
                logged: "Protokolliert: {val}d",
                physiological: "Physiologisch: {val}d",
                classification: "Impact-Klassifizierung • Baseline: 90 Tage",
                persists: "Bio-Stress besteht weiter +{val}d",
                recovered: "Erholung zeitgleich mit Log",
                bio_stress_title: "Dauer des biologischen Stress",
                bio_stress_desc: "Misst, wie lange dein Körper in einem 'belasteten' Zustand bleibt (niedrige HRV, hohe Herzfrequenz oder starke Symptome). Kurzzeitige Verbesserungen werden ignoriert, um Genauigkeit zu gewährleisten.",
                extended_by: "Verlängert durch:",
                peak_deviation: "Maximale Abweichung"
            },
            phase3: {
                title: "Phase 3: Die Erholungsphase",
                subjective: "Subjektives Log: +{val}d",
                biological: "Biologische Verzögerung: +{val}d",
                lag: "Biologische Verzögerung",
                fast: "Schnelle Erholung",
                body_lag: "Körper hinkt hinterher: +{val}d nach Besserung",
                body_reset: "Körper erholt sich parallel zu Symptomen",
                hysteresis_title: "Biologische Latenz (Hysterese)",
                hysteresis_desc: "Misst, wie lange deine Biomarker (HRV, RHR) brauchen, um zur Baseline zurückzukehren, **nachdem** die akuten Symptome abgeklungen sind. Dies ist der 'Nachhall', den dein Körper noch verarbeitet.",
                slowest: "Am langsamsten",
                days_tail: "Tage Nachlauf",
                metric_recovery_time: "Diese Metrik benötigt durchschnittlich +{days} Tage, um nach einem Crash wieder in deinen Normalbereich zurückzukehren."
            },
            discovery: {
                increase: "Anstieg",
                decrease: "Abfall",
                onset: "Am Crash-Tag (Tag 0)",
                days_before: "{start}-{end}d davor",
                day_before: "{day}d davor",
                synergy: "Synergie"
            },
            classifications: {
                acute: "Akut",
                lagged: "Verzögert",
                historical: "Historisch",
                cumulative: "Kumulativ",
                acute_desc: "Trigger trat am Tag des Crash-Beginns auf.",
                lagged_desc: "Kurze Verzögerung (1-2 Tage) zwischen Ursache und Wirkung.",
                historical_desc: "Ein Einzelereignis vor 3+ Tagen, das wahrscheinlich beigetragen hat.",
                cumulative_desc: "Eine anhaltende Belastung über mehrere Tage hinweg.",
                onset_desc: "Trigger trat am Tag des Beginns auf.",
                pre_onset_desc: "Trigger trat vor dem Beginn auf."
            },
            footer: "Analyse basierend auf **{count} Crash-Episoden** mittels Superposed Epoch Analysis (SEA)."
        }
    },
    exertion_preference: {
        modal: {
            title: "Belastungspräferenz",
            description: "Wie beeinflusst Bewegung deine Gesundheitswerte? Diese Einstellung passt die Berechnung deines MEasure-CFS Scores an. Der MEasure-CFS-Score ist unser individueller Score, der deine Symptome, Vitalwerte, Schlaf und Belastung umfasst. Ein niedrigerer Wert bedeutet bessere Gesundheit.",
            option_desirable: {
                title: "Wünschenswert (Bewegung ist gut)",
                description: "Schritte und Belastung senken deinen Symptom-Belastungsscore. Wähle dies, wenn Aktivität hilft oder gute Gesundheit anzeigt."
            },
            option_undesirable: {
                title: "Unerwünscht (Belastung vermeiden)",
                description: "Schritte und Belastung erhöhen deinen Symptom-Belastungsscore. Wähle dies, wenn du unter PEM leidest und Aktivität begrenzen musst."
            },
            submit: "Präferenz speichern",
            loading: "Speichern...",
            success_toast: "Präferenz erfolgreich gespeichert"
        },
        settings: {
            title: "Belastungspräferenz",
            description: "Steuere, wie Schritte und Belastung in deinen Gesamtscore einfließen.",
            label: "Belastungseinfluss"
        }
    }
}
