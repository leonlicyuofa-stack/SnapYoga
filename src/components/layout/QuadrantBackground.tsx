
"use client";

import { cn } from "@/lib/utils";

export function QuadrantBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-white">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#EBF4F8] transform-gpu -rotate-45 origin-bottom-left"></div>
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[#FEF5E3] transform-gpu -rotate-45 origin-bottom-right"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-[#F9E9F1] transform-gpu -rotate-45 origin-top-left"></div>
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[#FDDFE6] transform-gpu -rotate-45 origin-top-right"></div>
        </div>
    );
}
