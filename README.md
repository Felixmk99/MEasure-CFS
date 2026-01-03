# MEasure-CFS: Advanced Health Analytics for ME/CFS & Long Covid

**Live at: [MEasure-CFS.com](https://measure-cfs.com) | [MEasure-CFS.de](https://measure-cfs.de)**

**MEasure-CFS** is a inofficial, privacy-first health dashboard designed to empower patients living with ME/CFS and Long Covid. By transforming raw health data from symptom-tracking apps like Visible into actionable biological insights, we help users find their baseline, identify triggers, and master the art of pacing.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)

## 🚀 Key Features

### 🔴 PEM Danger Zone (Flagship)
Our predictive engine scans your last 7 days of activity against your **unique historical buildup patterns**. It alerts you *before* a crash happens, identifying synergistic triggers (e.g., a specific combination of steps and exertion) that preceded past episodes of Post-Exertional Malaise.

### 📊 Statistical Experiment Engine
Stop guessing which supplements or medications work. Our engine uses **Ordinary Least Squares (OLS) regression** to isolate the independent impact of interventions on your HRV, Resting Heart Rate, and Symptom scores, even when multiple experiments overlap in time.

### 🛡️ Privacy by Design
Your health data is sensitive. MEasure-CFS is built with a **security-first architecture**, utilizing Supabase Row Level Security (RLS) to ensure your data stays yours. 

### 🧬 Biological Baseline Analysis
Move beyond simple averages. We calculate personal **Z-scores** for your biometrics, allowing you to see how your body is truly recovering relative to your historical normal.

### 📥 Visible App Integration
Seamlessly ingest CSV exports from the **Visible** app. We handle the heavy lifting of parsing, normalization, and long-term trend analysis.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **Language**: TypeScript (Strict Mode)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: Recharts
- **Mathematics**: simple-statistics & date-fns

## ⚡️ Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with the schema initialized.

### Local Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/Felixmk99/MEasure-CFS.git
   cd MEasure-CFS
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment**
   Create a `.env.local` file with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
4. **Launch Dev Server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to start tracking.

## 📄 License
This project is licensed under the MIT License.
