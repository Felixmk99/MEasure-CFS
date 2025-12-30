'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Activity, Footprints } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useCallback, useMemo } from "react"
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Navbar() {
    const supabase = useMemo(() => createClient(), [])
    const [user, setUser] = useState<any>(null)
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
                <Link href={mounted && user ? "/dashboard" : "/"} className="mr-6 flex items-center space-x-2 group">
                    <Activity className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-bold inline-block text-lg tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">ME</span>
                        <span className="text-slate-500 dark:text-slate-400">asure-</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">CFS</span>
                    </span>
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
                                    <Link href="/experiments" className={getLinkClass('/experiments')}>
                                        {t('navbar.experiments')}
                                    </Link>
                                </>
                            )}
                            <Link href="/upload" className={getLinkClass('/upload')}>
                                {hasData ? t('navbar.data') : t('navbar.upload_data')}
                            </Link>

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

                <div className="ml-auto flex items-center space-x-4">
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
                                        await supabase.auth.signOut()
                                        setUser(null)
                                        setHasData(false)
                                        setHasMissingSteps(false)
                                        router.push('/')
                                        router.refresh()
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
