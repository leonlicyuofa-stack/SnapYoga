
"use client"; 

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Link2, Copy, Mail, Share2, Search, Users, Send, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation'; 
import { useToast } from '@/hooks/use-toast'; 
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, where, getDocs, DocumentData, serverTimestamp, doc, setDoc } from 'firebase/firestore'; // Added Firestore imports
import Image from 'next/image'; 
import { Checkbox } from '@/components/ui/checkbox'; 
import { useAuth } from '@/contexts/AuthContext'; 


interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export default function HeadstandInvitePage() {
  const { user: currentUser } = useAuth();
  const pathname = usePathname();
  const [inviteLink, setInviteLink] = useState('');
  const { toast } = useToast();
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<UserProfile[]>([]);
  const [sendingInvites, setSendingInvites] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(`${window.location.origin}${pathname.replace('/invite', '')}`);
    }
  }, [pathname]);

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

  const handleSearchFriends = async () => {
    if (!friendSearchQuery.trim()) {
      toast({ title: "Empty Search", description: "Please enter an email to search.", variant: "destructive" });
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    setSelectedFriends([]);
    try {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", friendSearchQuery.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      const foundUsers: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
         if (currentUser && data.uid === currentUser.uid) {
            return;
        }
        foundUsers.push({
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
        });
      });
      setSearchResults(foundUsers);
      if (foundUsers.length === 0) {
        toast({ title: "No Users Found", description: "No registered users match your search query." });
      }
    } catch (error) {
      console.error("Error searching friends:", error);
      toast({ title: "Search Error", description: "Failed to search for friends. Please try again.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleFriendSelection = (friend: UserProfile) => {
    setSelectedFriends(prevSelected =>
      prevSelected.find(sf => sf.uid === friend.uid)
        ? prevSelected.filter(sf => sf.uid !== friend.uid)
        : [...prevSelected, friend]
    );
  };

  const handleSendInvitations = async () => {
    if (selectedFriends.length === 0) {
      toast({ title: "No Selection", description: "Please select at least one friend to invite.", variant: "destructive" });
      return;
    }
    setSendingInvites(true);
    console.log("Attempting to send invitations to:", selectedFriends.map(f => f.displayName || f.email));
    const challengeId = pathname.split('/')[2] || 'headstand'; 

    let successCount = 0;
    try {
        for (const friend of selectedFriends) {
          const invitationRef = doc(collection(firestore, 'invitations'));
          await setDoc(invitationRef, {
            challengeId,
            challengeName,
            inviterUid: currentUser?.uid,
            inviterName: currentUser?.displayName || currentUser?.email,
            inviteeUid: friend.uid,
            inviteeEmail: friend.email,
            inviteeName: friend.displayName || friend.email,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          successCount++;
        }
        if (successCount > 0) {
            toast({
                title: "Invitations Sent (Simulated)",
                description: `Invites for ${challengeName} sent to ${successCount} friend(s).`,
            });
        }
        if (successCount < selectedFriends.length) {
            toast({
                title: "Some Invitations Failed",
                description: `${selectedFriends.length - successCount} invitation(s) could not be sent.`,
                variant: "destructive"
            });
        }
    } catch (error) {
        console.error("Error sending invitations:", error);
        toast({
            title: "Invitation Error",
            description: "An error occurred while trying to send invitations. Please try again.",
            variant: "destructive"
        });
    }
    
    setSelectedFriends([]);
    setSendingInvites(false);
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
            <CardTitle className="text-3xl font-bold">Invite Friends to the {challengeName}</CardTitle>
            <CardDescription className="text-lg mt-2 text-muted-foreground">
              Share this link with your friends and conquer the pose together!
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
                  <Label htmlFor="friend-search" className="text-sm font-medium">Search by email</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="friend-search"
                      type="email"
                      placeholder="friend@example.com"
                      value={friendSearchQuery}
                      onChange={(e) => setFriendSearchQuery(e.target.value)}
                      className="flex-grow"
                      disabled={isSearching || sendingInvites}
                    />
                    <Button variant="outline" onClick={handleSearchFriends} disabled={!friendSearchQuery.trim() || isSearching || sendingInvites}>
                      {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                       Search
                    </Button>
                  </div>
                </div>

                {isSearching && (
                  <div className="p-4 border border-dashed rounded-md bg-muted/50 min-h-[80px] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="ml-2 text-sm text-muted-foreground">Searching...</p>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                    <p className="text-sm font-medium text-muted-foreground">Select friends to invite:</p>
                    {searchResults.map(friend => (
                      <div
                        key={friend.uid}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {friend.photoURL ? (
                            <Image src={friend.photoURL} alt={friend.displayName || friend.email || 'User'} width={32} height={32} className="rounded-full" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs">
                               {(friend.displayName?.[0] || friend.email?.[0] || 'U').toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{friend.displayName || 'Unnamed User'}</p>
                            <p className="text-xs text-muted-foreground">{friend.email}</p>
                          </div>
                        </div>
                        <Checkbox
                          id={`select-${friend.uid}`}
                          checked={selectedFriends.some(sf => sf.uid === friend.uid)}
                          onCheckedChange={() => handleToggleFriendSelection(friend)}
                          aria-label={`Select ${friend.displayName || friend.email}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {!isSearching && searchResults.length === 0 && friendSearchQuery && !isSearching && ( // Condition to show only after search and no results
                   <div className="p-4 border border-dashed rounded-md bg-muted/50 min-h-[80px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      No users found for &quot;{friendSearchQuery}&quot;.
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={handleSendInvitations} 
                  disabled={selectedFriends.length === 0 || sendingInvites || !currentUser}
                >
                  {sendingInvites ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {sendingInvites ? 'Sending...' : `Send In-App Invitations (${selectedFriends.length})`}
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
