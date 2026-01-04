'use client'

import { useCallback, useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileCode, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { revalidateApp } from '@/app/actions/revalidate'
import { useLanguage } from '@/components/providers/language-provider'

export function XmlUploader() {
    const { t } = useLanguage()
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setStatus('parsing')
        setMessage(t('upload.messages.parsing_file', { provider: 'Apple Health' }))

        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string
                if (!text) throw new Error('File is empty')

                // REGEX Parsing Logic (from Python reference)
                // <Record type="HKQuantityTypeIdentifierStepCount" ... startDate="2023-01-01 00:00:00 +0100" ... value="123">
                const stepPattern = /<Record.*?type="HKQuantityTypeIdentifierStepCount".*?startDate="([^"]+)".*?value="([^"]+)".*?>/g

                const stepData: Record<string, number> = {}
                let match

                // Loop through all matches
                while ((match = stepPattern.exec(text)) !== null) {
                    const startDateStr = match[1] // "2023-01-01 00:00:00 +0100"
                    const valueStr = match[2]

                    const date = startDateStr.split(' ')[0] // "2023-01-01"
                    const value = parseInt(valueStr, 10)

                    if (date && !isNaN(value)) {
                        stepData[date] = (stepData[date] || 0) + value
                    }
                }

                if (Object.keys(stepData).length === 0) {
                    throw new Error(t('upload.messages.no_steps_found'))
                }

                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error(t('upload.messages.login_required'))

                // 1. PRE-FILTERING: Fetch all existing dates for this user
                // This ensures we only process steps for days the user actually cares about (Visible log days)
                setMessage(t('upload.messages.checking_existing'))
                const { data: existingDatesData } = await supabase
                    .from('health_metrics')
                    .select('date')
                    .eq('user_id', user.id)

                const existingDatesDataTyped = (existingDatesData as { date: string }[] | null) || []
                const existingDateSet = new Set(existingDatesDataTyped.map(r => r.date))

                // 2. Filter Step Data
                const filteredStepEntries = Object.entries(stepData).filter(([date]) => existingDateSet.has(date))
                const totalFiltered = filteredStepEntries.length

                if (totalFiltered === 0) {
                    throw new Error(t('upload.messages.no_matching_dates'))
                }

                setStatus('uploading')
                setMessage(t('upload.messages.found_matching_days', { count: totalFiltered }))

                // 3. Prepare DB Records for existing dates only
                const dbRecords = filteredStepEntries.map(([date, steps]) => ({
                    user_id: user.id,
                    date: date,
                    step_count: steps
                }))

                // 4. Batch processing (chunks of 20 for fetch-merge-upsert safety)
                const BATCH_SIZE = 20
                for (let i = 0; i < dbRecords.length; i += BATCH_SIZE) {
                    const batch = dbRecords.slice(i, i + BATCH_SIZE)
                    const dates = batch.map(b => b.date)

                    // Fetch existing rows for these dates to get full data (HRV, Symptoms, etc.)
                    const { data: existingRows } = await supabase
                        .from('health_metrics')
                        .select('*')
                        .in('date', dates)
                        .eq('user_id', user.id)

                    const existingMap = new Map((existingRows || []).map((r: { date: string }) => [r.date, r]))

                    // Prepare for Upsert (Merge step_count into existing records)
                    const upsertBatch = batch.map(newRecord => {
                        const existing = existingMap.get(newRecord.date)
                        return {
                            ...existing,
                            user_id: user.id, // Mandatory
                            date: newRecord.date, // Mandatory
                            step_count: newRecord.step_count
                        }
                    })

                    if (upsertBatch.length === 0) continue

                    // Upsert records (preserving symptoms/HRV)
                    const { error } = await supabase
                        .from('health_metrics')
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .upsert(upsertBatch as any, {
                            onConflict: 'user_id, date'
                        })

                    if (error) {
                        console.error("Upsert Error:", JSON.stringify(error, null, 2))
                        throw error
                    }

                    // Update UI progress
                    setMessage(t('upload.messages.processed_progress', {
                        current: Math.min(i + BATCH_SIZE, dbRecords.length),
                        total: totalFiltered
                    }))
                }

                setStatus('success')
                setMessage(t('upload.messages.success_steps', { count: totalFiltered }))

                await revalidateApp()
                window.dispatchEvent(new CustomEvent('health-data-updated'))

                setTimeout(() => {
                    router.push('/dashboard')
                }, 1500)

            } catch (err: unknown) {
                console.error("XML Upload Error:", err)
                setStatus('error')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const msg = (err as any)?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)) || 'Failed to upload XML data.'
                setMessage(msg)
            }
        }

        reader.readAsText(file)

    }, [supabase, router])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/xml': ['.xml'], 'application/xml': ['.xml'] },
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

                {/* Icon Circle */}
                <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-300
                    ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-500'}
                    ${status === 'error' ? 'bg-red-100 text-red-500' : ''}
                `}>
                    {status === 'success' ? <CheckCircle className="w-10 h-10" /> :
                        status === 'error' ? <AlertCircle className="w-10 h-10" /> :
                            status === 'uploading' || status === 'parsing' ? <Upload className="w-10 h-10 animate-bounce" /> :
                                <FileCode className="w-10 h-10" />}
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                        {status === 'parsing' ? t('upload.dropzone.parsing') :
                            status === 'uploading' ? t('upload.dropzone.uploading') :
                                status === 'success' ? t('upload.dropzone.success') :
                                    t('upload.dropzone.title_apple')}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                        {status === 'parsing' || status === 'uploading' || status === 'success' || status === 'error' ? message :
                            t('upload.dropzone.hint_apple')}
                    </p>
                    {status === 'idle' && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-2 opacity-50">{t('upload.dropzone.file_type_xml')}</p>
                    )}
                </div>

                {/* Action Button */}
                {status !== 'uploading' && status !== 'parsing' && (
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
            </div>
        </div>
    )
}
