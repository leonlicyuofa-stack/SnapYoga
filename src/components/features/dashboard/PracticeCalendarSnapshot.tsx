
"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

// Mock data for the pie chart
const monthlyProgress = 72;
const chartData = [
  { name: 'Completed', value: monthlyProgress, fill: 'hsl(var(--primary))' },
  { name: 'Remaining', value: 100 - monthlyProgress, fill: 'hsl(var(--muted))' },
];
const chartConfig = {
  progress: {
    label: 'Progress',
    color: 'hsl(var(--primary))',
  },
  remaining: {
    label: 'Remaining',
    color: 'hsl(var(--muted))',
  }
}

export function PracticeCalendarSnapshot() {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full w-full">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={25} outerRadius={35} strokeWidth={2}>
                    <Cell key="completed" fill="var(--color-progress)" />
                    <Cell key="remaining" fill="var(--color-remaining)" />
                </Pie>
                 <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xl font-bold">
                    {monthlyProgress}%
                </text>
            </PieChart>
        </ChartContainer>
        <p className="text-xs text-muted-foreground mt-1 text-center">Monthly Goal</p>
    </div>
  );
}
