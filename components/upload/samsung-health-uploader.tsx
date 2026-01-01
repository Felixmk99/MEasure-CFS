'use client'

import { useCallback, useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { revalidateApp } from '@/app/actions/revalidate'
import { parseSamsungHealthCsv } from '@/lib/data/samsung-health-parser'

export function SamsungHealthUploader() {
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setStatus('parsing')
        setMessage('Parsing Samsung Health CSV...')

        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string
                if (!text) throw new Error('File is empty')

                const stepData = await parseSamsungHealthCsv(text)

                if (stepData.length === 0) {
                    throw new Error('No step count records found. Ensure you uploaded the correct "com.samsung.health.step_count" CSV.')
                }

                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('User not authenticated')

                setMessage('Checking existing health records...')
                const { data: existingDatesData } = await supabase
                    .from('health_metrics')
                    .select('date')
                    .eq('user_id', user.id)

                const existingDateSet = new Set((existingDatesData as { date: string }[] || []).map(r => r.date))

                const filteredStepEntries = stepData.filter(entry => existingDateSet.has(entry.date))
                const totalFiltered = filteredStepEntries.length

                if (totalFiltered === 0) {
                    throw new Error('No matching log dates found. Please upload your Visible CSV first.')
                }

                setStatus('uploading')
                setMessage(`Found ${totalFiltered} matching days. Preparing upload...`)

                const dbRecords = filteredStepEntries.map(entry => ({
                    user_id: user.id,
                    date: entry.date,
                    step_count: entry.steps
                }))

                const BATCH_SIZE = 50
                for (let i = 0; i < dbRecords.length; i += BATCH_SIZE) {
                    const batch = dbRecords.slice(i, i + BATCH_SIZE)
                    const dates = batch.map(b => b.date)

                    const { data: existingRows } = await supabase
                        .from('health_metrics')
                        .select('*')
                        .in('date', dates)
                        .eq('user_id', user.id)

                    const existingMap = new Map((existingRows || []).map((r: { date: string }) => [r.date, r]))

                    const upsertBatch = batch.map(newRecord => {
                        const existing = existingMap.get(newRecord.date)
                        return {
                            ...existing,
                            user_id: user.id,
                            date: newRecord.date,
                            step_count: newRecord.step_count
                        }
                    })

                    if (upsertBatch.length === 0) continue

                    const { error } = await supabase
                        .from('health_metrics')
                        .upsert(upsertBatch, {
                            onConflict: 'user_id, date'
                        })

                    if (error) throw error
                    setMessage(`Uploading ${Math.min(i + BATCH_SIZE, dbRecords.length)} of ${totalFiltered}...`)
                }

                setStatus('success')
                setMessage(`Successfully updated steps for ${totalFiltered} days!`)

                await revalidateApp()
                window.dispatchEvent(new CustomEvent('health-data-updated'))

                setTimeout(() => {
                    router.push('/dashboard')
                }, 1500)

            } catch (err: unknown) {
                console.error("Samsung Health Upload Error:", err)
                setStatus('error')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const msg = (err as any)?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)) || 'Failed to upload.'
                setMessage(msg)
            } finally {
                // Any cleanup or final actions can go here
            }
        }

        reader.readAsText(file)

    }, [supabase, router])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        maxFiles: 1
    })

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div
                {...getRootProps()}
                className={`
                    relative group border-2 border-dashed rounded-[2.5rem] p-8 text-center cursor-pointer transition-all duration-300 ease-in-out
                    flex flex-col items-center justify-center gap-6
                    ${isDragActive ? 'border-blue-400 bg-blue-50/50 scale-[1.01]' : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}
                    ${status === 'error' ? 'border-red-300 bg-red-50' : ''}
                    ${status === 'success' ? 'border-green-300 bg-green-50' : ''}
                `}
            >
                <input {...getInputProps()} />

                <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-300
                    ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-500'}
                    ${status === 'error' ? 'bg-red-100 text-red-500' : ''}
                `}>
                    {status === 'success' ? <CheckCircle className="w-10 h-10" /> :
                        status === 'error' ? <AlertCircle className="w-10 h-10" /> :
                            status === 'uploading' || status === 'parsing' ? <Upload className="w-10 h-10 animate-bounce" /> :
                                <FileSpreadsheet className="w-10 h-10" />}
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                        {status === 'parsing' ? 'Parsing CSV...' :
                            status === 'uploading' ? 'Uploading...' :
                                status === 'success' ? 'Upload Complete!' :
                                    'Upload Samsung Health Export'}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                        {status === 'parsing' || status === 'uploading' || status === 'success' || status === 'error' ? message :
                            'Drag and drop "com.samsung.health.step_count.csv". We only extract steps for days with existing Visible data.'}
                    </p>
                    {status === 'idle' && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-2 opacity-50">Supports .csv files</p>
                    )}
                </div>

                {status !== 'uploading' && status !== 'parsing' && (
                    <Button
                        size="lg"
                        className={`rounded-full px-8 h-12 text-sm font-semibold shadow-lg transition-transform hover:scale-105 ${status === 'success' ? 'bg-green-600 hover:bg-green-500' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                        onClick={(e) => {
                            if (status === 'success' || status === 'error') {
                                e.stopPropagation();
                                setStatus('idle');
                                setMessage('');
                            }
                        }}
                    >
                        {status === 'success' ? 'Upload New File' :
                            status === 'error' ? 'Try Again' :
                                'Select File'}
                    </Button>
                )}
            </div>
        </div>
    )
}
