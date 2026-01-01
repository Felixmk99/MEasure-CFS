'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

interface PendingUpload {
    file: File;
    type: 'visible' | 'bearable' | 'apple';
}

interface UploadContextType {
    pendingUpload: PendingUpload | null;
    setPendingUpload: (upload: PendingUpload | null) => void;
    clearPendingUpload: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [pendingUpload, setPendingUploadState] = useState<PendingUpload | null>(null)
    const supabase = React.useMemo(() => createClient(), [])
    const router = useRouter()

    // Restore from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('pending_upload')
        if (stored) {
            try {
                const { name, content, type } = JSON.parse(stored)
                if (name && content && type) {
                    const file = new File([content], name, { type: 'text/csv' })
                    setPendingUploadState({ file, type })
                }
            } catch (e) {
                console.error("Failed to restore pending upload", e)
                localStorage.removeItem('pending_upload')
            }
        }
    }, [])

    const setPendingUpload = useCallback((upload: PendingUpload | null) => {
        setPendingUploadState(upload)
        if (upload) {
            // Read file content to store in localStorage
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target?.result
                if (typeof content === 'string') {
                    localStorage.setItem('pending_upload', JSON.stringify({
                        name: upload.file.name,
                        type: upload.type,
                        content: content
                    }))
                }
            }
            reader.readAsText(upload.file)
        } else {
            localStorage.removeItem('pending_upload')
        }
    }, [])

    const clearPendingUpload = useCallback(() => {
        setPendingUploadState(null)
        localStorage.removeItem('pending_upload')
    }, [])

    const pathname = usePathname()

    useEffect(() => {
        if (pendingUpload && pathname !== '/onboarding') {
            const checkAuth = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    router.push('/upload')
                }
            }
            checkAuth()

            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                if (session?.user && pathname !== '/onboarding') {
                    router.push('/upload')
                }
            })

            return () => subscription.unsubscribe()
        }
    }, [pendingUpload, supabase, router, pathname])

    return (
        <UploadContext.Provider value={{ pendingUpload, setPendingUpload, clearPendingUpload }}>
            {children}
        </UploadContext.Provider>
    )
}

export function useUpload() {
    const context = useContext(UploadContext)
    if (context === undefined) {
        throw new Error('useUpload must be used within an UploadProvider')
    }
    return context
}
