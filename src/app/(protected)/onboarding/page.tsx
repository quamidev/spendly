"use client";

import { useState } from "react";
import { StepAccounts } from "@/components/onboarding/step-accounts";
import { StepCategories } from "@/components/onboarding/step-categories";
import { StepOwners } from "@/components/onboarding/step-owners";
import { SpendlyLogo } from "@/components/spendly-logo";
import { Progress } from "@/components/ui/progress";

const STEPS = ["Categorías", "Cuentas", "Responsables"];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <SpendlyLogo className="mx-auto text-3xl" />
        <h1 className="mt-4 font-bold text-2xl">Configuración inicial</h1>
        <p className="mt-2 text-muted-foreground">
          Configura tu cuenta en {STEPS.length} pasos simples
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Paso {currentStep + 1} de {STEPS.length}
          </span>
          <span className="font-medium">{STEPS[currentStep]}</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="rounded-lg border bg-card p-6">
        {currentStep === 0 && <StepCategories onNext={handleNext} />}
        {currentStep === 1 && (
          <StepAccounts onBack={handleBack} onNext={handleNext} />
        )}
        {currentStep === 2 && <StepOwners onBack={handleBack} />}
      </div>
    </div>
  );
}
