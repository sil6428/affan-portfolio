// Vendored from ReactBits (reactbits.dev) — Components/Stepper, TS + Tailwind variant.
// Local changes (behavior-preserving): retinted to the terminal palette; step indicators are
// real <button>s with accessible names + aria-current; optional `validateStep` gate before moving
// forward; optional `hideCompleteButton`/`completeButtonText`; `stepLabels`; `reduceMotion`
// (no slide/height animation); outer wrapper no longer forces an aspect ratio (pass className).

import React, { useState, Children, useRef, useLayoutEffect, type HTMLAttributes, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  completeButtonText?: string;
  /** Hide the footer's primary button on the last step (the step supplies its own action). */
  hideCompleteButton?: boolean;
  disableStepIndicators?: boolean;
  /** Return false to block moving forward from `step` (e.g. failed validation). */
  validateStep?: (step: number) => boolean;
  /** Accessible names for the step indicators. */
  stepLabels?: string[];
  reduceMotion?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

// Local change: chalk + ash keys (the site keeps green as a rare accent; primary actions are white).
const ACTIVE = '#e8e8e8';
const DONE = '#8a8a8a';

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  completeButtonText = 'Complete',
  hideCompleteButton = false,
  disableStepIndicators = false,
  validateStep,
  stepLabels,
  reduceMotion = false,
  renderStepIndicator,
  className,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const canLeave = (from: number, to: number) => {
    if (!validateStep || to <= from) return true;
    for (let s = from; s < to; s++) {
      if (!validateStep(s)) return false;
    }
    return true;
  };

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep && canLeave(currentStep, currentStep + 1)) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    if (!canLeave(currentStep, totalSteps + 1)) return;
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  const goTo = (clicked: number) => {
    if (!canLeave(currentStep, clicked)) return;
    setDirection(clicked > currentStep ? 1 : -1);
    updateStep(clicked);
  };

  return (
    <div className={className ?? 'flex min-h-full flex-1 flex-col items-center justify-center p-4'} {...rest}>
      <div
        className={`mx-auto w-full max-w-md rounded-[6px] ${stepCircleContainerClassName}`}
        style={{ border: '1px solid var(--border-primary, rgb(238 238 238 / 0.08))' }}
      >
        <ol className={`${stepContainerClassName} flex w-full list-none items-center p-8`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                <li className="contents">
                  {renderStepIndicator ? (
                    renderStepIndicator({
                      step: stepNumber,
                      currentStep,
                      onStepClick: goTo
                    })
                  ) : (
                    <StepIndicator
                      step={stepNumber}
                      label={stepLabels?.[index]}
                      disableStepIndicators={disableStepIndicators}
                      currentStep={currentStep}
                      onClickStep={goTo}
                    />
                  )}
                </li>
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </ol>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          reduceMotion={reduceMotion}
          className={`space-y-2 px-8 ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`px-8 pb-8 ${footerClassName}`}>
            <div className={`mt-10 flex items-center ${currentStep !== 1 ? 'justify-between' : 'justify-end'}`}>
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-[3px] px-3 py-2 font-mono text-[0.75rem] text-fg-muted transition-colors duration-300 hover:text-fg"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              {!(isLastStep && hideCompleteButton) && (
                <button
                  type="button"
                  onClick={isLastStep ? handleComplete : handleNext}
                  className="flex items-center justify-center gap-2 rounded-[3px] border border-fg bg-fg px-6 py-3.5 font-mono text-[0.8125rem] font-semibold text-ink-950 transition-[background,color,transform] duration-200 hover:bg-fg/10 hover:text-fg active:scale-[0.97]"
                  {...nextButtonProps}
                >
                  {isLastStep ? completeButtonText : nextButtonText}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  reduceMotion: boolean;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  reduceMotion,
  children,
  className = ''
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  if (reduceMotion) {
    return <div className={className}>{!isCompleted && <div key={currentStep}>{children}</div>}</div>;
  }

  return (
    <motion.div
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}

function SlideTransition({ children, direction, onHeightReady }: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    onHeightReady(el.offsetHeight);
    // Track late height changes (validation messages, textarea resize).
    const ro = new ResizeObserver(() => onHeightReady(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '-100%' : '100%',
    opacity: 0
  }),
  center: {
    x: '0%',
    opacity: 1
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '50%' : '-50%',
    opacity: 0
  })
};

interface StepProps {
  children: ReactNode;
  className?: string;
}

export function Step({ children, className }: StepProps) {
  return <div className={className ?? 'px-8'}>{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label?: string;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}

function StepIndicator({ step, currentStep, label, onClickStep, disableStepIndicators = false }: StepIndicatorProps) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  const name = `Step ${step}${label ? `: ${label}` : ''}${status === 'complete' ? ' (done)' : ''}`;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={name}
      aria-current={status === 'active' ? 'step' : undefined}
      disabled={disableStepIndicators}
      className={`relative rounded-[3px] ${disableStepIndicators ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
      animate={status}
      initial={false}
    >
      <motion.span
        variants={{
          inactive: { scale: 1, backgroundColor: '#161616', color: '#a8a8a8' },
          active: { scale: 1, backgroundColor: ACTIVE, color: ACTIVE },
          complete: { scale: 1, backgroundColor: DONE, color: DONE }
        }}
        transition={{ duration: 0.3 }}
        className="flex h-8 w-8 items-center justify-center rounded-[3px] font-mono font-semibold ring-1 ring-line-strong"
      >
        {status === 'complete' ? (
          <CheckIcon className="h-4 w-4 text-ink-950" />
        ) : status === 'active' ? (
          <span className="h-3.5 w-2 bg-ink-950" />
        ) : (
          <span className="text-sm">{step}</span>
        )}
      </motion.span>
    </motion.button>
  );
}

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  const lineVariants: Variants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: DONE }
  };

  return (
    <li aria-hidden="true" className="relative mx-2 h-px flex-1 list-none overflow-hidden bg-ink-700">
      <motion.div
        className="absolute left-0 top-0 h-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </li>
  );
}

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon(props: CheckIconProps) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: 'tween',
          ease: 'easeOut',
          duration: 0.3
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
