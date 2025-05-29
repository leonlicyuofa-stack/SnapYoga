
"use client"; // Make this a client component to use hooks

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Link2, Copy, Mail, Share2, Search, Users, Send } from 'lucide-react';
import { usePathname } from 'next/navigation'; // To get the current URL
import { useToast } from '@/hooks/use-toast'; // For copy feedback
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export default function HeadstandInvitePage() {
  const pathname = usePathname();
  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}${pathname}` : '';
  const { toast } = useToast();
  const [friendSearchQuery, setFriendSearchQuery] = useState('');

  const challengeName = "Headstand (Sirsasana)";
  const emailSubject = `Join me for the ${challengeName} Yoga Challenge on SnapYoga!`;
  const emailBody = `Hey!\n\nI'm inviting you to join the ${challengeName} Yoga Challenge on SnapYoga. Let's master this pose together!\n\nChallenge link: ${inviteLink}\n\nSee you there!`;
  const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const handleCopyLink = () => {
    if (navigator.clipboard && inviteLink && inviteLink.trim() !== '') {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied!",
            description: "The invite link has been copied to your clipboard.",
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy the link. Please try manually.",
            variant: "destructive",
          });
        });
    } else if (!inviteLink || inviteLink.trim() === '') {
        toast({
            title: "Link Not Ready",
            description: "The invite link is not yet available. Please wait a moment and try again.",
            variant: "destructive",
        });
    } else {
        toast({
            title: "Copy Not Supported",
            description: "Automatic copying is not supported by your browser. Please copy the link manually.",
            variant: "destructive",
        });
    }
  };

  const handleSearchFriends = () => {
    // Placeholder for actual search logic
    toast({
        title: "Search Submitted",
        description: `Searching for friends with query: "${friendSearchQuery}". (Functionality to be implemented)`,
    });
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        <Button variant="outline" asChild className="mb-8 group">
          <Link href="/challenges">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Challenges
          </Link>
        </Button>
        <Card className="max-w-2xl mx-auto shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="text-center bg-muted/30 p-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mx-auto mb-4">
                <Link2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Invite Friends to the Headstand Challenge</CardTitle>
            <CardDescription className="text-lg mt-2 text-muted-foreground">
              Share this link with your friends and conquer the Headstand (Sirsasana) together!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div> {/* Section for sharing unique link */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Your unique invite link:</p>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    value={inviteLink} 
                    readOnly 
                    className="flex-grow p-3 border border-input rounded-md bg-background text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Invite Link"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyLink} title="Copy Link">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground mb-4">Or share via:</p>
                  <div className="flex justify-center gap-4">
                      <Button variant="outline" asChild className="w-full md:w-auto">
                        <a href={inviteLink.trim() ? mailtoLink : undefined} target="_blank" rel="noopener noreferrer">
                          <Mail className="mr-2 h-5 w-5" /> Email
                        </a>
                      </Button>
                      <Button variant="outline" disabled className="w-full md:w-auto">
                          <Share2 className="mr-2 h-5 w-5" /> Social Media (Coming Soon)
                      </Button>
                  </div>
              </div>
            
              <div className="bg-primary/5 p-6 rounded-md border border-primary/20 text-center mt-8">
                  <h3 className="text-xl font-semibold mb-2 text-primary">How Link Sharing Works</h3>
                  <p className="text-foreground/80 text-sm">
                    When your friends click this link, they'll be taken to the challenge page. 
                    Full tracking and leaderboards are coming soon!
                  </p>
              </div>
            </div>

            <Separator className="my-8" />

            <div> {/* Section for inviting registered friends */}
              <CardHeader className="p-0 mb-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mx-auto mb-4">
                    <Users className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="text-2xl font-bold text-accent">Invite Registered Friends</CardTitle>
                <CardDescription className="text-md mt-1 text-muted-foreground">
                  Search for friends already on SnapYoga and send them an in-app invitation.
                </CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="friend-search" className="text-sm font-medium">Search by email or username</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="friend-search"
                      type="text"
                      placeholder="e.g., friend@example.com or yogiBear"
                      value={friendSearchQuery}
                      onChange={(e) => setFriendSearchQuery(e.target.value)}
                      className="flex-grow"
                    />
                    <Button variant="outline" onClick={handleSearchFriends} disabled={!friendSearchQuery.trim()}>
                      <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-dashed rounded-md bg-muted/50 min-h-[80px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Search results will appear here. (Feature coming soon)
                  </p>
                </div>

                <Button className="w-full" disabled>
                  <Send className="mr-2 h-4 w-4" /> Send In-App Invitations (Coming Soon)
                </Button>
              </div>
            </div>

          </CardContent>
          <CardFooter className="p-6 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center w-full">
                Happy practicing! Invite your friends to join the fun and support each other.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}

    