'use client'

import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLanguage } from '@/components/providers/language-provider'
import { TrendingUp } from "lucide-react"

interface PSTHChartProps {
    data: any[] // Aggregated Profile Data
    phase2LoggedEnd?: number
    phase2PhysEnd?: number
    phase3TailEnd?: number
}

export function PSTHChart({ data, phase2LoggedEnd = 0, phase2PhysEnd = 0, phase3TailEnd = 0 }: PSTHChartProps) {
    const { t } = useLanguage()

    const chartData = data.map(d => ({
        dayOffset: d.dayOffset,
        steps_z: d.metrics['step_count']?.mean || 0,
        exertion_z: d.metrics['exertion_score']?.mean || 0,
        hrv_z: -(d.metrics['hrv']?.mean || 0), // Inverted for visual: lower HRV = higher "Stress"
        symptoms_z: d.metrics['composite_score']?.mean || 0,
        resting_hr_z: d.metrics['resting_heart_rate']?.mean || 0
    }))

    return (
        <Card className="col-span-1 md:col-span-2 border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    PEM Cycle Morphology (Average)
                </CardTitle>
                <CardDescription>
                    Superposed Epoch Analysis showing the standard signature of your crashes.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] px-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 40, right: 10, bottom: 20, left: 45 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />

                        {/* Background Phase Areas */}
                        {/* Phase 1: Buildup (-7 to -1) */}
                        <ReferenceArea x1={-7} x2={-0.2} fill="hsl(var(--orange-500))" fillOpacity={0.03} label={{ value: 'PHASE 1: BUILDUP', position: 'insideTopLeft', fill: 'hsl(var(--orange-500))', fontSize: 9, fontWeight: 800, offset: 10 }} />

                        {/* Phase 2: The Event (0 to Phys End) */}
                        <ReferenceArea x1={0} x2={phase2PhysEnd} fill="hsl(var(--red-500))" fillOpacity={0.05} label={{ value: 'PHASE 2: THE EVENT', position: 'insideTopLeft', fill: 'hsl(var(--red-500))', fontSize: 9, fontWeight: 800, offset: 10 }} />

                        {/* Phase 3: The Tail (Phys End to end) */}
                        <ReferenceArea x1={phase2PhysEnd} x2={14} fill="hsl(var(--blue-500))" fillOpacity={0.03} label={{ value: 'PHASE 3: RECOVERY', position: 'insideTopLeft', fill: 'hsl(var(--blue-500))', fontSize: 9, fontWeight: 800, offset: 10 }} />

                        <XAxis
                            dataKey="dayOffset"
                            type="number"
                            domain={[-7, 14]}
                            tickCount={22}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            tickFormatter={(v) => v === 0 ? 'Crash' : `${v > 0 ? '+' : ''}${v}`}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            domain={[-2, 3]}
                            ticks={[-2, -1, 0, 1, 2, 3]}
                            tickFormatter={(v) => v === 0 ? 'Normal' : `${v > 0 ? '+' : ''}${v}σ`}
                        />

                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ padding: '2px 0' }}
                            labelFormatter={(label) => `Day ${label === 0 ? '0 (Crash Start)' : (label > 0 ? `+${label}` : label)}`}
                            formatter={(value: any, name?: string) => [
                                <span key="val" className="font-bold">{typeof value === 'number' ? value.toFixed(2) : value}σ</span>,
                                <span key="name" className="text-muted-foreground uppercase text-[10px]">{name || 'Metric'}</span>
                            ]}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            height={50}
                            iconType="circle"
                            formatter={(value) => <span className="text-[10px] font-bold uppercase text-muted-foreground">{value}</span>}
                        />

                        {/* Baseline "Normal" Strip */}
                        <ReferenceArea y1={-0.5} y2={0.5} fill="hsl(var(--foreground))" fillOpacity={0.05} />

                        {/* Milestones */}
                        <ReferenceLine
                            x={0}
                            stroke="hsl(var(--red-500))"
                            strokeWidth={2}
                            label={{ position: 'top', value: 'IMPACT', fill: 'hsl(var(--red-500))', fontSize: 10, fontWeight: 'black' }}
                        />

                        {phase2LoggedEnd > 0 && (
                            <ReferenceLine
                                x={phase2LoggedEnd}
                                stroke="hsl(var(--red-400))"
                                strokeDasharray="4 4"
                                label={{ position: 'top', value: 'LOGS END', fill: 'hsl(var(--red-400))', fontSize: 9, fontWeight: 'bold' }}
                            />
                        )}

                        {phase2PhysEnd > phase2LoggedEnd && (
                            <ReferenceLine
                                x={phase2PhysEnd}
                                stroke="hsl(var(--blue-500))"
                                strokeDasharray="4 4"
                                label={{ position: 'top', value: 'BIO RESET', fill: 'hsl(var(--blue-500))', fontSize: 9, fontWeight: 'bold' }}
                            />
                        )}

                        {/* Lines */}
                        <Line
                            type="monotone"
                            dataKey="symptoms_z"
                            name="Symptoms"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={false}
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="exertion_z"
                            name="Exertion"
                            stroke="#f97316"
                            strokeWidth={2}
                            strokeDasharray="4 2"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="hrv_z"
                            name="Stress (Inverted HRV)"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="resting_hr_z"
                            name="Resting HR"
                            stroke="#ec4899"
                            strokeWidth={2}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
