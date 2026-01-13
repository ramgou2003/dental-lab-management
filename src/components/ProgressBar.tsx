import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    label: string;
    status: "completed" | "current" | "upcoming";
}

interface ProgressBarProps {
    steps: Step[];
    activeStep: number;
    onStepClick?: (step: number) => void;
    className?: string;
}

export const ProgressBar = ({ steps, activeStep, onStepClick, className }: ProgressBarProps) => {
    return (
        <div className={cn("w-full py-4 px-2", className)}>
            <div className="flex items-center w-full">
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    const isCompleted = step.status === "completed" || index < activeStep;
                    const isCurrent = step.status === "current" || index === activeStep;
                    const isLineColored = activeStep > index;

                    return [
                        /* Step Circle Container */
                        <div
                            key={`step-${index}`}
                            className={cn(
                                "relative flex flex-col items-center group shrink-0",
                                onStepClick ? "cursor-pointer" : "cursor-default"
                            )}
                            onClick={() => onStepClick?.(index)}
                        >
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white",
                                    isCompleted ? "border-blue-600 bg-blue-600 text-white" :
                                        isCurrent ? "border-blue-600 text-blue-600" : "border-gray-300 text-gray-400"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="font-semibold text-sm">{index + 1}</span>
                                )}
                            </div>

                            {/* Label - Absolute Positioned to not affect flex layout */}
                            <div className={cn(
                                "absolute top-12 left-1/2 -translate-x-1/2 w-20 text-center text-[10px] md:text-xs font-medium hidden md:block pointer-events-none leading-tight",
                                isCurrent ? "text-blue-600" : "text-gray-500"
                            )}>
                                {step.label}
                            </div>
                        </div>,

                        /* Connector Line */
                        !isLast && (
                            <div key={`line-${index}`} className="flex-1 h-0.5 mx-2 bg-gray-200 relative min-w-[10px]">
                                <div
                                    className={cn(
                                        "absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                                    )}
                                    style={{ width: isLineColored ? '100%' : '0%' }}
                                />
                            </div>
                        )
                    ];
                })}
            </div>

            {/* Mobile Current Step Label */}
            <div className="md:hidden text-center mt-4">
                <span className="text-sm font-semibold text-blue-600">
                    {steps[activeStep]?.label}
                </span>
            </div>

            {/* Desktop Spacer for bottom labels */}
            <div className="hidden md:block h-10"></div>
        </div>
    );
};
