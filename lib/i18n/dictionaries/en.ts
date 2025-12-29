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
        missing_steps_tooltip: "Upload Apple Health step data to improve your Health Score accuracy."
    },
    footer: {
        built_by: "Built by Felix Kania",
        contact: "Contact & Feature Ideas: felixmkania@gmail.com"
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
                description: "Your overall health snapshot based on symptom severity and daily activity.",
                better: "Lower is better"
            },
            adjusted_score: {
                label: "MEasure-CFS Score",
                description: "Your daily energy budget status. High score = High symptoms / Low energy.",
                better: "Lower is better"
            },
            hrv: {
                label: "HRV",
                description: "Measures the variation in time between heartbeats. Higher values indicate better recovery.",
                better: "Higher is better"
            },
            resting_heart_rate: {
                label: "Resting HR",
                description: "Your average heart rate while at complete rest.",
                better: "Lower is better"
            },
            step_count: {
                label: "Steps",
                description: "Daily step count from Apple Health.",
                better: "Higher is better"
            },
            exertion_score: {
                label: "Exertion",
                description: "Your self-reported level of physical and mental effort.",
                better: "Higher values indicate more activity"
            },
            trend: "Trend",
            about: "About",
            crashes: {
                label: "Crashes (PEM)",
                description: "Days marked as 'Crash' in your Visible logs.",
                better: "Fewer is better"
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
                date: "Date",
                rhr: "RHR",
                hrv: "HRV",
                steps: "Steps",
                symptoms: "Symptoms",
                action: "Action",
                empty: "No recent entries found."
            }
        }
    }
}
