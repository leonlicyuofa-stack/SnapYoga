"use client";

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

interface VideoUploadCardProps {
  onVideoUpload: (videoDataUri: string, fileName: string, userNotes: string) => void;
  isLoading: boolean;
}

export function VideoUploadCard({ onVideoUpload, isLoading }: VideoUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userNotes, setUserNotes] = useState("");
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/') || file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a video or image file.",
          variant: "destructive",
        });
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
      }
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        onVideoUpload(dataUri, selectedFile.name, userNotes);
      };
      reader.onerror = () => {
        toast({
          title: "Error Reading File",
          description: "Could not read the selected file. Please try again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(selectedFile);
    } else {
      toast({
        title: "No File Selected",
        description: "Please select a video or image file to upload.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div 
        className="w-full p-6 shadow-xl"
        style={{ 
          borderRadius: '24px 12px 24px 24px',
          border: '0.5px solid rgba(193,154,107,0.18)',
          background: 'rgba(13,20,30,0.55)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <CardHeader className="p-0">
          <CardTitle 
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif", 
              fontWeight: 600, 
              color: 'rgba(255,240,215,0.90)' 
            }}
            className="flex items-center gap-2 text-2xl"
          >
            <UploadCloud className="h-7 w-7" style={{ color: 'rgba(193,154,107,0.80)' }} />
            Upload Your Yoga Pose
          </CardTitle>
          <CardDescription 
            style={{ color: 'rgba(255,240,215,0.38)', fontStyle: 'italic' }}
            className="text-sm mt-1"
          >
            Select a video or image of your yoga pose. We'll analyze it and provide feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor="video-upload" 
                style={{ 
                  fontSize: 10, 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase', 
                  fontWeight: 600, 
                  color: 'rgba(193,154,107,0.55)' 
                }}
              >
                Pose File (Video or Image)
              </Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[rgba(193,154,107,0.85)] file:text-[rgba(25,16,8,0.95)] hover:file:opacity-80 cursor-pointer h-12 border-white/20 placeholder:text-white/50"
                aria-describedby="video-upload-help"
                disabled={isLoading}
              />
              <p id="video-upload-help" style={{ color: 'rgba(255,240,215,0.38)' }} className="text-[10px] mt-1 italic">
                Supported formats: MP4, MOV, JPG, PNG, etc. Max file size: 50MB.
              </p>
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="user-notes" 
                style={{ 
                  fontSize: 10, 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase', 
                  fontWeight: 600, 
                  color: 'rgba(193,154,107,0.55)' 
                }}
              >
                Additional Context (Optional)
              </Label>
              <Textarea
                id="user-notes"
                placeholder="E.g., I'm feeling stiffness in my hamstrings, is my back straight enough?"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                style={{ 
                  border: '0.5px solid rgba(193,154,107,0.14)', 
                  background: 'rgba(255,240,215,0.02)',
                  fontFamily: "'Cormorant Garamond', Georgia, serif"
                }}
                className="text-white placeholder:text-[rgba(255,240,215,0.28)] min-h-[100px] rounded-xl"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile}
            style={{ 
              background: 'rgba(193,154,107,0.85)', 
              color: 'rgba(25,16,8,0.95)' 
            }}
            className="w-full text-lg py-6 rounded-full shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95 border-none font-semibold"
            aria-label="Analyze Pose"
          >
            {isLoading ? (
              <SmileyRockLoader />
            ) : (
              <UploadCloud className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Analyzing...' : 'Analyze Pose'}
          </Button>
        </CardContent>
      </div>
    </>
  );
}
