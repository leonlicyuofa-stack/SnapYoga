
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Paintbrush } from "lucide-react";

export function FontTestBox() {
  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <Paintbrush className="mr-3 h-7 w-7 text-primary" />
          Font Testing Area
        </CardTitle>
        <CardDescription>
          Edit `src/app/layout.tsx` and `tailwind.config.ts` to change fonts. This box shows the currently configured font families.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-lg">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Default Sans Serif: `font-sans` (Roboto)
          </p>
          <p className="font-sans">
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-1">
            Script Font: `font-script` (Caveat)
          </p>
          <p className="font-script text-2xl">
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-1">
            New Body Font: `font-body` (Inter)
          </p>
          <p className="font-body">
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
