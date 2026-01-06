'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Footprints } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useCallback, useMemo } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/components/providers/language-provider"
import { LanguageSwitcher } from "./language-switcher"
import { BrandLogo } from "@/components/brand/brand-logo"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { PemStatusIndicator } from "@/components/dashboard/pem-status-indicator"
import { DonationDialog } from "@/components/donation/donation-dialog"

export default function Navbar() {
    const supabase = useMemo(() => createClient(), [])
    const [user, setUser] = useState<User | null>(null)
    const [hasData, setHasData] = useState<boolean>(false)
    const [hasMissingSteps, setHasMissingSteps] = useState<boolean>(false)
    const [mounted, setMounted] = useState(false)
    const { t } = useLanguage()
    const pathname = usePathname()
    const router = useRouter()

    const checkUserAndData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
            // Check if user has any data
            const { count } = await supabase
                .from('health_metrics')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            setHasData((count || 0) > 0)

            // Check if user is missing any steps for their uploaded data
            const { data: missingStepRow } = await supabase
                .from('health_metrics')
                .select('date')
                .eq('user_id', user.id)
                .is('step_count', null)
                .limit(1)

            setHasMissingSteps(!!missingStepRow && missingStepRow.length > 0)
        } else {
            setHasData(false)
            setHasMissingSteps(false)
        }
    }, [supabase])

    useEffect(() => {
        setMounted(true)
        checkUserAndData()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                checkUserAndData()
            } else {
                setUser(null)
                setHasData(false)
                setHasMissingSteps(false)
            }
        })

        // Listen for internal data update events (sent from Upload flows)
        window.addEventListener('health-data-updated', checkUserAndData)

        return () => {
            subscription.unsubscribe()
            window.removeEventListener('health-data-updated', checkUserAndData)
        }
    }, [supabase, checkUserAndData])

    // Safety: Re-check on pathname change in case a navigation implies a stale local state
    useEffect(() => {
        if (mounted && user) {
            checkUserAndData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, mounted])

    // Helper for link styles
    const getLinkClass = (path: string) => {
        const isActive = pathname === path
        return cn(
            "mr-6 text-sm font-medium transition-colors hover:text-primary",
            isActive ? "text-foreground font-semibold" : "text-muted-foreground"
        )
    }

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center">
                <Link href={mounted && user ? "/dashboard" : "/"} className="mr-6 flex items-center group">
                    <BrandLogo size={32} />
                </Link>

                {/* Desktop Menu */}
                <div className="mr-4 hidden md:flex items-center">
                    {mounted && user && (
                        <>
                            {hasData && (
                                <>
                                    <Link href="/dashboard" className={getLinkClass('/dashboard')}>
                                        {t('navbar.dashboard')}
                                    </Link>
                                    <Link href="/insights" className={getLinkClass('/insights')}>
                                        {t('navbar.insights')}
                                    </Link>
                                    <Link href="/experiments" className={getLinkClass('/experiments')}>
                                        {t('navbar.experiments')}
                                    </Link>
                                </>
                            )}
                            <Link href="/upload" className={getLinkClass('/upload')}>
                                {hasData ? t('navbar.data') : t('navbar.upload_data')}
                            </Link>

                            {/* PEM Danger Zone Indicator */}
                            {hasData && (
                                <div className="mr-6 flex items-center">
                                    <PemStatusIndicator />
                                </div>
                            )}

                            {/* Missing Steps Hint */}
                            {hasData && hasMissingSteps && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20" asChild>
                                                <Link href="/upload?tab=apple">
                                                    <Footprints className="w-4 h-4" />
                                                    <span className="hidden lg:inline text-xs">{t('navbar.missing_steps_hint')}</span>
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('navbar.missing_steps_tooltip')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Menu Trigger (Visible only on small screens) */}
                <div className="flex md:hidden items-center mr-2">
                    {mounted && user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex flex-col items-center justify-center gap-1">
                                    <div className="w-5 h-0.5 bg-foreground"></div>
                                    <div className="w-5 h-0.5 bg-foreground"></div>
                                    <div className="w-5 h-0.5 bg-foreground"></div>
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px] mt-2">
                                {hasData && (
                                    <>
                                        <div className="px-2 py-1.5 border-b mb-1">
                                            <PemStatusIndicator />
                                        </div>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className="w-full">{t('navbar.dashboard')}</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/insights" className="w-full">{t('navbar.insights')}</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/experiments" className="w-full">{t('navbar.experiments')}</Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link href="/upload" className="w-full">
                                        {hasData ? t('navbar.data') : t('navbar.upload_data')}
                                    </Link>
                                </DropdownMenuItem>
                                {hasMissingSteps && (
                                    <DropdownMenuItem asChild className="text-blue-500 focus:text-blue-600">
                                        <Link href="/upload?tab=apple" className="flex items-center gap-2">
                                            <Footprints className="w-4 h-4" />
                                            {t('navbar.missing_steps_hint')}
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    <DonationDialog />
                    <LanguageSwitcher />
                    {!mounted ? (
                        <div className="w-16 h-8" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                                            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings">{t('navbar.settings')}</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={async () => {
                                        try {
                                            await supabase.auth.signOut()
                                            // SPA-safe navigation to home
                                            router.replace('/')
                                            router.refresh()
                                        } catch (error) {
                                            console.error('Logout failed:', error)
                                            // Fallback redirect even on failure to ensure state reset
                                            window.location.href = '/'
                                        }
                                    }}>
                                        {t('navbar.logout')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
                                {t('navbar.login')}
                            </Link>
                            <Button asChild size="sm">
                                <Link href="/signup">{t('navbar.signup')}</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
