'use client'

import { useCallback } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import {
  Upload,
  LineChart,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  FileUp,
  Shield
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

import { useUpload } from "@/components/providers/upload-provider"

export default function LandingPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { setPendingUpload } = useUpload()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const name = file.name.toLowerCase()
      const isVisible = name.includes('visible')
      const isBearable = name.includes('bearable')

      if (!isVisible && !isBearable) {
        alert("Invalid file. Please upload a 'Visible' or 'Bearable' export file.")
        return
      }

      setPendingUpload({ file, type: isBearable ? 'bearable' : 'visible' })

      const checkSession = async () => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/upload')
        } else {
          router.push('/signup')
        }
      }
      checkSession()
    }
  }, [router, setPendingUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    accept: { 'text/csv': ['.csv'] }
  })

  return (
    <div className="min-h-screen bg-[#F8FAFB] overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary rounded-full blur-[150px] opacity-40" />
          <div className="absolute inset-0 bg-gradient-radial from-slate-900 via-primary/20 to-transparent opacity-30" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-slate-900/40 to-primary/30 rounded-full blur-[140px]" />
          <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-accent/20 to-primary/30 rounded-full blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #60A5FA 1px, transparent 1px),
                linear-gradient(to bottom, #60A5FA 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight text-slate-900 tracking-tight">
              {t('landing.hero.transform_title')}
              <br />
              {t('landing.hero.predictive_insights')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
              {t('landing.hero.subtitle')}
            </p>
          </motion.div>

          {/* Hero Uploader */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-20 relative"
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-radial from-[#FDBA74]/30 via-[#F59E0B]/15 to-transparent blur-3xl" />
              <div className="absolute inset-0 bg-gradient-radial from-[#60A5FA]/15 via-[#38BDF8]/10 to-transparent blur-3xl scale-110" />
            </div>

            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dotted transition-all duration-300 cursor-pointer ${isDragActive
                ? "border-primary border-solid bg-slate-50 scale-[1.02] shadow-2xl shadow-primary/30 animate-pulse"
                : "border-primary/60 bg-slate-50 hover:border-primary hover:shadow-lg"
                } backdrop-blur-xl`}
              style={{
                boxShadow: isDragActive
                  ? "0 0 0 1px rgba(var(--primary-rgb), 0.5) inset, 0 20px 50px -12px rgba(var(--primary-rgb), 0.4)"
                  : "inset 1px 1px 0 0 rgba(255, 255, 255, 0.6), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
              }}
            >
              <input {...getInputProps()} />
              <div className="p-8 sm:p-16 text-center">
                <div
                  className={`mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-blue-400/20 border border-primary/60 shadow-lg transition-all duration-300 ${isDragActive ? "scale-110 shadow-primary/50" : ""
                    }`}
                >
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-slate-900 tracking-tight">{t('landing.hero.drop_title_generic') || "Drop App export to begin"}</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                  {t('landing.hero.drop_desc')}
                </p>
                <div className="flex flex-col gap-3 items-center justify-center">
                  <Button
                    size="lg"
                    className="cursor-pointer transition-all bg-primary hover:bg-primary/90 text-white font-semibold rounded-full"
                    style={{
                      boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 0 25px -5px rgba(var(--primary-rgb), 0.6), 0 8px 16px -5px rgba(var(--primary-rgb), 0.3)",
                    }}
                  >
                    <FileUp className="mr-2 h-5 w-5" />
                    {t('landing.hero.dropzone.button_select')}
                  </Button>
                  <Link
                    href="/signup"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    {t('landing.hero.create_account_hint')}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Three Pillars Cards */}
          <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-slate-50 py-20 mb-20 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: LineChart, key: 'phase', svg: (
                      <svg width="100%" height="32" className="text-primary">
                        <polyline points="0,20 20,16 40,22 60,12 80,18 100,10 120,14" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      </svg>
                    )
                  },
                  {
                    icon: TrendingUp, key: 'meds', svg: (
                      <div className="flex items-end gap-1 h-full">
                        <div className="w-3 h-4 bg-primary rounded-sm" />
                        <div className="w-3 h-6 bg-primary rounded-sm" />
                        <div className="w-3 h-5 bg-primary rounded-sm" />
                        <div className="w-3 h-7 bg-primary rounded-sm" />
                        <div className="w-3 h-4 bg-primary rounded-sm" />
                      </div>
                    )
                  },
                  {
                    icon: AlertTriangle, key: 'recovery', svg: (
                      <svg width="100%" height="32" className="text-rose-500">
                        <path d="M0,24 L15,24 L20,8 L25,30 L30,24 L50,24 L55,12 L60,28 L65,24 L85,24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  }
                ].map((pillar) => (
                  <motion.div
                    key={pillar.key}
                    whileHover={{ y: -8 }}
                    className="group p-8 rounded-xl bg-white border border-slate-200 hover:border-primary transition-all duration-300 shadow-sm"
                  >
                    <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-[20px] bg-primary/10 border-2 border-primary group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:border-primary/80 transition-all duration-300">
                      <pillar.icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="mb-3 h-8 opacity-30 group-hover:opacity-50 transition-opacity">
                      {pillar.svg}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-slate-900 tracking-tight">{t(`landing.pillars.${pillar.key}.title`)}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {t(`landing.pillars.${pillar.key}.desc`)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <div className="max-w-5xl mx-auto relative px-4 md:px-0">
            <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-[#60A5FA]/20 hidden lg:block" />

            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24 relative">
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-primary rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />
              <div className="order-1 p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-primary bg-gradient-to-br from-white to-primary/5 flex items-center justify-center shadow-md">
                    <FileSpreadsheet className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase font-mono">Step 01</div>
                    <h3 className="text-2xl font-bold mb-3 text-[#1E293B]">{t('landing.steps.01.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t('landing.steps.01.desc')}</p>
                  </div>
                </div>
              </div>
              <div className="order-2 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-[#60A5FA]/5 to-white/50 border border-[#60A5FA]/20 relative overflow-hidden bg-gradient-radial from-[#60A5FA]/10 via-transparent to-transparent">
                <div className="space-y-3 relative z-10">
                  {[
                    { label: "HRV", value: "62.4", unit: "ms", bar: "75%" },
                    { label: "RHR", value: "68", unit: "bpm", bar: "60%" },
                    { label: "Sleep Quality", value: "78", unit: "%", bar: "78%" },
                  ].map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/90 border border-[#60A5FA]/10">
                      <span className="text-xs font-medium text-[#1E293B]">{metric.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#60A5FA] to-[#FDBA74] rounded-full" style={{ width: metric.bar }} />
                        </div>
                        <span className="text-xs font-bold text-[#60A5FA]">{metric.value} {metric.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24 relative">
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-primary rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />
              <div className="order-2 lg:order-1 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-white/50 to-primary/5 border border-primary/20 relative flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-6 px-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900 font-mono">-2.4σ</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-mono">BUILDUP</div>
                  </div>
                  <div className="w-px h-8 bg-primary/20" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-rose-500 font-mono">-4.1σ</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-mono">EVENT</div>
                  </div>
                  <div className="w-px h-8 bg-primary/20" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-accent font-mono">+1.8σ</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-mono">RECOVERY</div>
                  </div>
                </div>
                <div className="w-full h-24 relative">
                  <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none" className="text-primary">
                    <path d="M 0 30 L 10 25 L 20 35 L 30 28 L 40 32 L 50 30 C 55 30 55 30 60 30 C 70 15 80 45 90 30 S 100 15 105 30"
                      fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="65" cy="22" r="2" fill="white" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
              </div>
              <div className="order-1 lg:order-2 p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-primary bg-gradient-to-br from-white to-primary/5 flex items-center justify-center shadow-md">
                    <Cpu className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase font-mono">Step 02</div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900">{t('landing.steps.02.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t('landing.steps.02.desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12 relative">
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-primary rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />
              <div className="order-1 p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-primary bg-gradient-to-br from-white to-primary/5 flex items-center justify-center shadow-md">
                    <BarChart3 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase font-mono">Step 03</div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900">{t('landing.steps.03.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t('landing.steps.03.desc')}</p>
                  </div>
                </div>
              </div>
              <div className="order-2 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-primary/5 to-white/50 border border-primary/20 relative bg-gradient-radial from-accent/10 via-transparent to-transparent">
                <div className="space-y-3 relative z-10">
                  <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-rose-800 uppercase font-mono tracking-tighter">Crash Risk</span>
                      <span className="text-sm font-black text-rose-600 font-mono">HIGH</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 uppercase font-mono tracking-tighter">Recovery Status</span>
                      <span className="text-sm font-black text-amber-600 font-mono">75%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-800 uppercase font-mono tracking-tighter">Impact</span>
                      <span className="text-sm font-black text-primary font-mono">+18%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="py-20 mt-12">
            {/* Privacy Badge */}
            <div className="max-w-2xl mx-auto mb-20 text-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-10 rounded-2xl bg-white border border-slate-200 shadow-sm"
              >
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-3 text-slate-900">{t('landing.privacy_badge.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.privacy_badge.desc')}
                </p>
              </motion.div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto text-center">
              <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-[100px] opacity-10 -ml-32 -mb-32" />

                <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                    {t('landing.cta.title')}
                  </h2>
                  <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t('landing.cta.desc')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      size="lg"
                      className="rounded-full px-10 h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105"
                      asChild
                    >
                      <Link href="/signup">{t('landing.cta.button_signup')}</Link>
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-full px-10 h-14 text-lg font-bold bg-white text-slate-950 hover:bg-slate-100 transition-all hover:scale-105 shadow-xl"
                      asChild
                    >
                      <Link href="/login">{t('landing.cta.button_demo')}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

