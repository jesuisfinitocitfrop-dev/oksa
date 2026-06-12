import type { SupabaseClient } from '@supabase/supabase-js'

// Configs du site stockées en JSON dans Supabase Storage :
// aucune table ni migration SQL nécessaire, la clé service suffit.
const BUCKET = 'site-config'

// Lecture en fetch direct avec cache: 'no-store' : Next.js met sinon en cache
// la réponse GET du storage et les changements admin ne sont jamais visibles.
export async function readSiteConfig<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${key}`,
      {
        headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    return (await res.json()) as T
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
    cacheControl: '0',
  })
  return error ? error.message : null
}
