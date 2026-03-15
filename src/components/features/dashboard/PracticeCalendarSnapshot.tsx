
"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

const monthlyProgress = 72;
const chartData = [
  { name: 'Completed', value: monthlyProgress, fill: 'rgba(193,154,107,0.85)' },
  { name: 'Remaining', value: 100 - monthlyProgress, fill: 'rgba(255,240,215,0.08)' },
];
const chartConfig = {
  progress: {
    label: 'Progress',
    color: 'rgba(193,154,107,0.85)',
  },
  remaining: {
    label: 'Remaining',
    color: 'rgba(255,240,215,0.08)',
  }
}

export function PracticeCalendarSnapshot() {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full w-full">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={45} stroke="none" strokeWidth={0}>
                    <Cell key="completed" fill="var(--color-progress)" />
                    <Cell key="remaining" fill="var(--color-remaining)" />
                </Pie>
                 <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-serif text-lg font-bold" style={{ fill: 'rgba(255,240,215,0.92)' }}>
                    {monthlyProgress}%
                </text>
            </PieChart>
        </ChartContainer>
    </div>
  );
}
