export type Locale = 'en' | 'de'

export interface Dictionary {
    common: {
        loading: string
        error: string
        save: string
        cancel: string
        delete: string
        confirm: string
        success: string
        custom: string
        unknown: string
        metric_labels: {
            [key: string]: string
        }
    }
    navbar: {
        dashboard: string
        insights: string
        experiments: string
        data: string
        upload_data: string
        settings: string
        logout: string
        login: string
        signup: string
        profile: string
        welcome: string
        missing_steps_hint: string
        missing_steps_tooltip: string
        pem_status: {
            label: string
            needs_data: string
            stable: string
            danger: string
            reason_no_history: string
            reason_no_recent_data: string
            reason_no_crashes: string
            prediction: string
            matches: string
            matches_personal: string
            matches_general: string
            explanation: string
            matches_personal_desc: string
            matches_general_desc: string
            exertion: string
            activity: string
            cumulative_load: string
            danger_fallback: string
            stable_message: string
            error_fetch: string
            biometrics_title: string
            biometrics_stable: string
            status_optimal: string
            status_normal: string
            status_strained: string
            status_unknown: string
            no_personal_matches: string
            no_general_matches: string
        }
    }
    footer: {
        built_by: string
        contact: string
        github: string // Added for footer icon aria-label
    }
    landing: {
        hero: {
            badge: string
            title_main: string
            title_highlight: string
            subtitle: string
            dropzone: {
                title: string
                subtitle: string
                button_account: string
                button_select: string
            }
            features: {
                secure: string
                instant: string
            }
            transform_title: string
            predictive_insights: string
            drop_title: string
            drop_title_generic: string
            drop_desc: string
            create_account_hint: string
        }
        pillars: {
            phase: { title: string; desc: string }
            meds: { title: string; desc: string }
            recovery: { title: string; desc: string }
        }
        steps: {
            prefix: string
            label_01: string
            label_02: string
            label_03: string
            "01": { title: string; desc: string }
            "02": { title: string; desc: string }
            "03": { title: string; desc: string }
            metrics: {
                hrv: string
                rhr: string
                sleep: string
                adjusted_score: string
            }
            analysis: {
                buildup: string
                event: string
                recovery: string
            }
            status: {
                crash_risk: string
                high: string
                recovery_status: string
                impact: string
            }
        }
        privacy_badge: {
            title: string
            desc: string
        }
        cta: {
            title: string
            desc: string
            button_signup: string
            button_demo: string
        }
        why: {
            title: string
            subtitle: string
            cards: {
                privacy: {
                    title: string
                    desc: string
                }
                baseline: {
                    title: string
                    desc: string
                }
                patients: {
                    title: string
                    desc: string
                }
            }
        }
        teaser: {
            title: string
            subtitle: string
            list: {
                pem: string
                meds: string
                symptom: string
                trends: string
            }
            cta: string
            card_insight: string
        }
        footer: {
            copyright: string
        }
    }
    dashboard: {
        title: string
        subtitle_prefix: string
        subtitle_suffix: string
        trend_mode: string
        compare_mode: string
        pem_mode: string
        select_placeholder: string
        metrics_dropdown: string
        metrics_selected: string
        pem_insights_title: string
        edit_log: {
            title: string
            description: string
            vitals: string
            hrv: string
            rhr: string
            steps: string
            exertion_title: string
            trackers_title: string
            symptoms_title: string
            button_cancel: string
            button_save: string
            status_saving: string
            error_update: string
            error_save: string
        }
        charts: {
            synced: string
            encrypted: string
        }
        status: {
            stable: string
            improving: string
            declining: string
            worsening: string
            insufficient_data: string
        }
        time_ranges: {
            d7: string
            d30: string
            m3: string
            m6: string
            y1: string
            all: string
        }
        cards: {
            average: string
            average_sub: string
            latest: string
            latest_sub: string
            rest_days: string
            rest_days_sub: string
            days: string
        }
        metrics: {
            composite_score: {
                label: string
                description: string
                better: string
            }
            adjusted_score: {
                label: string
                description: string
                better: string
            }
            hrv: {
                label: string
                short_label: string
                description: string
                better: string
            }
            resting_heart_rate: {
                label: string
                description: string
                better: string
            }
            step_count: {
                label: string
                description: string
                better: string
            }
            exertion_score: {
                label: string
                description: string
                better: string
            }
            trend: string
            about: string
            crashes: {
                label: string
                description: string
                better: string
            }
            sleep: {
                label: string
                description: string
                better: string
            }
            palpitations: {
                label: string
                description: string
                better: string
            }
            stability_score: {
                label: string
                description: string
                better: string
            }
            muscle_aches: {
                label: string
                description: string
                better: string
            }
            energy: {
                label: string
                description: string
                better: string
            }
        }
        crash_mode: string
        pem_days: string
    }
    experiments: {
        page_title: string
        intro: {
            title: string
            welcome: string
            overlap_title: string
            overlap_desc: string
            zscore_title: string
            zscore_desc: string
        }
        actions: {
            start_new: string
            log_new: string
            edit: string
            delete: string
            save: string
            update: string
            cancel: string
            confirm_delete: string
        }
        form: {
            name: string
            dosage: string
            category: string
            start_date: string
            end_date: string
            name_placeholder: string
            dosage_placeholder: string
            categories: {
                lifestyle: string
                medication: string
                supplement: string
                other: string
            }
        }
        active: {
            title: string
            day: string
            confidence: string
            confidence_hint: string
            confidence_desc: string
            impact_title: string
            no_active_title: string
            no_active_desc: string
            started_at: string
        }
        history: {
            title: string
            independent_outcome: string
            outcome_positive: string
            outcome_negative: string
            outcome_neutral: string
            influence: string
            no_history: string
        }
        impact: {
            insufficient: string
            no_significant: string
            high_confidence_desc: string
            trend_desc: string
            not_significant_desc: string
            significance: {
                significant: string
                trend: string
                positive: string
                negative: string
                neutral: string
            }
            high_confidence: string
            trend: string
            statistical_profile: string
            p_value: string
            z_score_label: string
            effect_size_label: string
            deg_freedom: string
            effect_sizes: {
                small: string
                medium: string
                large: string
            }
        }
    }
    upload: {
        title: string
        subtitle_prefix: string
        subtitle_highlight: string
        subtitle_manage: string
        description_empty: string
        description_data: string
        private_badge: string
        trust_badge: string
        tabs: {
            visible: string
            bearable: string
            apple: string
            google: string
            samsung: string
            csv: string
        }
        dropzone: {
            idle: string
            active: string
            success: string
            error: string
            uploading: string
            parsing: string
            button_upload: string
            button_select: string
            button_retry: string
            title_visible: string
            title_apple: string
            title_google: string
            title_samsung: string
            title_bearable: string
            title_csv: string
            hint_visible: string
            hint_apple: string
            hint_google: string
            hint_samsung: string
            hint_bearable: string
            hint_csv: string
            file_type_csv: string
            file_type_xml: string
        }
        messages: {
            invalid_file: string
            file_too_large: string
            parsing_file: string
            processing_measurements: string
            login_required: string
            uploading_days: string
            checking_existing: string
            no_new_data: string
            adding_days: string
            processed_progress: string
            parse_error: string
            no_steps_found: string
            no_matching_dates: string
            found_matching_days: string
            success_steps: string
            requires_data: string
            missing_columns_error: string
            delete_confirm: string
            delete_entry_confirm: string
            provider_coming_soon: string
            provider_built_hint: string
            hide_import: string
        }
        data_log: {
            title: string
            delete_all: string
            table: {
                date: string
                rhr: string
                hrv: string
                steps: string
                symptoms: string
                action: string
                empty: string
                recent_hint: string
            }
        }
    }
    settings: {
        title: string
        subtitle: string
        sidebar: {
            profile: string
            security: string
            preferences: string
            data_export: string
            soon: string
        }
        profile: {
            title: string
            description: string
            first_name: string
            last_name: string
            button_save: string
            button_saving: string
        }
        personal: {
            title: string
            description: string
            email: string
        }
        symptom_integration: {
            title: string
            description: string
            provider_label: string
            placeholder: string
            hint: string
            visible: string
            bearable: string
        }
        step_integration: {
            title: string
            description: string
            provider_label: string
            placeholder: string
            hint: string
            apple: string
            google: string
            samsung: string
            whoop: string
            garmin: string
            csv: string
            soon: string
        }
        delete_account: {
            title: string
            description: string
            warning_title: string
            warning_access: string
            warning_data: string
            warning_recovery: string
            confirm_label_before: string
            confirm_label_after: string
            confirm_keyword: string
            button_delete: string
            button_deleting: string
            success_toast: string
            error_toast: string
            error_fallback: string
            signout_failed: string
        }
    }
    legal: {
        impressum: string
        privacy: string
        terms: string
        agree_terms_privacy: string
        agree_health_data: string
        medical_disclaimer: string
        medical_disclaimer_text: string
        not_medical_product: string
        copyright: string
        info_ddg: string
        operator: string
        country: string
        email: string
        disclaimer_title: string
        disclaimer_text: string
        privacy_page: {
            intro: string
            health_data_title: string
            health_data_text: string
            s1_title: string
            s1_operator: string
            s1_how: string
            s1_purpose: string
            s2_title: string
            s2_text: string
            s3_title: string
            s3_intro: string
            s3_rights: string[]
            s3_delete_hint: string
            last_updated: string
        }
        terms_page: {
            not_medical_product_long: string
            s1_title: string
            s1_desc: string
            s2_title: string
            s2_desc: string
            s3_title: string
            s3_desc: string
            s4_title: string
            s4_desc: string
            last_updated: string
        }
    }
    authCodeError: {
        title: string
        description: string
        button_login: string
        button_home: string
        help_title: string
        help_text: string
    }
    auth: {
        common: {
            email: string
            password: string
            placeholder_email: string
            placeholder_password: string
            privacy_guaranteed: string
            privacy_quote: string
        }
        login: {
            title_start: string
            title_highlight: string
            subtitle: string
            forgot_password: string
            button_signin: string
            no_account: string
            button_create: string
            error_invalid: string
            testimonial: {
                quote: string
            }
        }
        signup: {
            title_start: string
            title_highlight: string
            first_name: string
            last_name: string
            placeholder_first_name: string
            placeholder_last_name: string
            password_hint: string
            button_create: string
            already_have_account: string
            button_login: string
            feature_baseline_title: string
            feature_baseline_desc: string
            feature_design_title: string
            feature_design_desc: string
            error_exists: string
            success_pending: string
            success_confirm: string
        }
    }
    insights: {
        hero: {
            title: string
            desc: string
            all_time: string
            last_updated: string
        }
        empty: {
            title: string
            desc: string
            button: string
        }
        gathering: {
            title: string
            desc: string
            progress: string
        }
        patterns: {
            title: string
            safe_zones: string
            safe_zone_detected: string
            same_day: string
            next_day: string
            two_day: string
            insufficient_data: string
            cards: {
                today: string
                plus_1_day: string
                plus_2_days: string
                impact: {
                    direct: string
                    high_warning: string
                    helpful_connection: string
                    helpful_pattern: string
                    direct_connection: string
                    hidden_lag: string
                }
            }
        }
        clusters: {
            title: string
            heatmap: {
                title: string
                lag_zero: string
                desc: string
                showing: string
                legend: string
                strong_negative: string
                strong_positive: string
                insufficient: string
                correlation: string
                strength: {
                    strong: string
                    moderate: string
                    weak: string
                    very_weak: string
                }
                relation: {
                    positive: string
                    negative: string
                    neutral: string
                    suffix: string
                }
            }
        }
        logic: {
            reduces: string
            increases: string
            recommendation_pattern: string
            keep: string
            watch: string
            above: string
            below: string
            by: string
            from: string
            to: string
            threshold_desc: string
        }
        footer: {
            disclaimer: string
        }
        pem_analysis: {
            title: string
            no_clusters: {
                title: string
                desc: string
                desc_short: string
            }
            phase1: {
                title: string
                cumulative: string
                confidence: string
                no_pattern: string
                no_pattern_desc: string
            }
            phase2: {
                title: string
                logged: string
                physiological: string
                classification: string
                persists: string
                recovered: string
                bio_stress_title: string
                bio_stress_desc: string
                extended_by: string
                peak_deviation: string
            }
            phase3: {
                title: string
                subjective: string
                biological: string
                lag: string
                fast: string
                body_lag: string
                body_reset: string
                hysteresis_title: string
                hysteresis_desc: string
                slowest: string
                days_tail: string
                metric_recovery_time: string
            }
            discovery: {
                increase: string
                decrease: string
                onset: string
                days_before: string
                day_before: string
                synergy: string
            }
            classifications: {
                acute: string
                lagged: string
                historical: string
                cumulative: string
                acute_desc: string
                lagged_desc: string
                historical_desc: string
                cumulative_desc: string
                onset_desc: string
                pre_onset_desc: string
            }
            footer: {
                disclaimer: string
            }
        }
    }
    exertion_preference: {
        modal: {
            title: string
            description: string
            option_desirable: {
                title: string
                description: string
            }
            option_undesirable: {
                title: string
                description: string
            }
            submit: string
            loading: string
            success_toast: string
        }
        settings: {
            title: string
            description: string
            label: string
        }
    }
    donation: {
        button_label: string
        dialog_title: string
        dialog_desc_pre: string
        dialog_desc_post: string
        open_paypal: string
    }
    mobile_popup: {
        title: string
        description: string
        close: string
    }
}


