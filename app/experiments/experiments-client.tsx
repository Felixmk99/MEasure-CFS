'use client'

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { format, differenceInDays, parseISO, isAfter, isBefore } from "date-fns"
import { Plus, Trash, Pill, Activity, Moon, Utensils, ArrowUpRight, ArrowDownRight, Minus, Pencil, Beaker, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Database } from "@/types/database.types"
import { analyzeExperiments, Experiment, MetricDay } from "@/lib/statistics/experiment-analysis"
import { ExperimentImpactResults, getFriendlyName } from "@/components/experiments/experiment-impact"

export default function ExperimentsClient({ initialExperiments, history }: { initialExperiments: Experiment[], history: MetricDay[] }) {
    const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingExp, setEditingExp] = useState<Experiment | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        category: 'lifestyle',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: ''
    })

    // Calculate Baseline Stats for Z-Scores
    const baselineStats = useMemo(() => {
        const stats: Record<string, { mean: number, std: number }> = {}
        const excludedKeys = ['date', 'id', 'user_id', 'created_at', 'custom_metrics'];

        // Find all unique numeric keys across history
        const allKeys = new Set<string>();
        history.forEach(d => {
            Object.keys(d).forEach(k => {
                if (!excludedKeys.includes(k) && typeof d[k] === 'number') {
                    allKeys.add(k);
                }
            });
        });

        allKeys.forEach(m => {
            const values = history.map(d => d[m]).filter(v => typeof v === 'number') as number[]
            if (values.length > 0) {
                const mean = values.reduce((a, b) => a + b, 0) / values.length
                const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length) || 1
                stats[m] = { mean, std }
            }
        });

        // Calculate composite score baseline
        const compValues = history.map(d => {
            const h = (d.hrv as number) || 0
            const s = (d.symptom_score as number) || 0
            return (h / 100) - (s / 10) // Simple composite proxy
        })
        if (compValues.length > 0) {
            const compMean = compValues.reduce((a, b) => a + b, 0) / compValues.length
            const compStd = Math.sqrt(compValues.reduce((a, b) => a + Math.pow(b - compMean, 2), 0) / compValues.length) || 1
            stats['composite_score'] = { mean: compMean, std: compStd }
        }

        return stats
    }, [history])

    // Enhance history with synthetic metrics like composite_score
    const enhancedHistory = useMemo(() => {
        return history.map(d => ({
            ...d,
            composite_score: (((d.hrv as number) || 50) / 100) - (((d.symptom_score as number) || 5) / 10)
        }))
    }, [history])

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
                const { data, error } = await (supabase as any).from('experiments').update({
                    name: formData.name,
                    dosage: formData.dosage,
                    category: formData.category,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null
                }).eq('id', editingExp.id).select().single()

                if (error) throw error
                if (data) setExperiments(experiments.map(e => e.id === data.id ? (data as Experiment) : e))
            } else {
                const { data, error } = await (supabase as any).from('experiments').insert({
                    user_id: user.id,
                    name: formData.name,
                    dosage: formData.dosage,
                    category: formData.category,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null
                }).select().single()

                if (error) throw error
                if (data) setExperiments([data as Experiment, ...experiments])
            }

            setIsDialogOpen(false)
            setEditingExp(null)
            setFormData({ name: '', dosage: '', category: 'lifestyle', start_date: format(new Date(), 'yyyy-MM-dd'), end_date: '' })
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
            category: (exp.category as any) || 'lifestyle',
            start_date: exp.start_date,
            end_date: exp.end_date || ''
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this experiment?")
        if (!confirmed) return

        const { error } = await supabase.from('experiments').delete().eq('id', id)
        if (!error) {
            setExperiments(experiments.filter(e => e.id !== id))
            router.refresh()
        }
    }

    const getIcon = (category: string) => {
        switch (category) {
            case 'medication': return <Pill className="w-5 h-5 text-rose-500" />
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
                        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Platform Introduction</p>
                        <h2 className="text-4xl font-serif text-foreground">Statistical Experimentation</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        Welcome to your biological laboratory. This page helps you isolate the independent impact of medications,
                        supplements, and lifestyle changes using **Ordinary Least Squares (OLS) regression**.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold uppercase mb-1 flex items-center gap-2">
                                <Activity className="w-3 h-3 text-rose-500" /> Overlap Isolation
                            </p>
                            <p className="text-[11px] text-muted-foreground">Our engine mathematically separates the effects of multiple interventions, even if they overlap in time.</p>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold uppercase mb-1 flex items-center gap-2">
                                <Target className="w-3 h-3 text-emerald-500" /> Z-Score Impact
                            </p>
                            <p className="text-[11px] text-muted-foreground">See exactly how many standard deviations (σ) your HRV or Heart Rate shifted independently for each med.</p>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-center">
                        <ArrowDownRight className="w-6 h-6 text-zinc-300 animate-bounce" />
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="w-full flex justify-center">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) {
                        setEditingExp(null)
                        setFormData({ name: '', dosage: '', category: 'lifestyle', start_date: format(new Date(), 'yyyy-MM-dd'), end_date: '' })
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all">
                            <Plus className="w-5 h-5 mr-2" /> Start New Experiment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingExp ? 'Edit Experiment' : 'Log New Experiment'}</DialogTitle>
                            <DialogDescription>Track an intervention to measure its independent impact on your health trackers.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        placeholder="e.g. Nattokinase"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dosage (Optional)</Label>
                                    <Input
                                        placeholder="e.g. 2000 FU"
                                        value={formData.dosage}
                                        onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={v => setFormData({ ...formData, category: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lifestyle">Lifestyle (Pacing, Rest)</SelectItem>
                                        <SelectItem value="medication">Medication</SelectItem>
                                        <SelectItem value="supplement">Supplement</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date (Optional)</Label>
                                    <Input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isLoading || !formData.name}>
                                {isLoading ? 'Saving...' : editingExp ? 'Update' : 'Start Experiment'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Currently Active */}
            <div className="space-y-6 w-full max-w-4xl mx-auto">
                <div className="flex justify-center items-center border-b pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Currently Active</h3>
                </div>

                {activeExperiments.length > 0 ? (
                    <div className="grid gap-6">
                        {activeExperiments.map(exp => {
                            const daysActive = differenceInDays(new Date(), parseISO(exp.start_date))
                            const analysis = analysisResults.find(r => r.experimentId === exp.id)

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

                                    <CardContent className="p-8">
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wide">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                        Active • Day {daysActive}
                                                    </div>
                                                    {exp.dosage && (
                                                        <Badge variant="outline" className="text-[10px] font-bold border-zinc-200 uppercase">{exp.dosage}</Badge>
                                                    )}
                                                </div>

                                                <div>
                                                    <h2 className="text-4xl font-serif text-foreground mb-1">{exp.name}</h2>
                                                    <p className="text-muted-foreground text-sm uppercase tracking-tight font-bold">
                                                        Started {format(parseISO(exp.start_date), 'MMMM d, yyyy')}
                                                    </p>
                                                </div>

                                                <div className="pt-4">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Independent Health Impact (Controlled for overlaps)</p>
                                                    <ExperimentImpactResults impacts={analysis?.impacts || []} />
                                                </div>
                                            </div>

                                            {/* Status Block */}
                                            <div className="w-full lg:w-72 bg-white dark:bg-zinc-950 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center gap-6">
                                                <div>
                                                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase mb-2">
                                                        <span>Experiment Confidence</span>
                                                        <span>{Math.round((analysis?.impacts[0]?.confidence || 0) * 100)}%</span>
                                                    </div>
                                                    <Progress value={(analysis?.impacts[0]?.confidence || 0) * 100} className="h-1.5" />
                                                    <p className="text-[9px] text-muted-foreground mt-2 leading-tight italic">
                                                        Based on {history.length} days of history. Accuracy improves after 30 days.
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                        {getIcon(exp.category || 'other')}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">{exp.category}</p>
                                                        <p className="text-xs font-bold">{exp.name}</p>
                                                    </div>
                                                </div>
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
                        <h3 className="text-lg font-medium text-foreground">No active experiments</h3>
                        <p className="text-sm">Start a new experiment to track how interventions affect your health.</p>
                    </div>
                )}
            </div>

            {/* Past Experiments */}
            <div className="space-y-6 w-full max-w-4xl mx-auto">
                <div className="flex justify-center items-center border-b pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Historical Archive</h3>
                </div>

                {pastExperiments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastExperiments.map(exp => {
                            const analysis = analysisResults.find(r => r.experimentId === exp.id)
                            const overallImpact = analysis?.impacts.find(i => i.metric === 'composite_score')?.significance || 'neutral'

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
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2">Independent Outcome</p>
                                            <div className={cn(
                                                "flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full w-fit uppercase",
                                                overallImpact === 'positive' && "bg-green-500/10 text-green-700",
                                                overallImpact === 'negative' && "bg-red-500/10 text-red-700",
                                                overallImpact === 'neutral' && "bg-zinc-500/10 text-zinc-700"
                                            )}>
                                                {overallImpact === 'positive' ? <ArrowUpRight className="w-3 h-3" /> : overallImpact === 'negative' ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                {overallImpact} Influence
                                            </div>

                                            {/* Contributing Factors */}
                                            {(overallImpact === 'positive' || overallImpact === 'negative') && (
                                                <div className="mt-3 space-y-1.5">
                                                    {analysis?.impacts
                                                        .filter(i => i.significance !== 'neutral' && i.metric !== 'composite_score')
                                                        .sort((a, b) => Math.abs(b.zScoreShift) - Math.abs(a.zScoreShift))
                                                        .slice(0, 3)
                                                        .map(i => (
                                                            <div key={i.metric} className="flex items-center justify-between text-[10px]">
                                                                <span className="text-muted-foreground font-medium">{getFriendlyName(i.metric)}</span>
                                                                <span className={cn(
                                                                    "font-bold",
                                                                    i.significance === 'positive' ? "text-emerald-600" : "text-rose-600"
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
                        No concluded experiments in the archive.
                    </div>
                )}
            </div>
        </div>
    )
}
