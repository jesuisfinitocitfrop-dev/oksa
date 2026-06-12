import type { SupabaseClient } from '@supabase/supabase-js'

// Configs du site stockées en JSON dans Supabase Storage :
// aucune table ni migration SQL nécessaire, la clé service suffit.
const BUCKET = 'site-config'

export async function readSiteConfig<T>(db: SupabaseClient, key: string): Promise<T | null> {
  try {
    const { data, error } = await db.storage.from(BUCKET).download(key)
    if (error || !data) return null
    return JSON.parse(await data.text()) as T
  } catch {
    return null
  }
}

export async function writeSiteConfig(db: SupabaseClient, key: string, value: unknown): Promise<string | null> {
  // crée le bucket au premier usage (l'erreur « existe déjà » est ignorée)
  await db.storage.createBucket(BUCKET, { public: false }).catch(() => null)
  const { error } = await db.storage.from(BUCKET).upload(key, JSON.stringify(value), {
    upsert: true,
    contentType: 'application/json',
  })
  return error ? error.message : null
}
