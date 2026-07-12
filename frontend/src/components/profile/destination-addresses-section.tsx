import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AuthAlert } from '@/components/auth/auth-layout'
import { AuthField } from '@/components/auth/auth-field'
import { Button } from '@/components/ui/button'
import {
  createDestinationAddress,
  deleteDestinationAddress,
  destinationAddressesQueryKey,
  fetchDestinationAddresses,
  updateDestinationAddress,
} from '@/lib/api/destination-addresses'
import { formatProfileAddress } from '@/lib/format-profile-address'
import type {
  DestinationAddress,
  DestinationAddressPayload,
} from '@/lib/types/profile'
import { cn } from '@/lib/utils'

const EMPTY_FORM: DestinationAddressPayload = {
  label: '',
  houseStreet: '',
  barangay: '',
  city: '',
  province: '',
  zipCode: '',
}

function addressToForm(address: DestinationAddress): DestinationAddressPayload {
  return {
    label: address.label,
    houseStreet: address.houseStreet,
    barangay: address.barangay ?? '',
    city: address.city,
    province: address.province,
    zipCode: address.zipCode ?? '',
  }
}

type DestinationAddressesSectionProps = {
  enabled: boolean
  className?: string
}

export function DestinationAddressesSection({
  enabled,
  className,
}: DestinationAddressesSectionProps) {
  const queryClient = useQueryClient()
  const destinationsQuery = useQuery({
    queryKey: destinationAddressesQueryKey,
    queryFn: fetchDestinationAddresses,
    enabled,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DestinationAddressPayload>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  const destinations = destinationsQuery.data ?? []

  const saveMutation = useMutation({
    mutationFn: async (payload: DestinationAddressPayload) => {
      if (editingId) {
        return updateDestinationAddress(editingId, payload)
      }
      return createDestinationAddress(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: destinationAddressesQueryKey })
      closeForm()
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setError(
        err.response?.data?.message ??
          'Unable to save destination address. Please try again.',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDestinationAddress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: destinationAddressesQueryKey })
    },
    onError: () => {
      setError('Unable to delete destination address. Please try again.')
    },
  })

  function openCreateForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
    setFormOpen(true)
  }

  function openEditForm(address: DestinationAddress) {
    setEditingId(address.id)
    setForm(addressToForm(address))
    setError(null)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
  }

  function updateField<K extends keyof DestinationAddressPayload>(
    key: K,
    value: DestinationAddressPayload[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (
      !form.label.trim() ||
      !form.houseStreet.trim() ||
      !form.city.trim() ||
      !form.province.trim()
    ) {
      setError('Please fill in the label, street, city, and province.')
      return
    }

    saveMutation.mutate({
      label: form.label.trim(),
      houseStreet: form.houseStreet.trim(),
      barangay: form.barangay.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      zipCode: form.zipCode.trim(),
    })
  }

  return (
    <div className={cn('text-left', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-[#1d1d1f]">
            Destination addresses
          </h3>
          <p className="mt-0.5 text-[12px] leading-snug text-[#86868b]">
            Saved drop-offs for booking suggestions.
          </p>
        </div>
        {!formOpen && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-[#0066cc] hover:bg-[#0071e3]/5"
            onClick={openCreateForm}
            disabled={destinations.length >= 10}
            aria-label="Add destination"
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      )}

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 space-y-3 rounded-xl bg-[#f5f5f7] p-3 ring-1 ring-black/5"
        >
          <p className="text-[12px] font-medium text-[#1d1d1f]">
            {editingId ? 'Edit destination' : 'New destination'}
          </p>

          <AuthField
            label="Label"
            value={form.label}
            onChange={(value) => updateField('label', value)}
            placeholder="Office, School..."
          />
          <AuthField
            label="House no. / Street"
            value={form.houseStreet}
            onChange={(value) => updateField('houseStreet', value)}
            placeholder="123 EDSA"
          />
          <AuthField
            label="Barangay"
            value={form.barangay}
            onChange={(value) => updateField('barangay', value)}
          />
          <AuthField
            label="City / Municipality"
            value={form.city}
            onChange={(value) => updateField('city', value)}
            placeholder="Quezon City"
          />
          <AuthField
            label="Province"
            value={form.province}
            onChange={(value) => updateField('province', value)}
            placeholder="Metro Manila"
          />
          <AuthField
            label="ZIP code"
            value={form.zipCode}
            onChange={(value) => updateField('zipCode', value)}
            placeholder="1100"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="h-8 rounded-full bg-[#0071e3] px-3 text-[12px] font-normal hover:bg-[#0077ed]"
            >
              {saveMutation.isPending
                ? 'Saving...'
                : editingId
                  ? 'Save'
                  : 'Add'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-full px-3 text-[12px] text-[#86868b]"
              onClick={closeForm}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-3 space-y-2">
        {destinationsQuery.isLoading ? (
          <p className="text-[12px] text-[#86868b]">Loading...</p>
        ) : destinations.length === 0 && !formOpen ? (
          <p className="rounded-xl border border-dashed border-[#d2d2d7] px-3 py-4 text-center text-[12px] text-[#86868b]">
            No destinations yet. Tap + to add one.
          </p>
        ) : (
          destinations.map((destination) => {
            const formatted = formatProfileAddress(destination)
            return (
              <div
                key={destination.id}
                className="rounded-xl bg-[#f5f5f7] px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#1d1d1f]">
                      {destination.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#86868b]">
                      {formatted ??
                        `${destination.houseStreet}, ${destination.city}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-[#0066cc] hover:bg-[#0071e3]/5"
                      onClick={() => openEditForm(destination)}
                      aria-label={`Edit ${destination.label}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-[#bf4800] hover:bg-[#fff2f2]"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        setError(null)
                        deleteMutation.mutate(destination.id)
                      }}
                      aria-label={`Delete ${destination.label}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
