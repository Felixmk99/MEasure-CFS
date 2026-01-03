import { Dictionary } from "../types"

export const en: Dictionary = {
    common: {
        loading: "Loading...",
        error: "An error occurred",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        confirm: "Confirm",
        success: "Success",
        custom: "Custom"
    },
    navbar: {
        dashboard: "Dashboard",
        insights: "Insights",
        experiments: "Experiments",
        data: "Data",
        upload_data: "Upload Data",
        settings: "Settings",
        logout: "Log out",
        login: "Log In",
        signup: "Sign Up",
        profile: "Profile",
        welcome: "Welcome",
        missing_steps_hint: "Missing Steps?",
        missing_steps_tooltip: "Upload Apple, Google or Samsung health step data to improve your Health Score accuracy.",
        pem_status: {
            label: "PEM Status",
            needs_data: "Needs Data",
            stable: "All Clear",
            danger: "PEM Danger",
            reason_no_history: "Minimum 10 days of data + 1 crash required",
            reason_no_recent_data: "No data in the last 7 days",
            reason_no_crashes: "No historical crashes found to analyze",
            prediction: "Predicted crash: {day}",
            matches: "Matches historical triggers:",
            matches_personal: "Matches Personal Patterns:",
            matches_general: "General Risk Indicators:",
            explanation: "Explanation",
            matches_personal_desc: "Matches a pattern from your history.",
            matches_general_desc: "Your recent average {label} is significantly above your baseline.",
            cumulative_load: "High cumulative activity detected",
            exertion: "exertion",
            activity: "activity",
            danger_fallback: "High activity levels detected relative to your baseline. Please check your data log for details.",
            stable_message: "Current activity levels are within your historical safe zone.",
            error_fetch: "Failed to load PEM status",
            biometrics_title: "Biometric Baseline",
            biometrics_stable: "Your core biometrics are within your safe baseline. No risk patterns detected.",
            status_optimal: "Optimal",
            status_normal: "Stable",
            status_strained: "Strained",
            status_unknown: "No Baseline"
        }
    },
    footer: {
        built_by: "Built by Felix Kania",
        contact: "Questions & Feature Ideas"
    },
    landing: {
        hero: {
            badge: "Privacy-First Health Analytics",
            title_main: "Understand your body.",
            title_highlight: "Master your energy.",
            subtitle: "A secure space for ME/CFS and Long Covid patients to visualize \"Visible\" and other symptom tracking app data. Spot crash triggers, track medication efficacy, and find your baseline—without compromising privacy.",
            dropzone: {
                title: "Analyze your CSV instantly",
                subtitle: "Drag & Drop your Visible export here to start",
                button_account: "Or create an account first",
                button_select: "Choose file"
            },
            features: {
                secure: "Secure Storage",
                instant: "Instant Insights"
            },
            transform_title: "Understand your health",
            predictive_insights: "with data-driven insights",
            drop_title: "Drop Visible App export to begin",
            drop_title_generic: "Drop App export to begin",
            drop_desc: "Upload CSV files from your Visible or Bearable app (More apps coming soon). Your journey to clarity starts here.",
            create_account_hint: "New here? Create account first →"
        },
        pillars: {
            phase: {
                title: "Phase Analysis",
                desc: "Identify buildup, crash, and recovery phases with superposed epoch analysis. See patterns in your biological data."
            },
            meds: {
                title: "Medication Tracking",
                desc: "Multivariate regression isolates each treatment's impact. Know exactly what's working with statistical confidence."
            },
            recovery: {
                title: "PEM Danger Detection",
                desc: "Stop crashes before they start. Our proprietary algorithm identifies subtle biometric shifts that signal an impending PEM event, giving you the agency to rest before it's too late."
            }
        },
        steps: {
            prefix: "Step",
            label_01: "Step 01",
            label_02: "Step 02",
            label_03: "Step 03",
            "01": {
                title: "Upload your biomarker data",
                desc: "Import CSV files from any symptom tracker. We support HRV, RHR, activity levels, sleep metrics, and custom symptom logs."
            },
            "02": {
                title: "AI analyzes patterns",
                desc: "Our engine identifies crash cycles, calculates impact intensity, and maps your unique biological signature using superposed epoch analysis."
            },
            "03": {
                title: "Get predictive insights",
                desc: "Receive actionable recommendations before crashes hit. Track treatment efficacy and understand your body's early warning signals."
            },
            metrics: {
                hrv: "HRV",
                rhr: "RHR",
                sleep: "Sleep Quality"
            },
            analysis: {
                buildup: "BUILDUP",
                event: "EVENT",
                recovery: "RECOVERY"
            },
            status: {
                crash_risk: "Crash Risk",
                high: "HIGH",
                recovery_status: "Recovery Status",
                impact: "Impact"
            }
        },
        privacy_badge: {
            title: "Privacy-first design",
            desc: "Your health data is sensitive. All processing is secure, encrypted, and never shared. You own your data, always."
        },
        cta: {
            title: "Ready to take control of your health?",
            desc: "Join patients who are turning data into recovery. Start analyzing your biomarkers today.",
            button_signup: "Create free account",
            button_demo: "View demo"
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
    dashboard: {
        title: "Health Trends",
        subtitle_prefix: "Tracking your",
        subtitle_suffix: "over time.",
        trend_mode: "Trend",
        metrics_dropdown: "Metrics (Max 2)",
        metrics_selected: "Selected",
        charts: {
            synced: "Synced with Visible App",
            encrypted: "Data encrypted on device • Last updated just now"
        },
        status: {
            stable: "Stable",
            improving: "Improving",
            declining: "Worsening",
            worsening: "Worsening",
            insufficient_data: "No data found for this period"
        },
        time_ranges: {
            d7: "7D",
            d30: "30D",
            m3: "3M",
            m6: "Last 6 Months",
            y1: "1Y",
            all: "All Time"
        },
        cards: {
            average: "Metric Average",
            average_sub: "Based on {range} timeframe",
            latest: "Latest Reading",
            latest_sub: "Last recorded entry",
            rest_days: "Rest Days",
            rest_days_sub: "Recommended based on load",
            days: "days"
        },
        metrics: {
            composite_score: {
                label: "Symptom Score",
                description: "The sum of all your tracked symptoms.",
                better: "Lower is better"
            },
            adjusted_score: {
                label: "MEasure-CFS Score",
                description: "Our custom illness tracker, taking into account all symptoms, vitals and exertions. Assuming more exertion is desirable.",
                better: "Lower is better"
            },
            hrv: {
                label: "HRV (Heart Rate Variability)",
                short_label: "HRV",
                description: "Measures the time variation between heartbeats. Higher values indicate better recovery.",
                better: "Higher is better"
            },
            resting_heart_rate: {
                label: "Resting HR",
                description: "Your average heart rate while at complete rest.",
                better: "Lower is better"
            },
            step_count: {
                label: "Steps",
                description: "Daily step count from your health provider.",
                better: "Higher is better"
            },
            exertion_score: {
                label: "Exertion",
                description: "The sum of all your tracked exertions.",
                better: "Higher is better."
            },
            trend: "Trend",
            about: "About",
            crashes: {
                label: "Crashes (PEM)",
                description: "Days marked as 'Crash' in your Visible logs.",
                better: "Fewer is better"
            },
            sleep: {
                label: "Sleep Problems",
                description: "Tracks difficulties with sleep quality and duration. High score = Poor sleep.",
                better: "Lower is better"
            }
        },
        crash_mode: "Analyze PEM",
        pem_days: "PEM Days"
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
                significant: "Significant",
                trend: "Trend",
                positive: "Positive",
                negative: "Negative",
                neutral: "Neutral"
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
        trust_badge: "Your health data is processed 100% locally in your browser.",
        tabs: {
            visible: "Visible App (CSV)",
            bearable: "Bearable App (CSV)",
            apple: "Apple Health Steps (XML)",
            google: "Google Fit Steps (CSV)",
            samsung: "Samsung Health Steps (CSV)"
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
            delete_entry_confirm: "Are you sure you want to delete this entry?",
            provider_coming_soon: "Provider Coming Soon",
            provider_built_hint: "Integrations for {provider} are being built. Change your provider in Settings if you want to use another one.",
            hide_import: "Hide Import Tools",
            table: {
                date: "Date",
                rhr: "RHR",
                hrv: "HRV",
                steps: "Steps",
                symptoms: "Symptoms",
                action: "Action",
                empty: "No recent entries found.",
                recent_hint: "Showing recent 500 entries."
            }
        }
    },
    legal: {
        impressum: "Legal Notice",
        privacy: "Privacy Policy",
        terms: "Terms of Use",
        agree_terms_privacy: "I accept the Terms of Use and Privacy Policy.",
        agree_health_data: "I explicitly consent to the processing of my sensitive health data as described in the Privacy Policy (Art. 9 GDPR).",
        medical_disclaimer: "Medical Disclaimer",
        medical_disclaimer_text: "This app is for informational purposes only and does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician.",
        not_medical_product: "Not for medical use",
        copyright: "© 2025 Visible Analytics. All rights reserved.",
        info_ddg: "Information according to § 5 DDG",
        operator: "Website Operator",
        country: "Germany",
        email: "Email",
        disclaimer_title: "Disclaimer",
        disclaimer_text: "The contents of our pages were created with great care. However, we cannot guarantee the correctness, completeness and actuality of the contents. As a service provider, we are responsible for our own content on these pages according to the general laws pursuant to § 7 para.1 DDG.",
        privacy_page: {
            intro: "The protection of your personal data is a special concern of ours. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy.",
            health_data_title: "Important Note on Health Data",
            health_data_text: "We process sensitive health data (e.g. symptom scores, HRV values) according to Art. 9 Para. 2 lit. a GDPR exclusively based on your explicit consent.",
            s1_title: "1. Data Collection on this Website",
            s1_operator: "Operator: The data processing on this website is carried out by the website operator (see Legal Notice).",
            s1_how: "How do we collect your data? Your data is collected when you provide it to us. This is data that you enter during registration or provide by uploading CSV files (e.g. Visible Export).",
            s1_purpose: "What do we use your data for? Part of the data is collected to ensure the error-free provision of the website. Other data is used to analyze your health progress (visualization of correlations).",
            s2_title: "2. Hosting and Data Infrastructure",
            s2_text: "We host the data with our partner Supabase. The data is stored in encrypted form. We have taken measures to protect your data from unauthorized access. A transfer of your health data to third parties for advertising purposes will not take place under any circumstances.",
            s3_title: "3. Your Rights",
            s3_intro: "You have the right at any time:",
            s3_rights: [
                "To receive information about your stored data (Art. 15 GDPR)",
                "To demand the correction of incorrect data (Art. 16 GDPR)",
                "To demand the deletion of your data ('Right to be forgotten', Art. 17 GDPR)",
                "To object to the processing (Art. 21 GDPR)",
                "To revoke your consent with effect for the future"
            ],
            s3_delete_hint: "You can delete your entire account and all data at any time in the settings.",
            last_updated: "Last updated: December 2025"
        },
        terms_page: {
            not_medical_product_long: "This app is NOT a medical device within the meaning of the EU Medical Device Regulation (MDR). It serves exclusively for the visualization and correlation of existing health data for your personal well-being. The app does not provide diagnoses, therapy recommendations, and does not replace a visit to a qualified doctor. If you have medical complaints, please seek professional help immediately.",
            s1_title: "1. Scope",
            s1_desc: "Track-ME is provided 'as is' without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.",
            s2_title: "2. Scope of Service",
            s2_desc: "The Insights feature provides statistical correlations based on your data. These are mathematical observations 'as calculated' and do not imply medical causation. Always consult a healthcare professional for medical advice.",
            s3_title: "3. Limitation of Liability",
            s3_desc: "The use of the app is at your own risk. We are not liable for damages arising from the use or reliance on the graphics or statistics provided by the app. This applies particularly to decisions regarding your health that you make based on the app.",
            s4_title: "4. Changes to the Conditions",
            s4_desc: "We reserve the right to change these terms of use at any time. The current version is always available via the website.",
            last_updated: "Last updated: December 30, 2024"
        }
    },
    authCodeError: {
        title: "Login Link Expired",
        description: "It looks like this confirmation link has already been used or has expired. For security, each link can only be used once.",
        button_login: "Try Logging In",
        button_home: "Back to Home",
        help_title: "Need help?",
        help_text: "If you haven't logged in yet, try requesting a new link by entering your email at the login or signup page again. If the issue persists, feel free to contact us."
    },
    auth: {
        login: {
            testimonial: {
                quote: "MEasure-CFS turns my brain fog into a clear plan. It's the first time I feel ahead of my energy crashes."
            }
        }
    }
}
