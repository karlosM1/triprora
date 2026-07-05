import { AuthField } from '@/components/auth/auth-field'
import { DocumentUploadField } from '@/components/driver/document-upload-field'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DriverRegistrationFormData } from '@/lib/types/driver-registration'
import { todayDateInputValue } from '@/lib/trip-search'
import { cn } from '@/lib/utils'

type StepProps = {
  form: DriverRegistrationFormData
  userId: string
  onChange: <K extends keyof DriverRegistrationFormData>(
    key: K,
    value: DriverRegistrationFormData[K],
  ) => void
}

const datePickerClassName =
  'h-11 rounded-xl bg-white px-4 ring-1 ring-[#d2d2d7] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

function FormDateField({
  label,
  value,
  onChange,
  min,
  max,
  placeholder = 'Select date',
  required,
  captionLayout = 'dropdown',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
  required?: boolean
  captionLayout?: 'label' | 'dropdown'
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
        {label}
        {required && <span className="text-[#b42318]"> *</span>}
      </span>
      <DatePicker
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        placeholder={placeholder}
        captionLayout={captionLayout}
        className={datePickerClassName}
      />
    </div>
  )
}

function GenderSelectField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
        Gender <span className="text-[#b42318]">*</span>
      </span>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            '!h-11 min-h-11 w-full rounded-xl border-0 bg-white px-4 py-0 text-[15px] text-[#1d1d1f] shadow-none ring-1 ring-[#d2d2d7]',
            'focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-[#0071e3]/40',
            !value && 'text-[#86868b]',
          )}
        >
          <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-[#d2d2d7]">
          {GENDER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-[15px]">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function NumericField({
  label,
  value,
  onChange,
  placeholder,
  required,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  maxLength?: number
}) {
  const fieldId = label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
        {label}
        {required && <span className="text-[#b42318]"> *</span>}
      </span>
      <input
        id={fieldId}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder}
        value={value}
        required={required}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
        className={cn(
          'h-11 w-full rounded-xl bg-white px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/70 ring-1 ring-[#d2d2d7] transition-all outline-none',
          'focus:ring-2 focus:ring-[#0071e3]/40 focus:ring-offset-0',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        )}
      />
    </label>
  )
}

function ConsentCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#d2d2d7] bg-[#fafafa] p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-[#d2d2d7] accent-[#0071e3]"
      />
      <span className="text-[14px] leading-relaxed text-[#1d1d1f]">{label}</span>
    </label>
  )
}

export function PersonalInfoStep({ form, userId, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          label="First name"
          placeholder="Juan"
          value={form.firstName}
          onChange={(value) => onChange('firstName', value)}
          required
        />
        <AuthField
          label="Middle name (optional)"
          placeholder="Santos"
          value={form.middleName}
          onChange={(value) => onChange('middleName', value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          label="Last name"
          placeholder="Dela Cruz"
          value={form.lastName}
          onChange={(value) => onChange('lastName', value)}
          required
        />
        <AuthField
          label="Suffix (optional)"
          placeholder="Jr., Sr., III"
          value={form.suffix}
          onChange={(value) => onChange('suffix', value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormDateField
          label="Date of birth"
          value={form.dateOfBirth}
          onChange={(value) => onChange('dateOfBirth', value)}
          max={todayDateInputValue()}
          placeholder="Select date of birth"
          required
        />
        <GenderSelectField
          value={form.gender}
          onChange={(value) => onChange('gender', value)}
        />
      </div>
      <AuthField
        label="Nationality"
        placeholder="Filipino"
        value={form.nationality}
        onChange={(value) => onChange('nationality', value)}
        required
      />
      <DocumentUploadField
        label="Profile photo (optional)"
        hint="Clear photo of your face for verification."
        value={form.profilePhotoUrl}
        userId={userId}
        category="profile-photo"
        accept="image/jpeg,image/png,image/webp"
        onChange={(url) => onChange('profilePhotoUrl', url)}
      />
    </div>
  )
}

export function ContactInfoStep({ form, onChange }: Omit<StepProps, 'userId'>) {
  return (
    <div className="space-y-5">
      <AuthField
        label="Mobile number"
        type="tel"
        placeholder="+63 912 345 6789"
        value={form.phone}
        onChange={(value) => onChange('phone', value)}
        autoComplete="tel"
        required
      />
      <AuthField
        label="Email address"
        type="email"
        value={form.email}
        onChange={(value) => onChange('email', value)}
        autoComplete="email"
        disabled
        required
      />
      <p className="text-[12px] text-[#86868b]">
        Email is linked to your account and cannot be changed here.
      </p>
      <AuthField
        label="House number / street"
        placeholder="123 Rizal Street"
        value={form.houseStreet}
        onChange={(value) => onChange('houseStreet', value)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          label="Barangay"
          placeholder="Poblacion"
          value={form.barangay}
          onChange={(value) => onChange('barangay', value)}
          required
        />
        <AuthField
          label="City / municipality"
          placeholder="Baler"
          value={form.city}
          onChange={(value) => onChange('city', value)}
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          label="Province"
          placeholder="Aurora"
          value={form.province}
          onChange={(value) => onChange('province', value)}
          required
        />
        <AuthField
          label="ZIP code"
          placeholder="3200"
          value={form.zipCode}
          onChange={(value) => onChange('zipCode', value)}
          required
        />
      </div>
    </div>
  )
}

export function LicenseInfoStep({ form, userId, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <AuthField
        label="Driver's license number"
        placeholder="N01-12-345678"
        value={form.licenseNo}
        onChange={(value) => onChange('licenseNo', value)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          label="License type / restriction code"
          placeholder="A, A1, B, etc."
          value={form.licenseType}
          onChange={(value) => onChange('licenseType', value)}
          required
        />
        <FormDateField
          label="License expiration date"
          value={form.licenseExpiration}
          onChange={(value) => onChange('licenseExpiration', value)}
          min={todayDateInputValue()}
          placeholder="Select expiration date"
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <DocumentUploadField
          label="Front of license"
          value={form.licenseFrontUrl}
          userId={userId}
          category="license-front"
          required
          onChange={(url) => onChange('licenseFrontUrl', url)}
        />
        <DocumentUploadField
          label="Back of license"
          value={form.licenseBackUrl}
          userId={userId}
          category="license-back"
          required
          onChange={(url) => onChange('licenseBackUrl', url)}
        />
      </div>
    </div>
  )
}

export function VehicleInfoStep({ form, userId, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[#86868b]">
        Provide details for the van you own and will use for trips.
      </p>
      <AuthField
        label="Vehicle plate number"
        placeholder="ABC 1234"
        value={form.vehiclePlateNumber}
        onChange={(value) => onChange('vehiclePlateNumber', value)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          label="Vehicle make"
          placeholder="Toyota"
          value={form.vehicleMake}
          onChange={(value) => onChange('vehicleMake', value)}
          required
        />
        <AuthField
          label="Vehicle model"
          placeholder="Hiace"
          value={form.vehicleModel}
          onChange={(value) => onChange('vehicleModel', value)}
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <NumericField
          label="Vehicle year"
          placeholder="2020"
          value={form.vehicleYear}
          onChange={(value) => onChange('vehicleYear', value)}
          maxLength={4}
          required
        />
        <AuthField
          label="Vehicle color"
          placeholder="White"
          value={form.vehicleColor}
          onChange={(value) => onChange('vehicleColor', value)}
          required
        />
        <NumericField
          label="Passenger capacity"
          placeholder="14"
          value={form.vehicleCapacity}
          onChange={(value) => onChange('vehicleCapacity', value)}
          maxLength={2}
          required
        />
      </div>
      <DocumentUploadField
        label="Vehicle photo"
        hint="Photo showing the full van with plate number visible."
        value={form.vehiclePhotoUrl}
        userId={userId}
        category="vehicle-photo"
        accept="image/jpeg,image/png,image/webp"
        onChange={(url) => onChange('vehiclePhotoUrl', url)}
      />
    </div>
  )
}

export function VehicleDocumentsStep({ form, userId, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <DocumentUploadField
        label="Certificate of Registration (CR)"
        value={form.crDocumentUrl}
        userId={userId}
        category="cr"
        required
        onChange={(url) => onChange('crDocumentUrl', url)}
      />
      <DocumentUploadField
        label="Official Receipt (OR)"
        value={form.orDocumentUrl}
        userId={userId}
        category="or"
        required
        onChange={(url) => onChange('orDocumentUrl', url)}
      />
      <DocumentUploadField
        label="Insurance document"
        value={form.insuranceDocumentUrl}
        userId={userId}
        category="insurance"
        required
        onChange={(url) => onChange('insuranceDocumentUrl', url)}
      />
      <DocumentUploadField
        label="Vehicle inspection certificate (if applicable)"
        value={form.inspectionDocumentUrl}
        userId={userId}
        category="inspection"
        onChange={(url) => onChange('inspectionDocumentUrl', url)}
      />
    </div>
  )
}

export function EmergencyContactStep({ form, onChange }: Omit<StepProps, 'userId'>) {
  return (
    <div className="space-y-5">
      <AuthField
        label="Full name"
        placeholder="Maria Dela Cruz"
        value={form.emergencyContactName}
        onChange={(value) => onChange('emergencyContactName', value)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          label="Relationship"
          placeholder="Spouse, parent, sibling"
          value={form.emergencyContactRelationship}
          onChange={(value) => onChange('emergencyContactRelationship', value)}
          required
        />
        <AuthField
          label="Contact number"
          type="tel"
          placeholder="+63 912 345 6789"
          value={form.emergencyContactPhone}
          onChange={(value) => onChange('emergencyContactPhone', value)}
          required
        />
      </div>
    </div>
  )
}

export function AccountInfoStep({ form }: Pick<StepProps, 'form'>) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[#86868b]">
        Your account credentials were set when you signed up. Confirm the email linked to this
        application.
      </p>
      <AuthField
        label="Email"
        type="email"
        value={form.email}
        onChange={() => undefined}
        disabled
        required
      />
      <div className="rounded-xl border border-[#d2d2d7] bg-[#fafafa] p-4 text-[13px] leading-relaxed text-[#86868b]">
        Password changes are managed from your account settings. You do not need to re-enter your
        password to apply as a driver.
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 border-b border-[#f0f0f0] py-2 last:border-0">
      <dt className="text-[#86868b]">{label}</dt>
      <dd className="text-right font-medium text-[#1d1d1f]">{value}</dd>
    </div>
  )
}

export function ReviewConsentStep({ form, onChange }: Omit<StepProps, 'userId'>) {
  const fullName = [form.firstName, form.middleName, form.lastName, form.suffix]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#d2d2d7] bg-[#fafafa] p-4">
        <h3 className="text-[14px] font-semibold text-[#1d1d1f]">Review your application</h3>
        <dl className="mt-3 text-[13px]">
          <ReviewRow label="Name" value={fullName} />
          <ReviewRow label="Phone" value={form.phone} />
          <ReviewRow label="Email" value={form.email} />
          <ReviewRow label="Address" value={`${form.houseStreet}, ${form.barangay}, ${form.city}, ${form.province} ${form.zipCode}`} />
          <ReviewRow label="License" value={`${form.licenseNo} (${form.licenseType})`} />
          <ReviewRow
            label="Vehicle"
            value={`${form.vehicleMake} ${form.vehicleModel} ${form.vehicleYear} · ${form.vehiclePlateNumber}`}
          />
          <ReviewRow label="Emergency contact" value={`${form.emergencyContactName} (${form.emergencyContactRelationship})`} />
        </dl>
      </div>

      <div className="space-y-3">
        <ConsentCheckbox
          label="I certify that the information provided is true."
          checked={form.certifyInfo}
          onChange={(checked) => onChange('certifyInfo', checked)}
        />
        <ConsentCheckbox
          label="I agree to the Terms and Conditions."
          checked={form.agreeTerms}
          onChange={(checked) => onChange('agreeTerms', checked)}
        />
        <ConsentCheckbox
          label="I agree to the Privacy Policy."
          checked={form.agreePrivacy}
          onChange={(checked) => onChange('agreePrivacy', checked)}
        />
      </div>

      <p className="text-[13px] text-[#86868b]">
        After submission, your status will be <strong className="text-[#1d1d1f]">Pending Verification</strong>.
        An admin will review your documents before you can accept bookings.
      </p>
    </div>
  )
}

export const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: 'Personal information',
    subtitle: 'Tell us who you are so we can verify your identity.',
  },
  2: {
    title: 'Contact information',
    subtitle: 'How we can reach you and your home address.',
  },
  3: {
    title: "Driver's license",
    subtitle: 'Your driving qualifications and license documents.',
  },
  4: {
    title: 'Vehicle information',
    subtitle: 'Details about the van you own and operate.',
  },
  5: {
    title: 'Vehicle documents',
    subtitle: 'Upload registration, receipt, and insurance documents.',
  },
  6: {
    title: 'Emergency contact',
    subtitle: 'Someone we can reach in case of emergency.',
  },
  7: {
    title: 'Account',
    subtitle: 'Confirm the account linked to this application.',
  },
  8: {
    title: 'Verification & consent',
    subtitle: 'Review your details and submit for admin approval.',
  },
}
