import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive dir since we are in ES Module
const __filename = typeof window === 'undefined' ? fileURLToPath(import.meta.url) : '';
const __dirname = typeof window === 'undefined' ? path.dirname(__filename) : '';

/**
 * Executes the SQL migration file directly on user's Supabase PostgreSQL instance.
 * @param connectionString PostgreSQL connection URI (e.g. postgres://postgres:password@db.supabase.co:5432/postgres)
 */
export async function applySqlMigrations(connectionString: string): Promise<{ success: boolean; message: string }> {
  // Only execute on Node / Server-side
  if (typeof window !== 'undefined') {
    return { success: false, message: 'Fungsi ini hanya dapat dijalankan di sisi server (backend).' };
  }

  const { Client } = pg;
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase databases
  });

  try {
    await client.connect();

    // Locating our migrations SQL file under packages/supabase/migrations/policies.sql
    let sqlPath = path.join(process.cwd(), 'packages/supabase/migrations/policies.sql');
    if (!fs.existsSync(sqlPath)) {
      // Try resolving relative to this file
      sqlPath = path.join(__dirname, '../migrations/policies.sql');
    }

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration SQL file not found at matching paths. Checked: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Executing the entire script
    await client.query(sqlContent);

    await client.end();
    return { success: true, message: 'Struktur tabel, trigger, dan kebijakan RLS Supabase berhasil dibuat!' };
  } catch (error: any) {
    console.error('Error during migration execution:', error);
    try {
      await client.end();
    } catch {}
    return { success: false, message: error.message || String(error) };
  }
}
