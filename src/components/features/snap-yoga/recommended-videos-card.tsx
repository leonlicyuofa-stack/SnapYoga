
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube } from 'lucide-react';

export interface YouTubeVideo {
  id: string;
  title: string;
  embedUrl: string;
}

interface RecommendedVideosCardProps {
  videos: YouTubeVideo[];
}

export function RecommendedVideosCard({ videos }: RecommendedVideosCardProps) {
  // Parent component SnapYogaPageClient will handle the conditional rendering
  // based on whether videos exist and analysis is done.
  // No need to check for videos.length === 0 here.

  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Youtube className="h-7 w-7 text-primary" /> {/* Using primary theme color */}
          Recommended Training Videos
        </CardTitle>
        <CardDescription>
          Explore these videos to help refine your practice based on the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video.id} className="space-y-2 bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video rounded-md overflow-hidden border">
              <iframe
                width="100%"
                height="100%"
                src={video.embedUrl}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-sm"
                loading="lazy" 
              ></iframe>
            </div>
            <h3 className="font-semibold text-base leading-snug" title={video.title}>{video.title}</h3>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
