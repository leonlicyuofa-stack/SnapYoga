
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

// This interface now represents videos coming from Firebase Storage.
export interface StorageVideo {
  id: string;
  title: string;
  url: string;
}

interface RecommendedVideosCardProps {
  videos: StorageVideo[];
  isLoading: boolean; 
}

export function RecommendedVideosCard({ videos, isLoading }: RecommendedVideosCardProps) {
  const ContentContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full p-6 bg-card/90 backdrop-blur-sm rounded-2xl shadow-xl border">
      {children}
    </div>
  );

  if (isLoading) {
    return (
        <ContentContainer>
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Youtube className="h-7 w-7 text-primary" />
                    Recommended Training Videos
                </CardTitle>
                <CardDescription>
                    Loading recommended videos to help you improve...
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-video bg-muted rounded-md" />
                        <Skeleton className="h-4 bg-muted rounded w-3/4" />
                    </div>
                ))}
            </CardContent>
        </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Youtube className="h-7 w-7 text-primary" />
          Recommended Training Videos
        </CardTitle>
        <CardDescription>
          {videos.length > 0 
            ? "Here are some videos that might help you improve your posture and poses."
            : "No specific recommendations available at the moment. Check back after analyzing a pose!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-6">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            {videos.map((video) => (
              <div key={video.id} className="rounded-lg overflow-hidden shadow-md border border-border bg-card p-1">
                <div className="aspect-video">
                  {/* Use a standard video tag for direct playback from URL */}
                  <video
                    controls
                    className="w-full h-full rounded-md object-contain bg-black"
                  >
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <h3 className="mt-3 mb-1 px-2 text-base font-semibold leading-snug text-card-foreground capitalize truncate" title={video.title}>
                  {video.title}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No specific video recommendations available at the moment. Consider practicing foundational poses or general flexibility routines.</p>
        )}
      </CardContent>
    </ContentContainer>
  );
}
