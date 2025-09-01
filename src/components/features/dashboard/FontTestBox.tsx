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
          Edit the `className` in this component to test different fonts. See the instructions provided.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-lg">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            This text uses the default 'Roboto' font. (className: `font-sans`)
          </p>
          <p className="font-sans">
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-1">
            This text uses the 'Caveat' script font. (className: `font-script`)
          </p>
          <p className="font-script text-2xl">
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
