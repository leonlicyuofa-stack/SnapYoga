"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, DotProps, CartesianGrid } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface StoredMood {
  name: string;
  emoji: string;
  loggedAt: Timestamp;
}

const moodToValue: { [key: string]: number } = {
  'Joyful': 4,
  'Calm': 3,
  'Emotional': 2,
  'Fatigue': 1,
};

const valueToEmoji: { [key: number]: string } = {
  4: '😊',
  3: '😌',
  2: '😢',
  1: '😫',
};

const CustomDot = (props: DotProps & { payload: any }) => {
    const { cx, cy, payload } = props;
    if (payload.moodValue) {
      return (
        <g transform={`translate(${cx},${cy})`}>
          <foreignObject x={-15} y={-15} width={30} height={30}>
            <div className="text-2xl flex items-center justify-center drop-shadow-md">{valueToEmoji[payload.moodValue]}</div>
          </foreignObject>
        </g>
      );
    }
    return (
      <circle cx={cx} cy={cy} r={4} fill="hsl(var(--muted))" opacity={0.3} />
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 border-none rounded-2xl shadow-xl">
          <p className="font-bold text-primary">{data.dayFull}</p>
          {data.moodValue ? (
            <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">{valueToEmoji[data.moodValue]}</span>
                <span className="font-medium text-muted-foreground">{data.moodName}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">No data</p>
          )}
        </div>
      );
    }
    return null;
};

export function MoodChart({ className }: { className?: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    const moodsRef = collection(firestore, 'users', user.uid, 'moods');
    const q = query(
      moodsRef,
      where('loggedAt', '>=', start),
      where('loggedAt', '<=', end)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const moods: { [key: string]: StoredMood } = {};
      querySnapshot.forEach((doc) => {
        const moodData = doc.data() as StoredMood;
        if (moodData.loggedAt) {
            const dayKey = format(moodData.loggedAt.toDate(), 'yyyy-MM-dd');
            moods[dayKey] = moodData;
        }
      });
      
      const weekDays = eachDayOfInterval({ start, end });
      const chartData = weekDays.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const moodData = moods[dayKey];
        return {
          day: format(day, 'EEE'),
          dayFull: format(day, 'EEEE, MMM d'),
          moodValue: moodData ? moodToValue[moodData.name] : null,
          moodName: moodData ? moodData.name : null,
          plotValue: moodData ? moodToValue[moodData.name] : 2.5,
        };
      });
      
      setData(chartData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }} 
            dy={10}
          />
          <YAxis hide={true} domain={[0, 5]} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }} />
          <Area 
              type="monotone" 
              dataKey="plotValue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorMood)" 
              connectNulls
              //@ts-ignore
              dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}