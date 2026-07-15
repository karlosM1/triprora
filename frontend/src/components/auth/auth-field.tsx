import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type AuthFieldProps = {
  label: string
  onChange: (value: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'className'>

export function AuthField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
  id,
  ...props
}: AuthFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
        {label}
      </span>
      <input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          // text-base (16px) prevents iOS Safari auto-zoom on focus
          'h-11 w-full rounded-xl bg-white px-4 text-base text-[#1d1d1f] placeholder:text-[#86868b]/70 ring-1 ring-[#d2d2d7] transition-all outline-none',
          'focus:ring-2 focus:ring-[#0071e3]/40 focus:ring-offset-0',
        )}
        {...props}
      />
    </label>
  )
}
