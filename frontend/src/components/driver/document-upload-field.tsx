import { useRef, useState } from 'react'
import { FileText, ImagePlus, Loader2, X } from 'lucide-react'
import { uploadDriverDocument } from '@/lib/upload-driver-document'
import { cn } from '@/lib/utils'

type DocumentUploadFieldProps = {
  label: string
  hint?: string
  value: string
  userId: string
  category: string
  accept?: string
  required?: boolean
  onChange: (url: string) => void
}

export function DocumentUploadField({
  label,
  hint,
  value,
  userId,
  category,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  required,
  onChange,
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const url = await uploadDriverDocument(file, userId, category)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isPdf = value.toLowerCase().includes('.pdf')

  return (
    <div className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
        {label}
        {required && <span className="text-[#b42318]"> *</span>}
      </span>
      {hint && <p className="mb-2 text-[12px] text-[#86868b]">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#d2d2d7] bg-[#fafafa] p-3">
          {isPdf ? (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#f0f7ff] text-[#0066cc]">
              <FileText className="size-5" />
            </div>
          ) : (
            <img
              src={value}
              alt={label}
              className="size-12 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[#1d1d1f]">Uploaded</p>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] text-[#0066cc] hover:underline"
            >
              View file
            </a>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-full p-1.5 text-[#86868b] transition-colors hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
            aria-label={`Remove ${label}`}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d2d2d7] bg-white px-4 py-6 text-[13px] text-[#86868b] transition-colors',
            'hover:border-[#0066cc] hover:text-[#0066cc]',
            uploading && 'cursor-wait opacity-70',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="size-4" />
              Choose image or PDF
            </>
          )}
        </button>
      )}

      {error && <p className="mt-2 text-[12px] text-[#b42318]">{error}</p>}
    </div>
  )
}
