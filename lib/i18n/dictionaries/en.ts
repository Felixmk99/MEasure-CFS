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
        custom: "Custom",
        unknown: "Unknown",
        metric_labels: {
            step_count: "Steps",
            hrv: "HRV",
            resting_heart_rate: "Resting HR",
            symptom_score: "Symptom Score",
            exertion_score: "Total Exertion",
            composite_score: "Symptom Score",
            adjusted_score: "MEasure-CFS Score",
            sleep: "Sleep",
            fatigue: "Fatigue",
            anxiety: "Anxiety",
            cough: "Cough",
            depression: "Depression",
            fever: "Fever",
            headaches: "Headaches",
            headache: "Headache",
            lightheadedness: "Lightheadedness",
            "memory/mental": "Memory/Mental Fog",
            "muscle weakness": "Muscle Weakness",
            nausea: "Nausea",
            "physical exertion": "Physical Exertion",
            "cognitive exertion": "Cognitive Exertion",
            "emotional exertion": "Emotional Exertion",
            "social exertion": "Social Exertion",
            "mentally demanding": "Mentally Demanding",
            "socially demanding": "Socially Demanding",
            "physically demanding": "Physically Demanding",
            "shortness of breath": "Shortness of Breath",
            "total exertion": "Total Exertion",
            work: "Work",
            crash: "Crash",
            step_factor: "Steps Normalized",
            chest_pain: "Chest Pain",
            diarrhea: "Diarrhea",
            emotionally_stressful: "Emotionally Stressful",
            physically_active: "Physically Active",
            stress: "Stress",
            palpitations: "Palpitations",
            stability_score: "Stability Score",
            "stability score": "Stability Score",
            "funcap score": "Funcap Score",
            muscle_aches: "Muscle Aches",
            energy: "Energy"
        }
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
            matches_general_desc: "Your recent {label} levels are significantly higher than your body is used to.",
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
            status_unknown: "No Baseline",
            no_personal_matches: "No specific historical crash patterns matched.",
            no_general_matches: "Activity levels are within your safe baseline."
        }
    },
    footer: {
        built_by: "Built by Felix Kania",
        contact: "Questions & Feature Ideas",
        github: "GitHub Repository"
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
                sleep: "Sleep Quality",
                adjusted_score: "MEasure-CFS Score"
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
            button_demo: "Download Demo Data"
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
        compare_mode: "Compare",
        pem_mode: "PEM",
        select_placeholder: "Select Metric",
        metrics_dropdown: "Metrics (Max 2)",
        metrics_selected: "metrics selected",
        pem_insights_title: "PEM Insights",
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
            },
            palpitations: {
                label: "Palpitations",
                description: "Tracks heart rhythm disturbances.",
                better: "Lower is better"
            },
            stability_score: {
                label: "Stability Score",
                description: "Tracks day-to-day energy stability.",
                better: "Higher is better"
            },
            muscle_aches: {
                label: "Muscle Aches",
                description: "Tracks severity of muscle pain.",
                better: "Lower is better"
            },
            energy: {
                label: "Energy",
                description: "Self-reported energy level.",
                better: "Higher is better"
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
            name_placeholder: "e.g. Low Dose Naltrexone",
            dosage_placeholder: "e.g. 0.5mg",
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
            confidence_desc: "Statistical confidence based on current data volume and variance.",
            impact_title: "Independent Health Impact (Controlled for overlaps)",
            no_active_title: "No active experiments",
            no_active_desc: "Start a new experiment to track how interventions affect your health.",
            started_at: "Started {date}"
        },
        history: {
            title: "Historical Archive",
            independent_outcome: "Independent Outcome",
            outcome_positive: "Positive",
            outcome_negative: "Negative",
            outcome_neutral: "Neutral",
            influence: "Influence",
            no_history: "No concluded experiments in the archive."
        },
        impact: {
            insufficient: "Insufficient data to isolate independent impact yet.",
            no_significant: "No statistically significant impacts detected for this experiment yet.",
            high_confidence_desc: "Highly likely to be a real effect (95% confidence).",
            trend_desc: "Suggested trend, but more data may be needed.",
            not_significant_desc: "Not statistically significant.",
            significance: {
                significant: "Significant",
                trend: "Trend",
                positive: "Positive",
                negative: "Negative",
                neutral: "Neutral"
            },
            statistical_profile: "Statistical Profile",
            p_value: "P-Value",
            effect_size_label: "Effect Size (d)",
            deg_freedom: "Deg. Freedom",
            effect_sizes: {
                small: "Small",
                medium: "Medium",
                large: "Large"
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
            samsung: "Samsung Health Steps (CSV)",
            csv: "CSV File"
        },
        dropzone: {
            idle: "Drag and drop your Visible export here, or click below to browse.",
            active: "Drop the file here...",
            success: "Upload Complete!",
            error: "Upload Failed",
            uploading: "Uploading...",
            parsing: "Parsing File...",
            button_upload: "Upload New File",
            button_select: "Select File",
            button_retry: "Try Again",
            title_visible: "Upload your Visible CSV",
            title_apple: "Upload Apple Health Export",
            title_google: "Upload Google Fit Export",
            title_samsung: "Upload Samsung Health Export",
            title_bearable: "Upload Bearable Export",
            title_csv: "Upload Generic CSV",
            hint_visible: "Drop your Visible export here to see your trends.",
            hint_apple: "Drag and drop export.xml. We only extract steps matching your Visible data.",
            hint_google: "Drag and drop your Google Fit daily activity CSV.",
            hint_samsung: "Drag and drop your Samsung Health steps CSV.",
            hint_bearable: "Drop your Bearable CSV file here to import your health data.",
            hint_csv: "Upload a file with columns 'Date' and 'Steps'.",
            file_type_csv: "Supports .csv files",
            file_type_xml: "Supports .xml files"
        },
        messages: {
            invalid_file: "Invalid file. Please upload the correct {provider} export file.",
            file_too_large: "File is too large. Maximum size is 100MB.",
            parsing_file: "Parsing {provider} file...",
            processing_measurements: "Processing {count} measurements...",
            login_required: "You must be logged in to upload data.",
            uploading_days: "Uploading {count} days of data...",
            checking_existing: "Checking for existing records...",
            no_new_data: "All data in this file is already in your history. No new days to add.",
            adding_days: "Adding {count} new days of data...",
            processed_progress: "Processed {current} / {total} days...",
            parse_error: "Failed to parse file: {error}",
            no_steps_found: "No step count records found in this file.",
            no_matching_dates: "No matching dates found in your file based on your existing health data.",
            found_matching_days: "Found {count} days of new step data.",
            success_steps: "Successfully imported {count} days of steps!",
            requires_data: "Please upload Health Metrics first (Visible/Bearable) to define which days to track.",
            missing_columns_error: "Missing required columns: {columns}. Please check your CSV header.",
            delete_confirm: "WARNING: This will delete ALL your uploaded health records. This action cannot be undone. Are you sure?",
            delete_entry_confirm: "Are you sure you want to delete this entry?",
            provider_coming_soon: "Provider coming soon",
            provider_built_hint: "Integrations for {provider} are currently being built. Change your provider in settings if you wish to use a different one.",
            hide_import: "Hide Import Tools",
        },
        data_log: {
            title: "Data Log",
            delete_all: "Delete all data",
            table: {
                date: "Date",
                rhr: "RHR",
                hrv: "HRV",
                steps: "Steps",
                symptoms: "Symptoms",
                action: "Action",
                empty: "No recent entries found.",
                recent_hint: "Showing last 500 entries."
            }
        }
    },
    settings: {
        title: "Settings",
        subtitle: "Manage your account.",
        sidebar: {
            profile: "Profile",
            security: "Security",
            preferences: "Preferences",
            data_export: "Data & Export",
            soon: "Soon"
        },
        profile: {
            title: "Public Profile",
            description: "This information will be displayed on your profile.",
            first_name: "First name",
            last_name: "Last name",
            button_save: "Save Changes",
            button_saving: "Saving..."
        },
        personal: {
            title: "Personal Details",
            description: "Manage your contact information.",
            email: "Email address"
        },
        symptom_integration: {
            title: "Symptom Tracker Integration",
            description: "Choose which app you use to track your daily symptoms.",
            provider_label: "Symptom Provider",
            placeholder: "Select symptom tracker",
            hint: "This switches the uploader in the Data tab. Existing data is never overwritten.",
            visible: "Visible App",
            bearable: "Bearable App"
        },
        step_integration: {
            title: "Health Data Integration",
            description: "Choose which app provides your daily step data.",
            provider_label: "Step Data Provider",
            placeholder: "Select step provider",
            hint: "Determines which steps uploader is shown in the Data tab.",
            apple: "Apple Health",
            google: "Google Fit",
            samsung: "Samsung Health",
            whoop: "Whoop",
            garmin: "Garmin",
            csv: "CSV File",
            soon: "Soon"
        },
        delete_account: {
            title: "Delete Account",
            description: "Irreversible Action. Please review the information below.",
            warning_title: "Warning",
            warning_access: "Deleting your account will immediately remove your access.",
            warning_data: "Trend analysis history will be permanently deleted (secure wipe).",
            warning_recovery: "Account recovery is not possible.",
            confirm_label_before: "To confirm, please type ",
            confirm_label_after: " below",
            confirm_keyword: "DELETE",
            button_delete: "Permanently Delete",
            button_deleting: "Deleting data...",
            success_toast: "Account deleted successfully.",
            error_toast: "Failed to delete account data: {error}",
            error_fallback: "Failed to delete account from authentication system.",
            signout_failed: "Account deleted, but sign-out failed. You may need to clear your browser cache."
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
        common: {
            email: "Email Address",
            password: "Password",
            placeholder_email: "jane@example.com",
            placeholder_password: "••••••••",
            privacy_guaranteed: "Privacy Guaranteed",
            privacy_quote: "MEasure-CFS hosts your health data securely with Supabase, protected by Row Level Security (RLS) and stored encrypted. No records are ever shared."
        },
        login: {
            title_start: "Welcome",
            title_highlight: "back home",
            subtitle: "Sign in to visualize your progress.",
            forgot_password: "Forgot password?",
            button_signin: "Sign In",
            no_account: "Don't have an account?",
            button_create: "Create Free Account",
            error_invalid: "Invalid credentials. If you don't have an account, please sign up.",
            testimonial: {
                quote: "MEasure-CFS helps me reduce my PEM episodes."
            }
        },
        signup: {
            title_start: "Start your",
            title_highlight: "clarity journey",

            first_name: "First Name",
            last_name: "Last Name",
            placeholder_first_name: "Jane",
            placeholder_last_name: "Doe",
            password_hint: "Must be at least 8 characters",
            button_create: "Create Account",
            already_have_account: "Already have an account?",
            button_login: "Log In",
            feature_baseline_title: "Visualize Your Baseline",
            feature_baseline_desc: "Understand your energy envelope.",
            feature_design_title: "Patient-First Design",
            feature_design_desc: "Built for the chronic illness community.",
            error_exists: "Account already exists. Please Log In.",
            success_pending: "Account created! Please check your email to confirm. After confirming, you can sign in and start uploading your health data from your dashboard.",
            success_confirm: "Check your email for the confirmation link."
        }
    },
    insights: {
        hero: {
            title: "Insights",
            desc: "Deep analysis of your all-time health data to find the hidden patterns in your recovery.",
            all_time: "All-Time Analysis",
            last_updated: "Last updated: {date}"
        },
        empty: {
            title: "No Insights Yet",
            desc: "You need to upload some health data first before we can analyze your symptom patterns.",
            button: "Upload your first CSV"
        },
        gathering: {
            title: "Gathering Biological Data",
            desc: "We need at least 7 days of data to provide statistically significant insights. Keep tracking!",
            progress: "Current Progress: {count} / 7 days"
        },
        patterns: {
            title: "Actionable Patterns",
            safe_zones: "Safe Zones",
            safe_zone_detected: "Safe Zone Detected",
            same_day: "Same Day Effects",
            next_day: "Next Day Effects",
            two_day: "2-Day Delayed Effects",
            insufficient_data: "Keep tracking your symptoms to unlock biological insights.",
            cards: {
                today: "Today",
                plus_1_day: "+1 Day",
                plus_2_days: "+2 Days",
                impact: {
                    direct: "Direct Impact",
                    high_warning: "High Impact Warning",
                    helpful_connection: "Helpful Connection",
                    helpful_pattern: "Helpful Pattern",
                    direct_connection: "Direct Connection",
                    hidden_lag: "Hidden Lag Warning"
                }
            }
        },
        clusters: {
            title: "Biological Clusters",
            heatmap: {
                title: "Symptom Correlation Heatmap",
                lag_zero: "(Lag = 0)",
                desc: "Identifies same-day relationships between symptoms. Green = positive correlation, Red = negative correlation.",
                showing: "Showing {count} of {total} metrics",
                legend: "Legend:",
                strong_negative: "Strong Negative",
                strong_positive: "Strong Positive",
                insufficient: "Insufficient Data",
                correlation: "Correlation",
                strength: {
                    strong: "Strong",
                    moderate: "Moderate",
                    weak: "Weak",
                    very_weak: "Very Weak"
                },
                relation: {
                    positive: "Positive",
                    negative: "Negative",
                    neutral: "Neutral",
                    suffix: "relationship"
                }
            }
        },
        logic: {
            reduces: "Reduces",
            increases: "Increases",
            // Neutral wording
            recommendation_pattern: "{metric} > {value}",
            threshold_desc: "{metric} < {limit} keeps {impact} lower.",

            // Legacy keys (kept just in case, can remove if unused)
            keep: "Keep",
            watch: "Watch",
            above: "above",
            below: "below",
            by: "by ~",
            from: "from",
            to: "to",
        },
        footer: {
            disclaimer: "Statistical insights are for informational purposes only and not medical advice. Always consult your physician."
        },
        pem_analysis: {
            title: "PEM Insights",
            no_clusters: {
                title: "No PEM Clusters Detected",
                desc: "No crashes detected in the selected timeframe.",
                desc_short: "You don't have enough crash data to perform a full Cycle Analysis yet."
            },
            phase1: {
                title: "Phase 1: Buildup",
                cumulative: "Cumulative Load Detected",
                confidence: "Confidence:",
                no_pattern: "No clear trigger pattern",
                no_pattern_desc: "No acute statistical spikes found in your metrics during the 7-day buildup. Your crashes may be caused by a 'slow burn' of cumulative baseline energy expenditure."
            },
            phase2: {
                title: "Phase 2: The Event",
                logged: "Logged: {val}d",
                physiological: "Physiological: {val}d",
                classification: "Impact Classification • Baseline: 90 Days",
                persists: "Bio-Stress Persists +{val}d",
                recovered: "Recovered with logs",
                bio_stress_title: "Biological Stress Duration",
                bio_stress_desc: "Measures how long your body stays in a 'Strained' state (Low HRV, High Heart Rate, or High Symptoms). Temporary 'good' shifts in biomarkers are ignored to ensure accuracy.",
                extended_by: "Extended by:",
                peak_deviation: "Peak Deviation"
            },
            phase3: {
                title: "Phase 3: The Recovery Tail",
                subjective: "Subjective Log: +{val}d",
                biological: "Biological Lag: +{val}d",
                lag: "Biological Lag",
                fast: "Fast Recovery",
                body_lag: "Body lag: +{val}d after feeling better",
                body_reset: "Body resets alongside symptoms",
                hysteresis_title: "Biological Lag (Hysteresis)",
                hysteresis_desc: "Measures how long your biomarkers (HRV, RHR) take to return to baseline **after** you stopped feeling the acute effects of the crash. This is the 'hangover' your body is still processing.",
                slowest: "Slowest",
                days_tail: "Days Tail",
                metric_recovery_time: "This metric takes an average of +{days} days to return to your normal range after a crash starts."
            },
            discovery: {
                increase: "Increase",
                decrease: "Decrease",
                onset: "On onset (Day 0)",
                days_before: "{start}-{end}d before",
                day_before: "{day}d before",
                synergy: "Synergy"
            },
            classifications: {
                acute: "Acute",
                lagged: "Lagged",
                historical: "Historical",
                cumulative: "Cumulative",
                acute_desc: "Trigger happened on the same day the crash started.",
                lagged_desc: "Short delay (1-2 days) between cause and effect.",
                historical_desc: "A single event from 3+ days ago that likely contributed.",
                cumulative_desc: "A sustained buildup of strain over multiple days.",
                onset_desc: "Trigger happened on onset day.",
                pre_onset_desc: "Trigger happened before onset."
            },
            footer: {
                disclaimer: "Analysis based on **{count} crash episodes** using Superposed Epoch Analysis (SEA)."
            }
        }
    },
    exertion_preference: {
        modal: {
            title: "Exertion Preference",
            description: "How does movement and exertion affect your health metrics? This setting adjusts how your MEasure-CFS score is calculated. The MEasure-CFS score is our custom score encompassing your symptoms, vitals, sleep and exertion. A lower score indicates better health.",
            option_desirable: {
                title: "Desirable (Movement is Good)",
                description: "Steps and exertion lower your symptom burden score. Choose this if activity helps or indicates good health."
            },
            option_undesirable: {
                title: "Undesirable (Avoid Exertion)",
                description: "Steps and exertion increase your symptom burden score. Choose this if you suffer from PEM and must limit activity."
            },
            submit: "Save Preference",
            loading: "Saving...",
            success_toast: "Preference saved successfully"
        },
        settings: {
            title: "Exertion Preference",
            description: "Control how steps and exertion factor into your composite score.",
            label: "Exertion Impact"
        }
    },
    donation: {
        button_label: "Support Research",
        dialog_title: "Support ME/CFS Research",

        dialog_desc_pre: "MEasure-CFS is and will always be free. If you'd like thank the creator, you can donate to this PayPal pool. All collected funds are forwarded to the ",
        dialog_desc_post: ".",
        open_paypal: "Donate via PayPal"
    },
    mobile_popup: {
        title: "Great to have you here!",
        description: "Just a heads up: MEasure-CFS is designed for detailed data analysis and works best on a desktop or laptop screen.",
        close: "Got it"
    }
}
