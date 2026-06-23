import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './main/database/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
  // Usato solo da drizzle-kit push/studio; le migrazioni runtime leggono da app.getPath('userData')
  dbCredentials: { url: './dev.db' }
})
