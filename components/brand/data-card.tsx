import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";

interface BrandDataCardProps {
    title: string;
    value: string | number;
    unit?: string;
    description: string;
    footer?: string;
    className?: string;
}

export const BrandDataCard = ({
    title,
    value,
    unit,
    description,
    footer,
    className
}: BrandDataCardProps) => {
    return (
        <Card className={cn("overflow-hidden border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow", className)}>
            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b pb-3 pt-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <BrandLogo size={20} variant="icon" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{title}</span>
                    </div>
                    {footer && <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{footer}</span>}
                </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        {value}
                    </span>
                    {unit && (
                        <span className="text-lg font-bold text-slate-400">
                            {unit}
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
};
