
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", poses: 4 },
  { name: "Tue", poses: 3 },
  { name: "Wed", poses: 5 },
  { name: "Thu", poses: 2 },
  { name: "Fri", poses: 6 },
  { name: "Sat", poses: 1 },
  { name: "Sun", poses: 4 },
];

export function PracticeCalendarSnapshot() {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: -10 }}>
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Bar dataKey="poses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-1 text-center">Weekly Practice</p>
    </div>
  );
}
