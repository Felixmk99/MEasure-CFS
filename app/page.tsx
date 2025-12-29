'use client'

import { useState, useCallback } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import {
  Upload,
  Activity,
  LineChart,
  TrendingUp,
  Zap,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  FileUp,
  Shield,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function LandingPage() {
  const { t } = useLanguage()
  const router = useRouter()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // For now, redirect to upload page which handles secure ingestion and auth
    router.push('/upload')
  }, [router])

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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#60A5FA] rounded-full blur-[150px] opacity-40" />
          <div className="absolute inset-0 bg-gradient-radial from-[#0F172A] via-[#60A5FA]/20 to-transparent opacity-30" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#0F172A]/40 to-[#60A5FA]/30 rounded-full blur-[140px]" />
          <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#FDBA74]/20 to-[#60A5FA]/30 rounded-full blur-[120px]" />
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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight text-[#1E293B] tracking-tight">
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
                ? "border-[#60A5FA] border-solid bg-slate-50 scale-[1.02] shadow-2xl shadow-[#60A5FA]/30 animate-pulse"
                : "border-[#60A5FA]/60 bg-slate-50 hover:border-[#60A5FA] hover:shadow-lg"
                } backdrop-blur-xl`}
              style={{
                boxShadow: isDragActive
                  ? "0 0 0 1px rgba(96, 165, 250, 0.5) inset, 0 20px 50px -12px rgba(96, 165, 250, 0.4)"
                  : "inset 1px 1px 0 0 rgba(255, 255, 255, 0.6), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
              }}
            >
              <input {...getInputProps()} />
              <div className="p-12 sm:p-16 text-center">
                <div
                  className={`mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#60A5FA]/30 to-[#38BDF8]/20 border border-[#60A5FA]/60 shadow-lg transition-all duration-300 ${isDragActive ? "scale-110 shadow-[#60A5FA]/50" : ""
                    }`}
                >
                  <Upload className="h-10 w-10 text-[#3B82F6]" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-[#1E293B] tracking-tight">{t('landing.hero.drop_title')}</h3>
                <p className="text-[#475569] mb-6 max-w-md mx-auto leading-relaxed">
                  {t('landing.hero.drop_desc')}
                </p>

                <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
                  {['Oura', 'Garmin', 'Apple Health', 'Fitbit'].map((source) => (
                    <div key={source} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#3B82F6] transition-colors cursor-default">
                      <div className="w-6 h-6 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#3B82F6]">{source[0]}</span>
                      </div>
                      <span className="font-medium">{source}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 items-center justify-center">
                  <Button
                    size="lg"
                    className="cursor-pointer transition-all bg-[#60A5FA] hover:bg-[#3B82F6] text-white font-semibold rounded-full"
                    style={{
                      boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 0 25px -5px rgba(96, 165, 250, 0.6), 0 8px 16px -5px rgba(96, 165, 250, 0.3)",
                    }}
                  >
                    <FileUp className="mr-2 h-5 w-5" />
                    {t('landing.hero.dropzone.button_select')}
                  </Button>
                  <Link
                    href="/signup"
                    className="text-sm text-[#64748B] hover:text-[#3B82F6] transition-colors inline-flex items-center gap-1"
                  >
                    {t('landing.hero.create_account_hint')}
                  </Link>
                </div>

                <p className="text-xs text-[#64748B] mt-6 font-mono">{t('landing.hero.file_limit_hint')}</p>
              </div>
            </div>
          </motion.div>

          {/* Three Pillars Cards */}
          <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#F0F9FF] py-20 mb-20 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: LineChart, key: 'phase', svg: (
                      <svg width="100%" height="32" className="text-[#60A5FA]">
                        <polyline points="0,20 20,16 40,22 60,12 80,18 100,10 120,14" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      </svg>
                    )
                  },
                  {
                    icon: TrendingUp, key: 'meds', svg: (
                      <div className="flex items-end gap-1 h-full">
                        <div className="w-3 h-4 bg-[#60A5FA] rounded-sm" />
                        <div className="w-3 h-6 bg-[#60A5FA] rounded-sm" />
                        <div className="w-3 h-5 bg-[#60A5FA] rounded-sm" />
                        <div className="w-3 h-7 bg-[#60A5FA] rounded-sm" />
                        <div className="w-3 h-4 bg-[#60A5FA] rounded-sm" />
                      </div>
                    )
                  },
                  {
                    icon: Zap, key: 'recovery', svg: (
                      <svg width="100%" height="32" className="text-[#60A5FA]">
                        <path d="M0,16 Q10,16 15,8 T30,16 Q35,16 40,24 T55,16 Q65,16 70,8 T85,16" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )
                  }
                ].map((pillar) => (
                  <motion.div
                    key={pillar.key}
                    whileHover={{ y: -8 }}
                    className="group p-8 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#60A5FA] transition-all duration-300 shadow-sm"
                  >
                    <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-[20px] bg-[#60A5FA]/10 border-2 border-[#60A5FA] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#60A5FA]/30 group-hover:border-[#3B82F6] transition-all duration-300">
                      <pillar.icon className="h-10 w-10 text-[#3B82F6]" />
                    </div>
                    <div className="mb-3 h-8 opacity-30 group-hover:opacity-50 transition-opacity">
                      {pillar.svg}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-[#1E293B] tracking-tight">{t(`landing.pillars.${pillar.key}.title`)}</h3>
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
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-[#60A5FA] rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />
              <div className="order-1 p-8 md:p-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-[#60A5FA] bg-gradient-to-br from-white to-[#60A5FA]/5 flex items-center justify-center shadow-md">
                    <FileSpreadsheet className="h-7 w-7 text-[#60A5FA]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#64748B] mb-1 tracking-wide uppercase font-mono">Step 01</div>
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
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-[#60A5FA] rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />
              <div className="order-2 lg:order-1 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-white/50 to-[#60A5FA]/5 border border-[#60A5FA]/20 relative flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-6 px-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#1E293B] font-mono">-2.4σ</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-mono">BUILDUP</div>
                  </div>
                  <div className="w-px h-8 bg-[#60A5FA]/20" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-rose-500 font-mono">-4.1σ</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-mono">EVENT</div>
                  </div>
                  <div className="w-px h-8 bg-[#60A5FA]/20" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#FDBA74] font-mono">+1.8σ</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-mono">RECOVERY</div>
                  </div>
                </div>
                <div className="w-full h-24 relative">
                  <svg width="100%" height="100%" className="text-[#60A5FA]">
                    <path d="M0,60 Q30,55 60,40 Q90,20 120,45 Q150,70 180,75 Q210,65 240,60" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="120" cy="45" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <div className="order-1 lg:order-2 p-8 md:p-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-[#60A5FA] bg-gradient-to-br from-white to-[#60A5FA]/5 flex items-center justify-center shadow-md">
                    <Cpu className="h-7 w-7 text-[#60A5FA]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#64748B] mb-1 tracking-wide uppercase font-mono">Step 02</div>
                    <h3 className="text-2xl font-bold mb-3 text-[#1E293B]">{t('landing.steps.02.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t('landing.steps.02.desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12 relative">
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-[#60A5FA] rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />
              <div className="order-1 p-8 md:p-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-[#60A5FA] bg-gradient-to-br from-white to-[#60A5FA]/5 flex items-center justify-center shadow-md">
                    <BarChart3 className="h-7 w-7 text-[#60A5FA]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#64748B] mb-1 tracking-wide uppercase font-mono">Step 03</div>
                    <h3 className="text-2xl font-bold mb-3 text-[#1E293B]">{t('landing.steps.03.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t('landing.steps.03.desc')}</p>
                  </div>
                </div>
              </div>
              <div className="order-2 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-[#60A5FA]/5 to-white/50 border border-[#60A5FA]/20 relative bg-gradient-radial from-[#FDBA74]/10 via-transparent to-transparent">
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
                      <span className="text-sm font-black text-[#60A5FA] font-mono">+18%</span>
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
                className="p-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm"
              >
                <Shield className="h-12 w-12 mx-auto mb-4 text-[#60A5FA]" />
                <h3 className="text-2xl font-bold mb-3 text-[#1E293B]">{t('landing.privacy_badge.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.privacy_badge.desc')}
                </p>
              </motion.div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto text-center">
              <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#60A5FA] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FDBA74] rounded-full blur-[100px] opacity-10 -ml-32 -mb-32" />

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
                      className="rounded-full px-10 h-14 text-lg font-bold bg-[#60A5FA] hover:bg-[#3B82F6] shadow-xl shadow-[#60A5FA]/20 transition-all hover:scale-105"
                      asChild
                    >
                      <Link href="/signup">{t('landing.cta.button_signup')}</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full px-10 h-14 text-lg font-bold border-white/20 hover:bg-white/10 text-white"
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

