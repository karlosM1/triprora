import { cn } from '@/lib/utils'
import { DRIVER_REGISTRATION_STEPS } from '@/lib/types/driver-registration'

type DriverRegistrationStepperProps = {
  currentStep: number
}

export function DriverRegistrationStepper({ currentStep }: DriverRegistrationStepperProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-center justify-center gap-1 sm:gap-2">
        {DRIVER_REGISTRATION_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors sm:text-[12px]',
                  step.id <= currentStep
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-[#e8e8ed] text-[#86868b]',
                )}
              >
                {step.id}
              </span>
              <span
                className={cn(
                  'hidden text-[12px] font-medium lg:inline',
                  step.id <= currentStep ? 'text-[#1d1d1f]' : 'text-[#86868b]',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < DRIVER_REGISTRATION_STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-4 sm:w-6',
                  step.id < currentStep ? 'bg-[#1d1d1f]' : 'bg-[#d2d2d7]',
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
