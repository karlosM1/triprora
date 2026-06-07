import { cn } from '@/lib/utils'

const steps = [
  { id: 1, label: 'Passenger' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Confirm' },
] as const

type BookingStepperProps = {
  currentStep: 1 | 2 | 3
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="mx-auto flex max-w-md items-center justify-center px-4 py-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-sm font-semibold',
                step.id <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {step.id}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                step.id <= currentStep
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'mx-4 mb-5 h-0.5 w-16 sm:w-24',
                step.id < currentStep ? 'bg-primary' : 'bg-border',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
