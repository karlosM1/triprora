import { cn } from '@/lib/utils'

const steps = [
  { id: 1, label: 'Your trip' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Confirmed' },
] as const

type BookingStepperProps = {
  currentStep: 1 | 2 | 3
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-[12px] font-semibold transition-colors',
                step.id <= currentStep
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#e8e8ed] text-[#86868b]',
              )}
            >
              {step.id}
            </span>
            <span
              className={cn(
                'hidden text-[13px] font-medium sm:inline',
                step.id <= currentStep ? 'text-[#1d1d1f]' : 'text-[#86868b]',
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-px w-8 sm:w-12',
                step.id < currentStep ? 'bg-[#1d1d1f]' : 'bg-[#d2d2d7]',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
