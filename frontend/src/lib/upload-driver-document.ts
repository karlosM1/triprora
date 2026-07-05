import { supabase } from '@/lib/supabase'

const BUCKET = 'driver-documents'
const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export async function uploadDriverDocument(file: File, userId: string, category: string) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Upload a JPG, PNG, WebP, or PDF file.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File must be 10 MB or smaller.')
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${userId}/${category}/${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    const message = error.message || 'Failed to upload file.'
    if (message.includes('Bucket not found')) {
      throw new Error(
        'Document storage is not configured. Ask an admin to run npm run storage:setup in the backend.',
      )
    }
    throw new Error(message)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
