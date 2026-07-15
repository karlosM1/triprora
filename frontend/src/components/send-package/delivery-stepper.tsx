import { cn } from '@/lib/utils'

const steps = [
  { id: 1, label: 'Trip' },
  { id: 2, label: 'Package' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Confirmed' },
] as const

type DeliveryStepperProps = {
  currentStep: 1 | 2 | 3 | 4
}

export function DeliveryStepper({ currentStep }: DeliveryStepperProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className="flex shrink-0 items-center gap-1.5 sm:gap-3"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors',
                step.id <= currentStep
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#e8e8ed] text-[#86868b]',
              )}
            >
              {step.id}
            </span>
            <span
              className={cn(
                'hidden whitespace-nowrap text-[13px] font-medium sm:inline',
                step.id <= currentStep ? 'text-[#1d1d1f]' : 'text-[#86868b]',
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-px w-4 sm:w-8',
                step.id < currentStep ? 'bg-[#1d1d1f]' : 'bg-[#d2d2d7]',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
