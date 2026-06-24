import { count, like, eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { practices, appSettings } from '../../database/schema'

export function countPracticesByYear(year: number): number {
  const prefix = `${year}%`
  const [row] = getDb()
    .select({ cnt: count() })
    .from(practices)
    .where(like(practices.codiceIstanza, prefix))
    .all()
  return row?.cnt ?? 0
}

export function existsCodiceIstanza(code: string): boolean {
  const row = getDb()
    .select({ id: practices.id })
    .from(practices)
    .where(eq(practices.codiceIstanza, code))
    .get()
  return row != null
}

export function getSiglaCodice(): string {
  const row = getDb()
    .select({ siglaCodice: appSettings.siglaCodice })
    .from(appSettings)
    .get()
  return row?.siglaCodice ?? 'NP'
}
