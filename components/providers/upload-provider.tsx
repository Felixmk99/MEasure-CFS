'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PendingUpload {
    file: File;
    type: 'visible' | 'apple';
}

interface UploadContextType {
    pendingUpload: PendingUpload | null;
    setPendingUpload: (upload: PendingUpload | null) => void;
    clearPendingUpload: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [pendingUpload, setPendingUploadState] = useState<PendingUpload | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const setPendingUpload = useCallback((upload: PendingUpload | null) => {
        setPendingUploadState(upload)
    }, [])

    const clearPendingUpload = useCallback(() => {
        setPendingUploadState(null)
    }, [])

    useEffect(() => {
        if (pendingUpload) {
            const checkAuth = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    router.push('/upload')
                }
            }
            checkAuth()

            // Also listen for auth state changes (e.g. after login/signup)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                    router.push('/upload')
                }
            })

            return () => subscription.unsubscribe()
        }
    }, [pendingUpload, supabase, router])

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
