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

interface EditDataDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entry: any
    onSave: (id: string, updatedData: any) => Promise<void>
}

export function EditDataDialog({ open, onOpenChange, entry, onSave }: EditDataDialogProps) {
    const [formData, setFormData] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)

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
        setFormData((prev: any) => ({
            ...prev,
            [field]: value === '' ? null : Number(value)
        }))
    }

    const handleCustomChange = (key: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            custom_metrics: {
                ...prev.custom_metrics,
                [key]: value === '' ? null : Number(value)
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await onSave(entry.id, formData)
            onOpenChange(false)
        } catch (error: any) {
            console.error("Failed to update entry:", error)
            alert(`Failed to save changes: ${error.message || 'Unknown error'}`)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Health Log</DialogTitle>
                    <DialogDescription>
                        Visualizing data for {format(parseISO(entry.date), 'PPPP')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[60vh] overflow-y-auto px-1 py-4 space-y-8">
                        {/* 1. Core Vitals */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Vitals
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hrv">HRV (ms)</Label>
                                    <Input
                                        id="hrv"
                                        type="number"
                                        value={formData.hrv ?? ''}
                                        onChange={(e) => handleBaseChange('hrv', e.target.value)}
                                        placeholder="--"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rhr">Resting HR (bpm)</Label>
                                    <Input
                                        id="rhr"
                                        type="number"
                                        value={formData.resting_heart_rate ?? ''}
                                        onChange={(e) => handleBaseChange('resting_heart_rate', e.target.value)}
                                        placeholder="--"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="steps">Steps</Label>
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
                        {['Cognitive', 'Emotional', 'Physical', 'Social'].some(k => formData.custom_metrics[k] !== undefined) && (
                            <div className="space-y-4 pt-2 border-t border-dashed">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Daily Exertion (0-4)
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Cognitive', 'Emotional', 'Physical', 'Social'].map(key => (
                                        formData.custom_metrics[key] !== undefined && (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={`exertion-${key}`}>{key}</Label>
                                                <Input
                                                    id={`exertion-${key}`}
                                                    type="number"
                                                    min="0"
                                                    max="4"
                                                    value={formData.custom_metrics[key] ?? ''}
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
                        {['Sleep', 'Coffee', 'Crash', 'Stability Score'].some(k => formData.custom_metrics[k] !== undefined) && (
                            <div className="space-y-4 pt-2 border-t border-dashed">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Daily Trackers
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Sleep', 'Coffee', 'Crash', 'Stability Score'].map(key => (
                                        formData.custom_metrics[key] !== undefined && (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={`special-${key}`}>{key}</Label>
                                                <Input
                                                    id={`special-${key}`}
                                                    type="number"
                                                    step={key === 'Coffee' ? '0.5' : '1'}
                                                    value={formData.custom_metrics[key] ?? ''}
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
                        {Object.keys(formData.custom_metrics).filter(k =>
                            !['Cognitive', 'Emotional', 'Physical', 'Social', 'Sleep', 'Coffee', 'Crash', 'Stability Score', 'composite_score'].includes(k)
                        ).length > 0 && (
                                <div className="space-y-4 pt-2 border-t border-dashed">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        Symptoms
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.keys(formData.custom_metrics)
                                            .filter(k => !['Cognitive', 'Emotional', 'Physical', 'Social', 'Sleep', 'Coffee', 'Crash', 'Stability Score', 'composite_score'].includes(k))
                                            .map((key) => (
                                                <div key={key} className="space-y-2">
                                                    <Label htmlFor={`custom-${key}`} className="capitalize">
                                                        {key.replace(/_/g, ' ')}
                                                    </Label>
                                                    <Input
                                                        id={`custom-${key}`}
                                                        type="number"
                                                        value={formData.custom_metrics[key] ?? ''}
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
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
