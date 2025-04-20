"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WelcomeStep } from "./welcome-step";
import { CustomizeStep } from "./customize-step";

interface OnboardingSidebarProps {
  onComplete: () => void;
}

export function OnboardingSidebar({ onComplete }: OnboardingSidebarProps) {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <aside className="w-96 h-screen">
      <div className="h-full overflow-y-auto">
        <div 
          className={cn(
            "transition-all duration-200",
            step === 1 ? "opacity-100" : "opacity-50"
          )}
        >
          <WelcomeStep 
            onComplete={onComplete}
            onNext={() => setStep(2)}
          />
        </div>

        <div 
          className={cn(
            "transition-all duration-200 mt-3",
            step === 2 ? "opacity-100" : "opacity-50"
          )}
        >
          <CustomizeStep 
            onComplete={onComplete}
            onHide={onComplete}
          />
        </div>
      </div>
    </aside>
  );
} 