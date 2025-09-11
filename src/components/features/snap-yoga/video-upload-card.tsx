"use client";

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, BrainCircuit, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface VideoUploadCardProps {
  onVideoUpload: (videoDataUri: string, fileName: string, analysisMethod: string) => void;
  isLoading: boolean;
  analysisMethod: string;
  onAnalysisMethodChange: (method: string) => void;
}

export function VideoUploadCard({ onVideoUpload, isLoading, analysisMethod, onAnalysisMethodChange }: VideoUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a video file.",
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
        onVideoUpload(dataUri, selectedFile.name, analysisMethod);
      };
      reader.onerror = () => {
        toast({
          title: "Error Reading File",
          description: "Could not read the selected video file. Please try again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(selectedFile);
    } else {
      toast({
        title: "No File Selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-xl">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UploadCloud className="h-7 w-7 text-primary" />
          Upload Your Yoga Pose Video
        </CardTitle>
        <CardDescription>
          Select a video of your yoga pose. We'll analyze it and provide feedback.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-6 mt-6">
        <div className="space-y-2">
          <Label htmlFor="video-upload" className="text-base font-medium">Video File</Label>
          <Input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            aria-describedby="video-upload-help"
            disabled={isLoading}
          />
          <p id="video-upload-help" className="text-sm text-muted-foreground">
            Supported formats: MP4, MOV, AVI, etc. Max file size: 50MB.
          </p>
        </div>

        <div className="space-y-3">
            <Label className="text-base font-medium">Analysis Method</Label>
            <RadioGroup
                value={analysisMethod}
                onValueChange={onAnalysisMethodChange}
                className="grid grid-cols-2 gap-4"
                disabled={isLoading}
            >
                <Label
                    htmlFor="method-cloud-run"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card/80 p-4 h-28 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all"
                >
                    <RadioGroupItem value="cloud-run" id="method-cloud-run" className="sr-only" />
                    <Cloud className="mb-2 h-7 w-7" />
                    <span className="text-center font-semibold">Cloud Run Service</span>
                </Label>
                 <Label
                    htmlFor="method-gemini"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card/80 p-4 h-28 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all"
                >
                    <RadioGroupItem value="gemini" id="method-gemini" className="sr-only" />
                    <BrainCircuit className="mb-2 h-7 w-7" />
                    <span className="text-center font-semibold">Gemini API</span>
                </Label>
            </RadioGroup>
        </div>


        <Button
          onClick={handleSubmit}
          disabled={isLoading || !selectedFile}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-md shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
          aria-label="yoga analysis"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Analyzing...' : 'yoga analysis'}
        </Button>
      </CardContent>
    </div>
  );
}
