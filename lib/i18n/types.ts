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
    }
    navbar: {
        dashboard: string
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
    }
    footer: {
        built_by: string
        contact: string
    }
    dashboard: {
        title: string
        subtitle_prefix: string
        subtitle_suffix: string
        trend_mode: string
        metrics_dropdown: string
        metrics_selected: string
        charts: {
            synced: string
            encrypted: string
        }
        status: {
            stable: string
            improving: string
            declining: string
            worsening: string
        }
        time_ranges: {
            d7: string
            d30: string
            m3: string
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
            impact_title: string
            no_active_title: string
            no_active_desc: string
        }
        history: {
            title: string
            independent_outcome: string
            influence: string
            no_history: string
        }
        impact: {
            insufficient: string
            significance: {
                positive: string
                negative: string
                neutral: string
                likely_positive: string
                likely_negative: string
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
        tabs: {
            visible: string
            apple: string
        }
        dropzone: {
            idle: string
            active: string
            success: string
            error: string
            uploading: string
            button_upload: string
            button_select: string
            button_retry: string
        }
        data_log: {
            title: string
            delete_all: string
            delete_confirm: string
            table: {
                date: string
                hrv: string
                steps: string
                action: string
                empty: string
            }
        }
    }
}
