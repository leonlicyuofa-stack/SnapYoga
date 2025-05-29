
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export interface YouTubeVideo {
  id: string;
  title: string;
  embedUrl: string;
}

interface RecommendedVideosCardProps {
  videos: YouTubeVideo[];
  isLoading: boolean; 
}

export function RecommendedVideosCard({ videos, isLoading }: RecommendedVideosCardProps) {
  if (isLoading) {
    return (
        <Card className="w-full shadow-lg mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Youtube className="h-7 w-7 text-primary" />
                    Recommended Training Videos
                </CardTitle>
                <CardDescription>
                    Loading recommended videos to help you improve...
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-video bg-muted rounded-md" />
                        <Skeleton className="h-4 bg-muted rounded w-3/4" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
  }


  if (!videos || videos.length === 0) {
    return null; // Don't render anything if there are no videos or not loading
  }

  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Youtube className="h-7 w-7 text-primary" />
          Recommended Training Videos
        </CardTitle>
        <CardDescription>
          Here are some videos that might help you improve your posture and poses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            {videos.map((video) => (
              <div key={video.id} className="rounded-lg overflow-hidden shadow-md border border-border bg-card p-1">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={video.embedUrl}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-md"
                  ></iframe>
                </div>
                <h3 className="mt-3 mb-1 px-2 text-base font-semibold leading-snug text-card-foreground truncate" title={video.title}>
                  {video.title}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No video recommendations available at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
