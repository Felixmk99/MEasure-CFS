'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, parseISO } from "date-fns"
import { calculateExertionScore, calculateSymptomScore } from "@/lib/scoring/logic";
import { useLanguage } from "@/components/providers/language-provider"
import { useCallback } from 'react'
import { ScorableEntry } from '@/lib/scoring/composite-score'

interface EditableEntry extends ScorableEntry {
    id: string
}

interface EditDataDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entry: EditableEntry | null
    onSave: (id: string, updatedData: Partial<ScorableEntry>) => Promise<void>
}

export function EditDataDialog({ open, onOpenChange, entry, onSave }: EditDataDialogProps) {
    const { t } = useLanguage()
    const [formData, setFormData] = useState<Partial<ScorableEntry> | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Helper for Metric Translations
    const tMetric = useCallback((key: string) => {
        const strictKey = key.toLowerCase();
        const dictionaryKey = `common.metric_labels.${strictKey}` as string;
        const translated = t(dictionaryKey);
        if (translated !== dictionaryKey && translated) return translated;

        const snakeKey = strictKey.replace(/ /g, '_');
        const snakeDictKey = `common.metric_labels.${snakeKey}` as string;
        const snakeTranslated = t(snakeDictKey);
        if (snakeTranslated !== snakeDictKey && snakeTranslated) return snakeTranslated;

        return strictKey.replaceAll('_', ' ');
    }, [t])

    useEffect(() => {
        if (entry) {
            setFormData({
                hrv: entry.hrv ?? null,
                resting_heart_rate: entry.resting_heart_rate ?? null,
                step_count: entry.step_count ?? null,
                exertion_score: entry.exertion_score ?? null,
                symptom_score: entry.symptom_score ?? null,
                custom_metrics: { ...(entry.custom_metrics || {}) }
            })
        }
    }, [entry])

    if (!entry || !formData) return null

    const handleBaseChange = (field: string, value: string) => {
        setFormData((prev) => {
            if (!prev) return null
            return {
                ...prev,
                [field]: value === '' ? null : Number(value)
            }
        })
    }

    const handleCustomChange = (key: string, value: string) => {
        const numVal = value === '' ? null : Number(value)

        setFormData((prev) => {
            if (!prev) return null

            const existingMetrics = (prev.custom_metrics as Record<string, number> || {})
            const newCustom = { ...existingMetrics }

            // Only add the key if numVal is a valid number
            if (numVal !== null && !isNaN(numVal)) {
                newCustom[key] = numVal
            } else {
                delete newCustom[key]
            }

            // Recalculate Scores using Single Source of Truth
            // This guarantees that edits match the dashboard logic exactly.
            const newExertion = calculateExertionScore(newCustom)
            const newSymptom = calculateSymptomScore(newCustom)

            return {
                ...prev,
                custom_metrics: newCustom,
                exertion_score: newExertion,
                symptom_score: newSymptom
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await onSave(entry.id, formData)
            onOpenChange(false)
        } catch (error) {
            console.error(t('dashboard.edit_log.error_update'), error)
            const message = error instanceof Error ? error.message : 'Unknown error'
            alert(t('dashboard.edit_log.error_save', { message }))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('dashboard.edit_log.title')}</DialogTitle>
                    <DialogDescription>
                        {t('dashboard.edit_log.description', { date: format(parseISO(entry.date), 'PPPP') })}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[60vh] overflow-y-auto px-1 py-4 space-y-8">
                        {/* 1. Core Vitals */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {t('dashboard.edit_log.vitals')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hrv">{t('dashboard.edit_log.hrv')}</Label>
                                    <Input
                                        id="hrv"
                                        type="number"
                                        value={formData.hrv ?? ''}
                                        onChange={(e) => handleBaseChange('hrv', e.target.value)}
                                        placeholder="--"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rhr">{t('dashboard.edit_log.rhr')}</Label>
                                    <Input
                                        id="rhr"
                                        type="number"
                                        value={formData.resting_heart_rate ?? ''}
                                        onChange={(e) => handleBaseChange('resting_heart_rate', e.target.value)}
                                        placeholder="--"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="steps">{t('dashboard.edit_log.steps')}</Label>
                                    <Input
                                        id="steps"
                                        type="number"
                                        value={formData.step_count ?? ''}
                                        onChange={(e) => handleBaseChange('step_count', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Exertion */}
                        {['Cognitive', 'Emotional', 'Physical', 'Social'].some(k => formData.custom_metrics?.[k] !== undefined) && (
                            <div className="space-y-4 pt-2 border-t border-dashed">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {t('dashboard.edit_log.exertion_title')}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Cognitive', 'Emotional', 'Physical', 'Social'].map(key => (
                                        formData.custom_metrics?.[key] !== undefined && (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={`exertion-${key}`}>{tMetric(key)}</Label>
                                                <Input
                                                    id={`exertion-${key}`}
                                                    type="number"
                                                    min="0"
                                                    max="4"
                                                    value={(formData.custom_metrics?.[key] as number) ?? ''}
                                                    onChange={(e) => handleCustomChange(key, e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Special Trackers */}
                        {['Sleep', 'Coffee', 'Crash', 'Stability Score'].some(k => formData.custom_metrics?.[k] !== undefined) && (
                            <div className="space-y-4 pt-2 border-t border-dashed">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    {t('dashboard.edit_log.trackers_title')}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Sleep', 'Coffee', 'Crash', 'Stability Score'].map(key => (
                                        formData.custom_metrics?.[key] !== undefined && (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={`special-${key}`}>{tMetric(key)}</Label>
                                                <Input
                                                    id={`special-${key}`}
                                                    type="number"
                                                    step={key === 'Coffee' ? '0.5' : '1'}
                                                    value={(formData.custom_metrics?.[key] as number) ?? ''}
                                                    onChange={(e) => handleCustomChange(key, e.target.value)}
                                                    placeholder="--"
                                                />
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Symptoms (All other custom metrics) */}
                        {Object.keys(formData.custom_metrics || {}).filter(k =>
                            !['Cognitive', 'Emotional', 'Physical', 'Social', 'Sleep', 'Coffee', 'Crash', 'Stability Score', 'composite_score'].includes(k)
                        ).length > 0 && (
                                <div className="space-y-4 pt-2 border-t border-dashed">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        {t('dashboard.edit_log.symptoms_title')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.keys(formData.custom_metrics || {})
                                            .filter(k => !['Cognitive', 'Emotional', 'Physical', 'Social', 'Sleep', 'Coffee', 'Crash', 'Stability Score', 'composite_score'].includes(k))
                                            .map((key) => (
                                                <div key={key} className="space-y-2">
                                                    <Label htmlFor={`custom-${key}`} className="capitalize">
                                                        {tMetric(key)}
                                                    </Label>
                                                    <Input
                                                        id={`custom-${key}`}
                                                        type="number"
                                                        value={(formData.custom_metrics?.[key] as number) ?? ''}
                                                        onChange={(e) => handleCustomChange(key, e.target.value)}
                                                        placeholder="--"
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                    </div>

                    <DialogFooter className="pt-4 border-t mt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('dashboard.edit_log.button_cancel')}
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? t('dashboard.edit_log.status_saving') : t('dashboard.edit_log.button_save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
