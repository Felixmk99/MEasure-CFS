import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
    size?: number;
    variant?: "icon" | "full" | "text-only";
}

export const BrandLogo = ({ className, size = 48, variant = "full" }: BrandLogoProps) => {
    // Brand Colors (OKLCH values from design brief)
    const primaryColor = "oklch(0.72 0.14 235)";
    const accentColor = "oklch(0.85 0.12 65)";
    const mutedColor = "#94a3b8"; // Slate-400

    // The wave path: Starts chaotic (left), stabilizes (center), becomes rhythmic (right)
    const wavePath = `
    M 10 50 
    L 13 42 L 17 58 L 21 45 L 25 55 L 29 48 
    C 35 50 35 50 40 50 
    C 50 25 60 75 70 50 
    S 90 25 95 50
  `;

    return (
        <div className={cn("flex items-center gap-3 select-none", className)}>
            {(variant === "icon" || variant === "full") && (
                <div
                    className="relative overflow-hidden rounded-[22%] bg-white dark:bg-zinc-950 shadow-sm ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center transition-all duration-300 hover:shadow-md"
                    style={{ width: size, height: size }}
                >
                    {/* Subtle Background Gradient */}
                    <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                        }}
                    />

                    {/* SVG Content */}
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="p-[15%]"
                    >
                        {/* Grid/Context Lines (Very subtle) */}
                        <line x1="20" y1="20" x2="20" y2="80" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" />
                        <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" />
                        <line x1="80" y1="20" x2="80" y2="80" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" />

                        {/* The Main Wave */}
                        <path
                            d={wavePath}
                            stroke={`url(#logo-gradient-${size})`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />

                        <defs>
                            <linearGradient id={`logo-gradient-${size}`} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor={mutedColor} stopOpacity="0.8" />
                                <stop offset="40%" stopColor={primaryColor} />
                                <stop offset="100%" stopColor={accentColor} />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Glass Gloss (Top Left) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none opacity-50 mix-blend-overlay" />
                </div>
            )}

            {(variant === "full" || variant === "text-only") && (
                <div className="flex flex-col justify-center">
                    <span
                        className="font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100"
                        style={{ fontSize: size * 0.45 }}
                    >
                        <span style={{ color: primaryColor }}>ME</span>asure<span className="text-slate-400">-</span><span style={{ color: primaryColor }}>CFS</span>
                    </span>
                </div>
            )}
        </div>
    );
};
