'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { useRouter, usePathname } from 'next/navigation'

type Profile = Database['public']['Tables']['profiles']['Row']
type StepProvider = Profile['step_provider']
type SymptomProvider = Profile['symptom_provider']

interface UserContextType {
    profile: Profile | null
    loading: boolean
    updateStepProvider: (provider: StepProvider) => Promise<void>
    updateSymptomProvider: (provider: SymptomProvider) => Promise<void>
    updateExertionPreference: (preference: 'desirable' | 'undesirable') => Promise<void>
    refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (!error && data) {
                setProfile(data)
            } else if (error && error.code === 'PGRST116') {
                // Profile missing, might happen for existing users before trigger was added.
                // Auto-create an empty profile so they trigger the onboarding redirect.
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .insert({ id: user.id } as any)
                    .select()
                    .single()

                if (!createError) {
                    setProfile(newProfile)
                }
            }
        } else {
            setProfile(null)
        }
        setLoading(false)
    }, [supabase])

    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        setTimeout(() => fetchProfile(), 0)

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                fetchProfile()
            } else if (event === 'SIGNED_OUT') {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, fetchProfile])

    // Redirect to onboarding if profile is missing step_provider OR symptom_provider
    useEffect(() => {
        if (!loading && profile && (!profile.step_provider || !profile.symptom_provider)) {
            const excludedPaths = ['/onboarding', '/login', '/signup', '/auth/callback', '/forgot-password', '/reset-password']
            const isExcluded = excludedPaths.some(path => pathname?.startsWith(path))

            if (!isExcluded) {
                router.push('/onboarding')
            }
        }
    }, [loading, profile, pathname, router])

    const updateStepProvider = async (provider: StepProvider) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .upsert({ id: user.id, step_provider: provider } as any)

        if (!error) {
            setProfile(prev => prev
                ? { ...prev, step_provider: provider }
                : {
                    id: user.id,
                    step_provider: provider,
                    symptom_provider: 'visible', // Default for new profile
                    exertion_preference: null,
                    updated_at: new Date().toISOString()
                }
            )
        } else {
            throw error
        }
    }

    const updateSymptomProvider = async (provider: SymptomProvider) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .upsert({ id: user.id, symptom_provider: provider } as any)

        if (!error) {
            setProfile(prev => prev
                ? { ...prev, symptom_provider: provider }
                : {
                    id: user.id,
                    step_provider: 'apple', // Default for new profile
                    symptom_provider: provider,
                    exertion_preference: null,
                    updated_at: new Date().toISOString()
                }
            )
        } else {
            throw error
        }
    }

    const updateExertionPreference = async (preference: 'desirable' | 'undesirable') => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .upsert({ id: user.id, exertion_preference: preference } as any)

        if (!error) {
            setProfile(prev => prev
                ? { ...prev, exertion_preference: preference }
                : {
                    id: user.id,
                    step_provider: 'apple',
                    symptom_provider: 'visible',
                    exertion_preference: preference,
                    updated_at: new Date().toISOString()
                }
            )
        } else {
            throw error
        }
    }

    return (
        <UserContext.Provider value={{ profile, loading, updateStepProvider, updateSymptomProvider, updateExertionPreference, refreshProfile: fetchProfile }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
