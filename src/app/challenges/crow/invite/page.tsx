
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CrowPoseInvitePage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        <Button variant="outline" asChild className="mb-8">
          <Link href="/challenges">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Challenges
          </Link>
        </Button>
        <Card className="max-w-2xl mx-auto shadow-xl rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Invite Friends to the Crow Pose Challenge</CardTitle>
            <CardDescription className="text-lg mt-2 text-muted-foreground">
              Share this challenge with your friends and master the Crow Pose (Bakasana) together!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-foreground/80">
              This page is a placeholder for the friend invitation functionality.
              In a real application, you would have options here to share a unique invite link via email, social media, or by copying it directly.
            </p>
            <div className="bg-muted p-6 rounded-md border">
                <h3 className="text-xl font-semibold mb-2 text-primary">Coming Soon!</h3>
                <p className="text-muted-foreground">Full friend invitation features and tracking will be implemented here.</p>
            </div>
             <div>
              <Button size="lg" disabled>
                Generate Invite Link (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
