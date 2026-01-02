'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateCurrentPEMDanger, PEMDangerStatus } from '@/lib/stats/pem-danger-logic'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertTriangle, CheckCircle2, HelpCircle, Info, Zap } from 'lucide-react'
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
            color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50',
            icon: CheckCircle2,
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
                <button className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full transition-transform hover:scale-105 active:scale-95">
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
                    ) : (
                        <>
                            {status?.matchedTriggers && status.matchedTriggers.length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">
                                        {t('navbar.pem_status.matches')}
                                    </p>
                                    <div className="space-y-2">
                                        {status.matchedTriggers.map((tr) => (
                                            <div key={`${tr.metric}-${tr.type}`} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">{tr.metric.replaceAll('_', ' ')}</span>
                                                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                        <Zap className="w-2.5 h-2.5" />
                                                        {tr.type}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-medium text-zinc-400 uppercase">
                                                        {tr.leadDaysStart > 0
                                                            ? t('navbar.pem_status.prediction').replace('{day}', format(addDays(new Date(), tr.leadDaysStart), 'eee'))
                                                            : t('navbar.pem_status.cumulative_load')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500">
                                    {t('navbar.pem_status.stable_message')}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
