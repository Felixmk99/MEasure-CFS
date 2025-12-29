"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Upload,
  Activity,
  LineChart,
  TrendingUp,
  Shield,
  Zap,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  FileUp,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const csvFiles = files.filter((file) => file.name.endsWith(".csv"))
    if (csvFiles.length > 0) {
      console.log("CSV files dropped:", csvFiles)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Handle file upload
    }
  }

  // New handler for drag enter to ensure isDragging is true when dragging over
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Updated gradient from teal to azure blue */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#60A5FA] to-[#0F172A] flex items-center justify-center shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">MEasure-CFS</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-[#1E293B] hover:text-[#60A5FA] hover:bg-[#60A5FA]/10 transition-colors"
            >
              Log in
            </Button>
            {/* Gradient now uses azure with warm amber accent */}
            <Button className="bg-gradient-to-r from-[#60A5FA] to-[#38BDF8] text-white hover:opacity-90 shadow-lg shadow-[#60A5FA]/30 transition-all">
              Sign up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* Replaced aggressive teal with calming azure blue gradient orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#60A5FA] rounded-full blur-[150px] opacity-40" />
          <div className="absolute inset-0 bg-gradient-radial from-[#0F172A] via-[#60A5FA]/20 to-transparent opacity-30" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#0F172A]/40 to-[#60A5FA]/30 rounded-full blur-[140px]" />
          {/* Added warm amber glow for hope accent */}
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
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight text-[#1E293B] tracking-tight">
              Transform health data
              <br />
              into predictive insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
              {
                "Designed for ME/CFS and Long Covid patients. Bridge the gap between how you feel and what your biology says. Turn the boom-and-bust cycle into data-backed recovery."
              }
            </p>
          </div>

          {/* Hero Uploader - Terminal Style */}
          <div className="max-w-4xl mx-auto mb-20 relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-radial from-[#FDBA74]/30 via-[#F59E0B]/15 to-transparent blur-3xl" />
              <div className="absolute inset-0 bg-gradient-radial from-[#60A5FA]/15 via-[#38BDF8]/10 to-transparent blur-3xl scale-110" />
            </div>

            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? "border-[#60A5FA] border-solid bg-slate-50 scale-[1.02] shadow-2xl shadow-[#60A5FA]/30 animate-pulse"
                  : "border-[#60A5FA]/60 bg-slate-50"
              } backdrop-blur-xl`}
              style={{
                boxShadow: isDragging
                  ? "0 0 0 1px rgba(96, 165, 250, 0.5) inset, 0 20px 50px -12px rgba(96, 165, 250, 0.4)"
                  : "inset 1px 1px 0 0 rgba(255, 255, 255, 0.6), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
                borderImage: isDragging
                  ? "none"
                  : "linear-gradient(to bottom, rgba(96, 165, 250, 0.3), rgba(96, 165, 250, 0.1)) 1",
                borderTop: isDragging ? "4px solid #38BDF8" : "4px solid #38BDF8",
              }}
            >
              <div className="p-12 sm:p-16 text-center">
                <div
                  className={`mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#60A5FA]/30 to-[#38BDF8]/20 border border-[#60A5FA]/60 shadow-lg transition-all duration-300 ${
                    isDragging ? "scale-110 shadow-[#60A5FA]/50" : ""
                  }`}
                >
                  <Upload className="h-10 w-10 text-[#3B82F6]" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-[#1E293B] tracking-tight">Drop your data to begin</h3>
                <p className="text-[#475569] mb-6 max-w-md mx-auto leading-relaxed">
                  Upload CSV files from Oura, Garmin, Apple Health, or any wearable. Your journey to predictive health
                  starts here.
                </p>

                <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#3B82F6] transition-colors cursor-default">
                    <div className="w-6 h-6 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#3B82F6]">O</span>
                    </div>
                    <span className="font-medium">Oura</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#3B82F6] transition-colors cursor-default">
                    <div className="w-6 h-6 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#3B82F6]">G</span>
                    </div>
                    <span className="font-medium">Garmin</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#3B82F6] transition-colors cursor-default">
                    <div className="w-6 h-6 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#3B82F6]">A</span>
                    </div>
                    <span className="font-medium">Apple Health</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#3B82F6] transition-colors cursor-default">
                    <div className="w-6 h-6 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#3B82F6]">F</span>
                    </div>
                    <span className="font-medium">Fitbit</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 items-center justify-center">
                  <label htmlFor="file-upload">
                    <Button
                      size="lg"
                      className="cursor-pointer transition-all bg-[#60A5FA] hover:bg-[#3B82F6] text-white font-semibold"
                      style={{
                        boxShadow:
                          "inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 0 25px -5px rgba(96, 165, 250, 0.6), 0 8px 16px -5px rgba(96, 165, 250, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 1px 0 0 rgba(255, 255, 255, 0.4), 0 0 35px 0px rgba(96, 165, 250, 0.8), 0 12px 24px -5px rgba(96, 165, 250, 0.5)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 0 25px -5px rgba(96, 165, 250, 0.6), 0 8px 16px -5px rgba(96, 165, 250, 0.3)"
                      }}
                    >
                      <FileUp className="mr-2 h-5 w-5" />
                      Choose file
                    </Button>
                  </label>
                  <Link
                    href="/signup"
                    className="text-sm text-[#64748B] hover:text-[#3B82F6] transition-colors inline-flex items-center gap-1"
                  >
                    New here? Create account first →
                  </Link>
                </div>

                <p className="text-xs text-[#64748B] mt-6 font-mono">Supports CSV files up to 100MB</p>
              </div>
            </div>
          </div>

          {/* Three Pillars Cards */}
          <div className="w-full bg-[#F0F9FF] py-16 mb-20">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div
                  className="group p-8 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#60A5FA] hover:-translate-y-2 transition-all duration-300"
                  style={{
                    boxShadow:
                      "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 1px 1px 0 0 rgba(96, 165, 233, 0.3), inset -1px -1px 0 0 rgba(96, 165, 233, 0.1), 0 10px 15px -3px rgba(96, 165, 233, 0.1), 0 4px 6px -2px rgba(96, 165, 233, 0.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
                  }}
                >
                  {/* Icon containers now use azure stroke */}
                  <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-[20px] bg-[#60A5FA]/10 border-2 border-[#60A5FA] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#60A5FA]/30 group-hover:border-[#3B82F6] transition-all duration-300">
                    <LineChart className="h-10 w-10 text-[#3B82F6]" />
                  </div>
                  <div className="mb-3 h-8 opacity-30 group-hover:opacity-50 transition-opacity">
                    <svg width="100%" height="32" className="text-[#60A5FA]">
                      <polyline
                        points="0,20 20,16 40,22 60,12 80,18 100,10 120,14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#1E293B] tracking-tight">Phase Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Identify buildup, crash, and recovery phases with superposed epoch analysis. See biological whispers
                    before symptoms hit.
                  </p>
                </div>
                <div
                  className="group p-8 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#60A5FA] hover:-translate-y-2 transition-all duration-300"
                  style={{
                    boxShadow:
                      "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 1px 1px 0 0 rgba(96, 165, 233, 0.3), inset -1px -1px 0 0 rgba(96, 165, 233, 0.1), 0 10px 15px -3px rgba(96, 165, 233, 0.1), 0 4px 6px -2px rgba(96, 165, 233, 0.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
                  }}
                >
                  <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-[20px] bg-[#60A5FA]/10 border-2 border-[#60A5FA] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#60A5FA]/30 group-hover:border-[#3B82F6] transition-all duration-300">
                    <TrendingUp className="h-10 w-10 text-[#3B82F6]" />
                  </div>
                  <div className="mb-3 h-8 opacity-30 group-hover:opacity-50 transition-opacity flex items-end gap-1">
                    <div className="w-3 h-4 bg-[#60A5FA] rounded-sm" />
                    <div className="w-3 h-6 bg-[#60A5FA] rounded-sm" />
                    <div className="w-3 h-5 bg-[#60A5FA] rounded-sm" />
                    <div className="w-3 h-7 bg-[#60A5FA] rounded-sm" />
                    <div className="w-3 h-4 bg-[#60A5FA] rounded-sm" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#1E293B] tracking-tight">Medication Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Multivariate regression isolates each treatment's impact. Know exactly what's working with
                    statistical confidence.
                  </p>
                </div>
                <div
                  className="group p-8 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#60A5FA] hover:-translate-y-2 transition-all duration-300"
                  style={{
                    boxShadow:
                      "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 1px 1px 0 0 rgba(96, 165, 233, 0.3), inset -1px -1px 0 0 rgba(96, 165, 233, 0.1), 0 10px 15px -3px rgba(96, 165, 233, 0.1), 0 4px 6px -2px rgba(96, 165, 233, 0.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
                  }}
                >
                  <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-[20px] bg-[#60A5FA]/10 border-2 border-[#60A5FA] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#60A5FA]/30 group-hover:border-[#3B82F6] transition-all duration-300">
                    <Zap className="h-10 w-10 text-[#3B82F6]" />
                  </div>
                  <div className="mb-3 h-8 opacity-30 group-hover:opacity-50 transition-opacity">
                    <svg width="100%" height="32" className="text-[#60A5FA]">
                      <path
                        d="M0,16 Q10,16 15,8 T30,16 Q35,16 40,24 T55,16 Q65,16 70,8 T85,16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#1E293B] tracking-tight">Recovery Insights</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Detect the hysteresis gap—when you feel okay but your biology isn't ready. Prevent relapses with
                    predictive agency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="max-w-6xl mx-auto mb-20"></div>

          {/* How It Works */}
          <div className="max-w-7xl mx-auto relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#60A5FA]/20 hidden lg:block" />

            {/* Step 1 - Left aligned */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24 relative">
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-[#60A5FA] rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />

              <div
                className="order-1 p-10 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E5E7EB]"
                style={{
                  boxShadow:
                    "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-[#60A5FA] bg-gradient-to-br from-white to-[#60A5FA]/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <FileSpreadsheet className="h-8 w-8 text-[#60A5FA] stroke-[1.5]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#64748B] mb-2 tracking-wide uppercase font-mono">
                      Step 01
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#1E293B]" style={{ letterSpacing: "-0.02em" }}>
                      Upload your biomarker data
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Import CSV files from any wearable device. We support HRV, RHR, activity levels, sleep metrics,
                      and custom symptom logs.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="order-2 p-10 rounded-2xl bg-gradient-to-br from-[#60A5FA]/10 to-white/50 backdrop-blur-sm border border-[#60A5FA]/30 relative"
                style={{
                  boxShadow:
                    "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  backgroundImage: `
                    linear-gradient(rgba(96, 165, 250, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(96, 165, 250, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              >
                <div className="space-y-2">
                  {[
                    { label: "HRV", value: "62.4", unit: "ms", bar: "75%" },
                    { label: "RHR", value: "68", unit: "bpm", bar: "60%" },
                    { label: "Sleep Quality", value: "78", unit: "%", bar: "78%" },
                    { label: "Activity Score", value: "6.2", unit: "pts", bar: "45%" },
                  ].map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/80 border border-[#60A5FA]/20"
                    >
                      <span className="text-sm font-medium text-[#1E293B]">{metric.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#60A5FA] to-[#FDBA74] rounded-full"
                            style={{ width: metric.bar }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[#60A5FA] w-16 text-right font-mono">
                          {metric.value}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono w-8">{metric.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Micro-label for time axis */}
                <div className="text-[10px] text-muted-foreground font-mono mt-2 text-right opacity-60 uppercase">
                  time →
                </div>
              </div>
            </div>

            {/* Step 2 - Right aligned */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24 relative">
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-[#60A5FA] rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />

              <div
                className="order-2 lg:order-1 p-10 rounded-2xl bg-gradient-to-br from-white/50 to-[#60A5FA]/10 backdrop-blur-sm border border-[#60A5FA]/30 relative"
                style={{
                  boxShadow:
                    "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  backgroundImage: `
                    linear-gradient(rgba(96, 165, 250, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(96, 165, 250, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              >
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-[#1E293B] mb-1 font-mono">-2.4σ</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">BUILDUP</div>
                  </div>
                  <div className="w-px h-12 bg-[#60A5FA]/30" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-[#FF6B6B] mb-1 font-mono">-4.1σ</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">EVENT</div>
                  </div>
                  <div className="w-px h-12 bg-[#60A5FA]/30" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-[#FDBA74] mb-1 font-mono">+1.8σ</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">RECOVERY</div>
                  </div>
                </div>
                <div className="h-32 relative">
                  {/* Y-axis label */}
                  <div className="absolute -left-2 top-0 text-[10px] text-muted-foreground font-mono opacity-60 uppercase">
                    σ
                  </div>
                  <svg width="100%" height="100%" className="text-[#60A5FA]">
                    <defs>
                      <linearGradient id="phaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area fill under the line */}
                    <path
                      d="M0,80 Q20,75 40,65 Q60,50 80,35 Q100,45 120,65 Q140,85 160,95 Q180,98 200,95 Q220,88 240,80 L240,120 L0,120 Z"
                      fill="url(#phaseGradient)"
                    />
                    {/* The line with reduced stroke width */}
                    <path
                      d="M0,80 Q20,75 40,65 Q60,50 80,35 Q100,45 120,65 Q140,85 160,95 Q180,98 200,95 Q220,88 240,80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="240" cy="80" r="3" fill="white" stroke="currentColor" strokeWidth="1.5">
                      <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                  {/* X-axis label */}
                  <div className="absolute -bottom-4 right-0 text-[10px] text-muted-foreground font-mono opacity-60 uppercase">
                    TIME →
                  </div>
                </div>
              </div>
              <div
                className="order-1 lg:order-2 p-10 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E5E7EB]"
                style={{
                  boxShadow:
                    "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-[#60A5FA] bg-gradient-to-br from-white to-[#60A5FA]/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Cpu className="h-8 w-8 text-[#60A5FA] stroke-[1.5]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#64748B] mb-2 tracking-wide uppercase font-mono">
                      Step 02
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#1E293B]" style={{ letterSpacing: "-0.02em" }}>
                      AI analyzes patterns
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Our engine identifies crash cycles, calculates impact intensity, and maps your unique biological
                      signature using superposed epoch analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 - Left aligned */}
            <div className="grid lg:grid-cols-2 gap-12 items-center relative">
              <div className="absolute left-1/2 top-12 w-3 h-3 bg-[#60A5FA] rounded-full -translate-x-1/2 hidden lg:block border-2 border-white shadow-lg" />

              <div
                className="order-1 p-10 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E5E7EB]"
                style={{
                  boxShadow:
                    "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-[#60A5FA] bg-gradient-to-br from-white to-[#60A5FA]/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <BarChart3 className="h-8 w-8 text-[#60A5FA] stroke-[1.5]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#64748B] mb-2 tracking-wide uppercase font-mono">
                      Step 03
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#1E293B]" style={{ letterSpacing: "-0.02em" }}>
                      Get predictive insights
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Receive actionable recommendations before crashes hit. Track treatment efficacy and understand
                      your body's early warning signals.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="order-2 p-10 rounded-2xl bg-gradient-to-br from-[#60A5FA]/10 to-white/50 backdrop-blur-sm border border-[#60A5FA]/30 relative"
                style={{
                  boxShadow:
                    "inset 1px 1px 0 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  backgroundImage: `
                    linear-gradient(rgba(96, 165, 250, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(96, 165, 250, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#FFE5E5] to-[#FFF5F5] border border-[#FF6B6B]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#1E293B] font-mono">Crash Risk</span>
                      <span className="text-lg font-bold text-[#FF6B6B] font-mono">High</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">HRV declining for 3 days</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#FEF3C7] to-[#FEF9E7] border border-[#FDBA74]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#1E293B] font-mono">Recovery Status</span>
                      <span className="text-lg font-bold text-[#F59E0B] font-mono">75%</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">Ready for light activity</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/80 border border-[#60A5FA]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#1E293B] font-mono">Treatment Impact</span>
                      <span className="text-lg font-bold text-[#60A5FA] font-mono">+18%</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">Medication A showing positive effect</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="py-20 bg-white">
            <div className="container px-4 md:px-6">
              {/* Privacy Badge */}
              <div className="max-w-2xl mx-auto mb-20">
                <div className="p-8 rounded-xl bg-white border border-[#E5E7EB] text-center shadow-sm hover:shadow-md hover:border-[#60A5FA]/40 transition-all duration-300">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-[#60A5FA]" />
                  <h3 className="text-xl font-semibold mb-2 text-[#1E293B]" style={{ letterSpacing: "-0.02em" }}>
                    Privacy-first design
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your health data is sensitive. All processing is secure, encrypted, and never shared. You own your
                    data, always.
                  </p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="max-w-4xl mx-auto text-center mb-20">
                <div className="p-12 sm:p-16 rounded-2xl bg-gradient-to-br from-white/90 via-[#60A5FA]/10 to-[#FDBA74]/10 backdrop-blur-md border border-[#60A5FA]/30 shadow-2xl relative overflow-hidden">
                  {/* Noise texture overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                    }}
                  />
                  <div className="relative z-10">
                    <h2
                      className="text-3xl sm:text-4xl font-bold mb-6 text-[#1E293B]"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      Ready to take control of your health?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                      Join patients who are turning data into recovery. Start analyzing your biomarkers today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button
                        size="lg"
                        asChild
                        className="shadow-xl shadow-[#60A5FA]/30 hover:shadow-[#FDBA74]/40 transition-all bg-[#60A5FA] hover:bg-[#3B82F6]"
                        style={{
                          boxShadow: "0 0 30px -5px rgba(253, 186, 116, 0.4), 0 20px 25px -5px rgba(96, 165, 250, 0.3)",
                        }}
                      >
                        <Link href="/signup">Create free account</Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="border-[#60A5FA]/40 hover:bg-[#60A5FA]/5 bg-transparent"
                      >
                        <Link href="/demo">View demo</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold tracking-tight">MEasure-CFS</span>
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              © 2025 MEasure-CFS. Privacy-first health analytics.
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-[#60A5FA] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-[#60A5FA] transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-[#60A5FA] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
