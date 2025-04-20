"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsDialog } from "../settings/settings-dialog";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";

export function AuthStatus() {
  const { user, isLoading, signIn, signOut } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not sign in with Google.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return null;

  if (!user) {
    return (
      <>
      <Link href="/policy">
          <Button variant="ghost" className="h-10 px-3 text-sm">
            Privacy Policy
          </Button>
        </Link>
        
        <Button variant="outline" size="sm" onClick={handleSignIn}>
          Log in
        </Button>

        
      </>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/policy">
        <Button variant="ghost" className="h-10 px-3 text-sm">
          Privacy Policy
        </Button>
      </Link>
      
      <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
        <Settings className="h-5 w-5" />
      </Button>
  
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-4 border-primary">
              <AvatarImage
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name}
              />
              <AvatarFallback>
                {user.user_metadata.full_name?.[0] ?? user.email?.[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium">
              {user.user_metadata.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuItem
            onClick={signOut}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  
      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
  
}
