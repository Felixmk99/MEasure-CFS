'use client'

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { format, differenceInDays, parseISO, isAfter, isBefore } from "date-fns"
import { Plus, Trash, Pill, Activity, Moon, ArrowUpRight, ArrowDownRight, Minus, Pencil, Beaker, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
// import { Database } from "@/types/database.types"
import { enhanceDataWithScore } from "@/lib/scoring/composite-score"
import { analyzeExperiments, Experiment, MetricDay } from "@/lib/statistics/experiment-analysis"
import { ExperimentImpactResults, getFriendlyName } from "@/components/experiments/experiment-impact"
import { useLanguage } from "@/components/providers/language-provider"

export default function ExperimentsClient({ initialExperiments, history }: { initialExperiments: Experiment[], history: MetricDay[] }) {
    const { t } = useLanguage()
    const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingExp, setEditingExp] = useState<Experiment | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    // Form State
    type ExperimentCategory = 'lifestyle' | 'medication' | 'supplement' | 'other'

    interface ExperimentFormData {
        name: string
        dosage: string
        category: ExperimentCategory
        start_date: string
        end_date: string
    }

    const initialFormState: ExperimentFormData = {
        name: '',
        dosage: '',
        category: 'lifestyle',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: ''
    }

    const [formData, setFormData] = useState<ExperimentFormData>(initialFormState)

    const isValidCategory = (cat: string): cat is ExperimentCategory =>
        ['lifestyle', 'medication', 'supplement', 'other'].includes(cat)

    // Enhance history with Centralized Composite Score
    const enhancedHistory = useMemo(() => {
        return enhanceDataWithScore(history)
    }, [history])

    // Calculate Baseline Stats for Z-Scores
    const baselineStats = useMemo(() => {
        const stats: Record<string, { mean: number, std: number }> = {}
        const excludedKeys = ['date', 'id', 'user_id', 'created_at', 'custom_metrics', 'normalized_hrv', 'normalized_rhr', 'normalized_steps'];

        // Use enhancedHistory to include composite_score in stats analysis
        const dataToAnalyze = enhancedHistory

        // Find all unique numeric keys across history
        const allKeys = new Set<string>();
        dataToAnalyze.forEach(d => {
            // 1. Top-Level Keys
            Object.keys(d).forEach(k => {
                if (!excludedKeys.includes(k) && typeof d[k] === 'number') {
                    allKeys.add(k);
                }
            });
            // 2. Custom Metrics Keys
            if (d.custom_metrics && typeof d.custom_metrics === 'object') {
                Object.keys(d.custom_metrics).forEach(k => {
                    if (!excludedKeys.includes(k) && typeof d.custom_metrics[k] === 'number') {
                        allKeys.add(k);
                    }
                });
            }
        });

        allKeys.forEach(m => {
            // Retrieve value from top-level OR custom_metrics
            const values = dataToAnalyze
                .map(d => d[m] ?? d.custom_metrics?.[m])
                .filter(v => typeof v === 'number') as number[]

            if (values.length > 0) {
                const mean = values.reduce((a, b) => a + b, 0) / values.length
                const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length) || 1
                stats[m] = { mean, std }
            }
        });

        return stats
    }, [enhancedHistory])

    // Run Analysis
    const analysisResults = useMemo(() => {
        return analyzeExperiments(experiments, enhancedHistory, baselineStats)
    }, [experiments, enhancedHistory, baselineStats])

    const activeExperiments = experiments.filter(e => !e.end_date || isAfter(parseISO(e.end_date), new Date()))
    const pastExperiments = experiments.filter(e => e.end_date && isBefore(parseISO(e.end_date), new Date()))

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            if (editingExp) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data, error } = await (supabase.from('experiments') as any).update({
                    name: formData.name,
                    dosage: formData.dosage,
                    category: formData.category,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any).eq('id', editingExp.id).select().single()

                if (error) throw error
                if (data) setExperiments(experiments.map(e => e.id === data.id ? (data as Experiment) : e))
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data, error } = await (supabase.from('experiments') as any).insert({
                    user_id: user.id,
                    name: formData.name,
                    dosage: formData.dosage,
                    category: formData.category,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any).select().single()

                if (error) throw error
                if (data) setExperiments([data as Experiment, ...experiments])
            }

            setIsDialogOpen(false)
            setEditingExp(null)
            setEditingExp(null)
            setFormData(initialFormState)
            router.refresh()
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    const openEdit = (exp: Experiment) => {
        setEditingExp(exp)
        setFormData({
            name: exp.name,
            dosage: exp.dosage || '',
            category: (exp.category && isValidCategory(exp.category) ? exp.category : 'lifestyle'),
            start_date: exp.start_date,
            end_date: exp.end_date || ''
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(t('experiments.actions.confirm_delete'))
        if (!confirmed) return

        const { error } = await supabase.from('experiments').delete().eq('id', id)
        if (!error) {
            setExperiments(experiments.filter(e => e.id !== id))
            router.refresh()
        }
    }

    const getIcon = (category: string) => {
        switch (category) {
            case 'medication': return <Pill className="w-5 h-5 text-[#3B82F6]" />
            case 'supplement': return <Beaker className="w-5 h-5 text-emerald-500" />
            case 'lifestyle': return <Moon className="w-5 h-5 text-indigo-500" />
            default: return <Activity className="w-5 h-5 text-blue-500" />
        }
    }

    return (
        <div className="w-full flex flex-col items-center space-y-12">

            {experiments.length === 0 && (
                <div className="max-w-2xl text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-[#60A5FA] uppercase tracking-widest">{t('experiments.intro.title')}</p>
                        <h2 className="text-4xl font-serif text-foreground">{t('experiments.page_title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('experiments.intro.welcome')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold uppercase mb-1 flex items-center gap-2">
                                <Activity className="w-3 h-3 text-[#3B82F6]" /> {t('experiments.intro.overlap_title')}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{t('experiments.intro.overlap_desc')}</p>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold uppercase mb-1 flex items-center gap-2">
                                <Target className="w-3 h-3 text-[#F59E0B]" /> {t('experiments.intro.zscore_title')}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{t('experiments.intro.zscore_desc')}</p>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-center">
                        <ArrowDownRight className="w-6 h-6 text-zinc-300 animate-bounce" />
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="w-full max-w-7xl mx-auto flex justify-end px-4 sm:px-8">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) {
                        setEditingExp(null)
                        setFormData(initialFormState)
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all">
                            <Plus className="w-5 h-5 mr-2" /> {t('experiments.actions.start_new')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingExp ? t('experiments.actions.edit') : t('experiments.actions.log_new')}</DialogTitle>
                            <DialogDescription>{t('experiments.active.no_active_desc')}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('experiments.form.name')}</Label>
                                    <Input
                                        placeholder="e.g. Nattokinase"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('experiments.form.dosage')}</Label>
                                    <Input
                                        placeholder="e.g. 2000 FU"
                                        value={formData.dosage}
                                        onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('experiments.form.category')}</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v as ExperimentCategory })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lifestyle">{t('experiments.form.categories.lifestyle')}</SelectItem>
                                        <SelectItem value="medication">{t('experiments.form.categories.medication')}</SelectItem>
                                        <SelectItem value="supplement">{t('experiments.form.categories.supplement')}</SelectItem>
                                        <SelectItem value="other">{t('experiments.form.categories.other')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('experiments.form.start_date')}</Label>
                                    <Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('experiments.form.end_date')}</Label>
                                    <Input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('experiments.actions.cancel')}</Button>
                            <Button onClick={handleSave} disabled={isLoading || !formData.name}>
                                {isLoading ? t('common.loading') : editingExp ? t('experiments.actions.update') : t('experiments.actions.save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Currently Active */}
            <div className="space-y-6 w-full max-w-7xl mx-auto">
                <div className="flex justify-center items-center border-b pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('experiments.active.title')}</h3>
                </div>

                {activeExperiments.length > 0 ? (
                    <div className="grid gap-6">
                        {activeExperiments.map(exp => {
                            const daysActive = differenceInDays(new Date(), parseISO(exp.start_date))
                            const analysis = analysisResults.find(r => r.experimentId === exp.id)

                            // Calculate Overall Model Confidence:
                            // We use the MAX confidence of core metrics to show if any signal was detected.
                            const coreMetrics = ['hrv', 'resting_heart_rate', 'symptom_score', 'composite_score'];
                            const coreImpacts = analysis?.impacts.filter(i => coreMetrics.includes(i.metric)) || [];
                            const overallConfidence = analysis?.impacts.length
                                ? Math.max(...(coreImpacts.length ? coreImpacts : analysis.impacts).map(i => i.confidence))
                                : 0;

                            return (
                                <Card key={exp.id} className="bg-zinc-50/50 dark:bg-zinc-900/30 border-0 shadow-sm overflow-hidden relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(exp)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(exp.id)}>
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <CardContent className="p-4 sm:p-8">
                                        <div className="flex flex-col gap-6">
                                            {/* Header Section */}
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-[#60A5FA]/10 text-[#3B82F6] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wide whitespace-nowrap">
                                                            <div className="w-1.5 h-1.5 bg-[#60A5FA] rounded-full animate-pulse shrink-0" />
                                                            {t('experiments.active.day')} {daysActive}
                                                        </div>
                                                        {exp.dosage && (
                                                            <Badge variant="outline" className="text-[10px] font-bold border-zinc-200 uppercase">{exp.dosage}</Badge>
                                                        )}
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <div className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                                {getIcon(exp.category || 'other')}
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase">{t(`experiments.form.categories.${exp.category || 'other'}`)}</span>
                                                        </div>
                                                    </div>
                                                    <h2 className="text-2xl sm:text-3xl font-serif text-foreground break-words">{exp.name}</h2>
                                                    <p className="text-muted-foreground text-[10px] uppercase tracking-tight font-bold">
                                                        Started {format(parseISO(exp.start_date), 'MMMM d, yyyy')}
                                                    </p>
                                                </div>

                                                {/* Compact Confidence Meter */}
                                                <div className="w-full sm:min-w-[180px] bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/50 mt-4 sm:mt-0">
                                                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase mb-1.5">
                                                        <span>{t('experiments.active.confidence')}</span>
                                                        <span className={overallConfidence > 0.8 ? "text-emerald-600" : "text-amber-600"}>
                                                            {Math.round(overallConfidence * 100)}%
                                                        </span>
                                                    </div>
                                                    <Progress value={overallConfidence * 100} className="h-1" />
                                                    <p className="text-[8px] text-muted-foreground mt-1.5 leading-tight opacity-70">
                                                        Statistical confidence based on current data volume and variance.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Analysis Content */}
                                            <div className="pt-2 sm:pt-0">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">{t('experiments.active.impact_title')}</p>
                                                <ExperimentImpactResults impacts={analysis?.impacts || []} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center border-2 border-dashed rounded-3xl text-muted-foreground bg-zinc-50/50">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground">{t('experiments.active.no_active_title')}</h3>
                        <p className="text-sm">{t('experiments.active.no_active_desc')}</p>
                    </div>
                )}
            </div>

            {/* Past Experiments */}
            <div className="space-y-6 w-full max-w-7xl mx-auto">
                <div className="flex justify-center items-center border-b pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('experiments.history.title')}</h3>
                </div>

                {pastExperiments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pastExperiments.map(exp => {
                            const analysis = analysisResults.find(r => r.experimentId === exp.id)

                            // Determine overall impact: Bio-Priority Rule (Health > Behavior)
                            let overallImpact = 'neutral'
                            if (analysis) {
                                const bioMetrics = ['hrv', 'resting_heart_rate', 'symptom_score', 'composite_score']
                                let bioScore = 0
                                let lifestyleScore = 0

                                analysis.impacts.forEach(i => {
                                    // Only consider significant results (p < 0.05)
                                    if (i.pValue >= 0.05) return;

                                    const val = i.significance === 'positive' ? 1 : i.significance === 'negative' ? -1 : 0
                                    if (bioMetrics.includes(i.metric)) {
                                        bioScore += val
                                    } else {
                                        lifestyleScore += val
                                    }
                                })

                                if (bioScore > 0) overallImpact = 'positive'
                                else if (bioScore < 0) overallImpact = 'negative'
                                else if (lifestyleScore > 0) overallImpact = 'positive'
                                else if (lifestyleScore < 0) overallImpact = 'negative'
                            }

                            return (
                                <Card key={exp.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                                {getIcon(exp.category || 'other')}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(exp)}>
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(exp.id)}>
                                                    <Trash className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-widest">
                                                {format(parseISO(exp.start_date), 'MMM yy')} - {format(parseISO(exp.end_date!), 'MMM yy')}
                                            </span>
                                            <h3 className="text-2xl font-serif mt-2 mb-1">{exp.name}</h3>
                                            {exp.dosage && <p className="text-xs font-bold text-muted-foreground uppercase">{exp.dosage}</p>}
                                        </div>

                                        <div className="pt-2">
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2">{t('experiments.history.independent_outcome')}</p>
                                            <div className={cn(
                                                "flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full w-fit uppercase",
                                                overallImpact === 'positive' && "bg-green-500/10 text-green-700",
                                                overallImpact === 'negative' && "bg-red-500/10 text-red-700",
                                                overallImpact === 'neutral' && "bg-zinc-500/10 text-zinc-700"
                                            )}>
                                                {overallImpact === 'positive' ? <ArrowUpRight className="w-3 h-3" /> : overallImpact === 'negative' ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                {overallImpact} {t('experiments.history.influence')}
                                            </div>

                                            {/* Contributing Factors */}
                                            {(overallImpact === 'positive' || overallImpact === 'negative') && (
                                                <div className="mt-3 space-y-1.5">
                                                    {analysis?.impacts
                                                        .filter(i => i.pValue < 0.05)
                                                        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
                                                        .map(i => (
                                                            <div key={i.metric} className="flex items-center justify-between text-[10px]">
                                                                <span className="text-muted-foreground font-medium">{getFriendlyName(i.metric, t)}</span>
                                                                <span className={cn(
                                                                    "font-bold",
                                                                    i.significance === 'positive' ? "text-green-600" : "text-red-600"
                                                                )}>
                                                                    {i.percentChange > 0 ? '+' : ''}{i.percentChange.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground opacity-50">
                        {t('experiments.history.no_history')}
                    </div>
                )}
            </div>
        </div>
    )
}
