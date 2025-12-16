
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, where, getDocs, Timestamp, limit, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';

interface Analysis {
  id: string;
  createdAt: Timestamp;
  score: number;
}

export function PracticeAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [totalPoses, setTotalPoses] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const analysesRef = collection(firestore, 'users', user.uid, 'poseAnalyses');
      const q = query(
        analysesRef, 
        where('createdAt', '>=', thirtyDaysAgo),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const analyses: Analysis[] = [];
      querySnapshot.forEach((doc) => {
        analyses.push({ id: doc.id, ...doc.data() } as Analysis);
      });
      
      setTotalPoses(analyses.length);

      if (analyses.length > 0) {
        const totalScore = analyses.reduce((acc, curr) => acc + (curr.score || 0), 0);
        setAvgScore(Math.round(totalScore / analyses.length));
      }

      const groupedByDay = analyses.reduce((acc, curr) => {
        const day = format(curr.createdAt.toDate(), 'MMM dd');
        if (!acc[day]) {
          acc[day] = { count: 0, totalScore: 0 };
        }
        acc[day].count += 1;
        acc[day].totalScore += curr.score || 0;
        return acc;
      }, {} as Record<string, { count: number, totalScore: number }>);
      
      const chartData = Object.entries(groupedByDay).map(([name, { count, totalScore }]) => ({
        name,
        poses: count,
        avgScore: Math.round(totalScore / count)
      })).reverse();

      setData(chartData);
    };

    fetchData();
  }, [user]);

  return (
    <div className="h-full w-full">
        <div className="flex justify-around text-center h-1/4">
            <div>
                <p className="text-2xl font-bold">{totalPoses}</p>
                <p className="text-xs text-muted-foreground">Poses</p>
            </div>
            <div>
                <p className="text-2xl font-bold">{avgScore}</p>
                <p className="text-xs text-muted-foreground">Avg. Score</p>
            </div>
        </div>
        <ResponsiveContainer width="100%" height="75%">
            <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                labelStyle={{
                    color: 'hsl(var(--foreground))',
                    fontWeight: 'bold',
                }}
                itemStyle={{
                    color: 'hsl(var(--foreground))',
                }}
            />
            <Bar dataKey="poses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
