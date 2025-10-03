import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  const steps = [
    { number: 1, title: "Video Details & Title" },
    { number: 2, title: "Thumbnail Text" },
    { number: 3, title: "Background & Design" }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step.number < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.number === currentStep
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <p className={`text-xs mt-2 text-center max-w-[100px] ${
                step.number === currentStep ? "font-semibold" : "text-muted-foreground"
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${
                step.number < currentStep ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
