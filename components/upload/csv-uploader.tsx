'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { normalizeLongFormatData } from '@/lib/data/long-format-normalizer'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from "@/components/providers/language-provider"

export function CsvUploader() {
    const { t } = useLanguage()
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const supabase = createClient()
    const router = useRouter()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setStatus('parsing')
        setMessage('Parsing CSV file...')

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    setStatus('uploading')
                    setMessage(`Processing ${results.data.length} measurements...`)

                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                        throw new Error('You must be logged in to upload data.')
                    }

                    const validRows = results.data.filter((r: any) => Object.values(r).some(v => !!v));
                    const records = normalizeLongFormatData(validRows)

                    if (records.length === 0) {
                        const headers = results.meta.fields || []
                        throw new Error(`No valid records. Found ${validRows.length} rows. Headers: ${headers.join(', ')}`)
                    }

                    setMessage(`Uploading ${records.length} days of data...`)

                    const dbRecords = records.map(r => ({
                        user_id: user.id,
                        date: r.date,
                        hrv: r.hrv,
                        resting_heart_rate: r.resting_heart_rate,
                        step_count: r.step_count,
                        symptom_score: r.symptom_score,
                        exertion_score: r.exertion_score,
                        custom_metrics: {
                            ...r.custom_metrics,
                            composite_score: r.composite_score
                        }
                    }))

                    const { data: existingDates } = await supabase
                        .from('health_metrics')
                        .select('date')
                        .eq('user_id', user.id) as { data: { date: string }[] | null }

                    const existingSet = new Set((existingDates || []).map(d => d.date))
                    const newRecords = dbRecords.filter(r => !existingSet.has(r.date))

                    if (newRecords.length === 0) {
                        setStatus('success')
                        setMessage('No new days to add. All data in the file is already present.')
                        return
                    }

                    setMessage(`Adding ${newRecords.length} new days of data...`)

                    const BATCH_SIZE = 50
                    for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
                        const batch = newRecords.slice(i, i + BATCH_SIZE)
                        const { error } = await supabase
                            .from('health_metrics')
                            .insert(batch as any)

                        if (error) {
                            console.error("Supabase Error in Batch:", error)
                            const errorMsg = error.message || (error as any).details || JSON.stringify(error)
                            throw new Error(`DB Error: ${errorMsg}`)
                        }

                        setMessage(`Uploaded ${Math.min(i + BATCH_SIZE, newRecords.length)} / ${newRecords.length} new days...`)
                    }

                    setStatus('success')
                    setMessage(`Successfully uploaded ${records.length} days of data!`)
                    router.refresh()

                    setTimeout(() => {
                        window.location.href = '/dashboard'
                    }, 1500)

                } catch (err: any) {
                    console.error("Upload Error Details:", err)
                    setStatus('error')
                    const msg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)) || 'Failed to upload data.'
                    setMessage(msg)
                } finally {
                    setUploading(false)
                }
            },
            error: (err) => {
                setStatus('error')
                setMessage('Failed to parse CSV: ' + err.message)
            }
        })
    }, [supabase, router])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv']
        },
        maxFiles: 1
    })

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div
                {...getRootProps()}
                className={`
                    relative group border-2 border-dashed rounded-[2.5rem] p-8 text-center cursor-pointer transition-all duration-300 ease-in-out
                    flex flex-col items-center justify-center gap-6
                    ${isDragActive ? 'border-rose-400 bg-rose-50/50 scale-[1.01]' : 'border-zinc-200 dark:border-zinc-800 hover:border-rose-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}
                    ${status === 'error' ? 'border-red-300 bg-red-50' : ''}
                    ${status === 'success' ? 'border-green-300 bg-green-50' : ''}
                `}
            >
                <input {...getInputProps()} />

                {/* Icon Circle */}
                <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-300
                    ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-500'}
                    ${status === 'error' ? 'bg-red-100 text-red-500' : ''}
                `}>
                    {status === 'success' ? <CheckCircle className="w-10 h-10" /> :
                        status === 'error' ? <AlertCircle className="w-10 h-10" /> :
                            status === 'uploading' ? <Upload className="w-10 h-10 animate-bounce" /> :
                                <Upload className="w-10 h-10" />}
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                        {status === 'uploading' ? t('upload.dropzone.uploading') :
                            status === 'success' ? t('upload.dropzone.success') :
                                status === 'error' ? t('upload.dropzone.error') :
                                    "Upload your CSV file"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                        {status === 'uploading' ? message :
                            status === 'success' ? message :
                                status === 'error' ? message :
                                    t('upload.dropzone.idle')}
                    </p>
                    {status === 'idle' && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-2 opacity-50">Supports .csv files</p>
                    )}
                </div>

                {/* Action Button */}
                {status !== 'uploading' && (
                    <Button
                        size="lg"
                        variant={status === 'success' ? "outline" : "default"}
                        className={`rounded-full px-8 h-12 text-sm font-semibold shadow-lg transition-transform hover:scale-105 ${status === 'success' ? 'border-green-200 text-green-700 hover:text-green-800 hover:bg-green-50' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                        onClick={(e) => {
                            if (status === 'success' || status === 'error') {
                                e.stopPropagation();
                                setStatus('idle');
                                setMessage('');
                            }
                        }}
                    >
                        {status === 'success' ? t('upload.dropzone.button_upload') :
                            status === 'error' ? t('upload.dropzone.button_retry') :
                                t('upload.dropzone.button_select')}
                    </Button>
                )}

                {/* Progress Bar */}
                {status === 'uploading' && (
                    <div className="w-full max-w-xs mt-4">
                        <Progress value={undefined} className="h-2 bg-zinc-100" />
                    </div>
                )}

            </div>
        </div>
    )
}
