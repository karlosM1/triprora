import { z } from 'zod'

const optionalNullableString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(120),
  phone: z
    .string()
    .trim()
    .max(20)
    .transform((value) => value || null),
  dateOfBirth: optionalNullableString(20),
  gender: optionalNullableString(30),
  nationality: optionalNullableString(60),
  houseStreet: optionalNullableString(200),
  barangay: optionalNullableString(100),
  city: optionalNullableString(100),
  province: optionalNullableString(100),
  zipCode: optionalNullableString(12),
  emergencyContactName: optionalNullableString(100),
  emergencyContactRelationship: optionalNullableString(50),
  emergencyContactPhone: optionalNullableString(20),
})

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>
