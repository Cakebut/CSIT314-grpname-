import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://crashout_user:crashout_password@localhost:5433/crashout_db';

// Initialize a single pg Pool and export it so other modules can reuse it
export const pool = new Pool({ connectionString: DATABASE_URL });

// Export the drizzle db instance
export const db = drizzle(pool);
