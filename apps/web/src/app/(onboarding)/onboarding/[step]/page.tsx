import { notFound } from "next/navigation";
import { StepOne } from "./_steps/step-1";
import { StepTwo } from "./_steps/step-2";
import { StepThree } from "./_steps/step-3";
import { StepFour } from "./_steps/step-4";
import { StepFive } from "./_steps/step-5";
import { StepSix } from "./_steps/step-6";

/**
 * Onboarding narrative router. Figma labels each screen "N/6"; steps 2–6 will
 * slot in here as they arrive. Unknown step → 404.
 */
export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  switch (step) {
    case "1":
      return <StepOne />;
    case "2":
      return <StepTwo />;
    case "3":
      return <StepThree />;
    case "4":
      return <StepFour />;
    case "5":
      return <StepFive />;
    case "6":
      return <StepSix />;
    default:
      notFound();
  }
}
