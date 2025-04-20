"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/lib/hooks/use-toast";
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';

interface WelcomeStepProps {
  onComplete: () => void;
  onNext: () => void;
}

export function WelcomeStep({ onComplete, onNext }: WelcomeStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  
  const { toast } = useToast();
  const supabase = createClient();

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      signIn();
    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: "OAuthError",
        description: "Could not sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
      <h2 className="text-sm font-medium leading-snug">
        welcome to minara - our community&apos;s town square! here, you&apos;ll be able to see all events across the uiuc community.
      </h2>
      <p className="text-xs leading-snug">
        whether you&apos;re looking to find new events, new people, or to share your events for the entire community to find - hi!
      </p>
      <p className="text-xs leading-snug">
        you&apos;ll be able to find events through the organization&apos;s name or through tags! you can search by topics such as: free food, cultural events, music, sports, and more.
      </p>
      <div className="flex justify-end items-center gap-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="text-muted-foreground hover:text-muted-foreground/80 text-xs h-8"
        >
          skip to the app
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="px-4 bg-primary hover:bg-primary/90 text-xs h-8 flex items-center gap-2"
        >
          {isLoading ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="h-4 w-4" />
          )}
          login with google
        </Button>
      </div>
    </div>
  );
} 