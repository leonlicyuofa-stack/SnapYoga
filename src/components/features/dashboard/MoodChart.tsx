
"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, DotProps, CartesianGrid } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoredMood {
  name: string;
  emoji: string;
  loggedAt: Timestamp;
}

const moodToValue: { [key: string]: number } = {
  'Happy': 4,
  'Relaxed': 3,
  'Angry': 1,
  'Sad': 2,
};

const valueToEmoji: { [key: number]: string } = {
  4: '😊',
  3: '😌',
  2: '😢',
  1: '😠',
};

const valueToColor: { [key: number]: string } = {
    4: '#4ade80', // green-400
    3: '#a7f3d0', // emerald-200
    2: '#93c5fd', // blue-300
    1: '#facc15', // yellow-400
}

const CustomDot = (props: DotProps & { payload: any }) => {
    const { cx, cy, payload } = props;
  
    if (!payload.moodValue) {
      return null;
    }
  
    return (
      <g transform={`translate(${cx},${cy})`}>
        <foreignObject x={-12} y={-12} width={24} height={24}>
          <div className="text-2xl text-center">{valueToEmoji[payload.moodValue]}</div>
        </foreignObject>
      </g>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-md shadow-lg">
          <p className="font-bold">{data.day}</p>
          {data.moodValue ? (
            <p className="flex items-center">Mood: <span className="text-xl ml-1">{valueToEmoji[data.moodValue]}</span></p>
          ) : (
            <p className="text-muted-foreground">No mood logged</p>
          )}
        </div>
      );
    }
  
    return null;
};

export function MoodChart({ className }: { className?: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [week, setWeek] = useState(new Date());

  useEffect(() => {
    if (!user) return;

    const fetchMoods = async () => {
      const start = startOfWeek(week, { weekStartsOn: 1 });
      const end = endOfWeek(week, { weekStartsOn: 1 });

      const moodsRef = collection(firestore, 'users', user.uid, 'moods');
      const q = query(
        moodsRef,
        where('loggedAt', '>=', start),
        where('loggedAt', '<=', end)
      );

      const querySnapshot = await getDocs(q);
      const moods: { [key: string]: StoredMood } = {};
      querySnapshot.forEach((doc) => {
        const moodData = doc.data() as StoredMood;
        const dayKey = format(moodData.loggedAt.toDate(), 'yyyy-MM-dd');
        moods[dayKey] = moodData;
      });
      
      const weekDays = eachDayOfInterval({ start, end });
      const chartData = weekDays.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const moodData = moods[dayKey];
        return {
          day: format(day, 'EEE'),
          moodValue: moodData ? moodToValue[moodData.name] : null,
          fill: moodData ? valueToColor[moodToValue[moodData.name]] : 'transparent',
        };
      });
      
      setData(chartData);
    };

    fetchMoods();
  }, [user, week]);

  const handlePrevWeek = () => {
    setWeek(subDays(week, 7));
  };

  const handleNextWeek = () => {
    setWeek(subDays(week, -7));
  };


  return (
    <div className={className}>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <YAxis hide={true} domain={[0, 5]} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
                type="monotone" 
                dataKey="moodValue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorUv)" 
                connectNulls
                //@ts-ignore
                dot={<CustomDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </div>
  );
}
