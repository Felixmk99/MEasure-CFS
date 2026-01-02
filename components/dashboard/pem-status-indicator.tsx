'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateCurrentPEMDanger, PEMDangerStatus } from '@/lib/stats/pem-danger-logic'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertTriangle, HelpCircle, Info, Zap, ShieldCheck, HeartPulse, Footprints } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { format, addDays } from 'date-fns'

export function PemStatusIndicator() {
    const [status, setStatus] = useState<PEMDangerStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const { t } = useLanguage()
    const supabase = useMemo(() => createClient(), [])

    const fetchAndCalculate = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(false)
        try {
            const { data: metrics, error: selectError } = await supabase
                .from('health_metrics')
                // Note: 'crash' is intentionally NOT selected as a top-level column. 
                // It is stored inside 'custom_metrics'. Adding it here causes a query error.
                .select('date, hrv, resting_heart_rate, step_count, symptom_score, exertion_score, custom_metrics')
                .eq('user_id', user.id)
                .order('date', { ascending: true })

            if (selectError) throw selectError

            if (metrics) {
                const result = calculateCurrentPEMDanger(metrics)
                setStatus(result)
            }
        } catch (err) {
            console.error('Failed to calculate PEM status:', err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchAndCalculate()

        // Refresh on data updates
        window.addEventListener('health-data-updated', fetchAndCalculate)
        return () => window.removeEventListener('health-data-updated', fetchAndCalculate)
    }, [fetchAndCalculate])

    const config = useMemo(() => ({
        danger: {
            color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50',
            icon: AlertTriangle,
            label: t('navbar.pem_status.danger')
        },
        stable: {
            color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
            icon: ShieldCheck,
            label: t('navbar.pem_status.stable')
        },
        needs_data: {
            color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
            icon: HelpCircle,
            label: t('navbar.pem_status.needs_data')
        }
    }), [t])

    if (loading) return <div className="w-24 h-6 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full" />
    if (error) {
        return (
            <Badge variant="outline" className="gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-500 border-zinc-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-xs">{t('navbar.pem_status.error_fetch')}</span>
            </Badge>
        )
    }

    const current = status ? config[status.status] : config.needs_data
    const StatusIcon = current.icon

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full transition-transform hover:scale-105 active:scale-95"
                    aria-label={`${t('navbar.pem_status.label')}: ${current.label}`}
                >
                    <Badge variant="outline" className={`gap-1.5 px-3 py-1 cursor-pointer transition-colors ${current.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{current.label}</span>
                    </Badge>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden shadow-2xl border-zinc-200/50 dark:border-zinc-800/50">
                <div className={`p-4 border-b ${status?.status === 'danger' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800'}`}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('navbar.pem_status.label')}</span>
                        {status?.status === 'danger' && <Zap className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />}
                    </div>
                    <h3 className={`text-lg font-black ${status?.status === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {current.label}
                    </h3>
                </div>

                <div className="p-4 space-y-4">
                    {status?.status === 'needs_data' ? (
                        <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400 italic">
                            <Info className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                            <p>
                                {status.insufficientDataReason === 'no_history' && t('navbar.pem_status.reason_no_history')}
                                {status.insufficientDataReason === 'no_recent_data' && t('navbar.pem_status.reason_no_recent_data')}
                                {status.insufficientDataReason === 'no_crashes' && t('navbar.pem_status.reason_no_crashes')}
                                {!status.insufficientDataReason && t('navbar.pem_status.needs_data')}
                            </p>
                        </div>
                    ) : status?.status === 'stable' ? (
                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
                                <p>{t('navbar.pem_status.biometrics_stable')}</p>
                            </div>

                            {status.biometrics && status.biometrics.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">
                                        {t('navbar.pem_status.biometrics_title')}
                                    </span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {status.biometrics.map(bio => (
                                            <div key={bio.key} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center gap-2">
                                                    {bio.key === 'hrv' && <HeartPulse className="w-4 h-4 text-rose-500" />}
                                                    {bio.key === 'resting_heart_rate' && <Zap className="w-4 h-4 text-amber-500" />}
                                                    {bio.key === 'step_count' && <Footprints className="w-4 h-4 text-emerald-500" />}
                                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                                        {bio.key === 'hrv' ? t('dashboard.metrics.hrv.short_label') :
                                                            bio.key === 'resting_heart_rate' ? t('dashboard.metrics.resting_heart_rate.label') :
                                                                bio.key === 'step_count' ? t('dashboard.metrics.step_count.label') :
                                                                    bio.label}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`
                                                        text-[10px] font-bold px-2 py-0 h-5 border-transparent
                                                        ${bio.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-600' :
                                                            bio.status === 'strained' ? 'bg-amber-500/10 text-amber-600' :
                                                                'bg-zinc-500/10 text-zinc-600'}
                                                    `}
                                                >
                                                    {bio.status === 'optimal' ? t('navbar.pem_status.status_optimal') :
                                                        bio.status === 'strained' ? t('navbar.pem_status.status_strained') :
                                                            t('navbar.pem_status.status_normal')}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {status?.matchedTriggers && status.matchedTriggers.length > 0 ? (
                                <>
                                    {/* Group 1: Personal Patterns */}
                                    {status.matchedTriggers.some(tr => tr.isPersonal) && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">
                                                {t('navbar.pem_status.matches_personal')}
                                            </p>
                                            <div className="space-y-1.5">
                                                {status.matchedTriggers.filter(tr => tr.isPersonal).map((tr) => (
                                                    <div key={`${tr.metric}-${tr.type}`} className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/20">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-bold text-red-700 dark:text-red-400 capitalize">{tr.metric.replaceAll('_', ' ')}</span>
                                                            <div className="text-[10px] font-bold text-red-600/70 dark:text-red-400/70 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded uppercase">
                                                                {tr.leadDaysStart > 0
                                                                    ? t('navbar.pem_status.prediction').replace('{day}', format(addDays(new Date(), tr.leadDaysStart), 'eee'))
                                                                    : t('navbar.pem_status.cumulative_load')}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">
                                                            {tr.description || t('navbar.pem_status.matches')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Group 2: General Trends */}
                                    {status.matchedTriggers.some(tr => !tr.isPersonal) && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">
                                                {t('navbar.pem_status.matches_general')}
                                            </p>
                                            <div className="space-y-1.5">
                                                {status.matchedTriggers.filter(tr => !tr.isPersonal).map((tr) => (
                                                    <div key={`${tr.metric}-${tr.type}`} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">{tr.metric.replaceAll('_', ' ')}</span>
                                                            <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded uppercase">
                                                                {t('navbar.pem_status.cumulative_load')}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight italic">
                                                            {tr.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-snug">
                                        {t('navbar.pem_status.danger_fallback')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
