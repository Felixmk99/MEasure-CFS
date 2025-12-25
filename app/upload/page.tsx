import { CsvUploader } from "@/components/upload/csv-uploader";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UploadPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 overflow-hidden">

            <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-6">
                {/* badge */}
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full py-1.5 px-4 inline-flex items-center gap-2 shadow-sm">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Private & Local Processing</span>
                </div>

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Import your <span className="text-rose-400">Visible</span> data
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                        Visualize your energy envelope and symptom patterns securely.
                    </p>
                </div>

                {/* Upload Area - Centered and prominent */}
                <CsvUploader />

                {/* 3-Step Guide */}
                <div className="grid grid-cols-3 gap-8 w-full max-w-2xl relative pt-2">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-[2px] bg-zinc-100 dark:bg-zinc-800 -z-10" />

                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shadow-sm border border-blue-100 dark:border-blue-900/20">1</div>
                        <div>
                            <h4 className="font-semibold text-[10px] uppercase tracking-wide">Settings</h4>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Visible App {'>'} Settings</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs shadow-sm border border-amber-100 dark:border-amber-900/20">2</div>
                        <div>
                            <h4 className="font-semibold text-[10px] uppercase tracking-wide">Export</h4>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Download CSV</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shadow-sm border border-emerald-100 dark:border-emerald-900/20">3</div>
                        <div>
                            <h4 className="font-semibold text-[10px] uppercase tracking-wide">Upload</h4>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Drop file here</p>
                        </div>
                    </div>
                </div>

                {/* Footer Trust */}
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground opacity-60 pt-2">
                    <div className="w-3 h-3 rounded-full bg-sky-500/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    </div>
                    Processed locally in browser
                </div>
            </div>
        </div>
    )
}
