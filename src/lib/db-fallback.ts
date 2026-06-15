import { db } from './db';

export async function safeDbCall<T>(queryFn: () => Promise<T>, fallback: T): Promise<T> {
  // Check if DATABASE_URL is set at all. If not, bypass early.
  if (!process.env.DATABASE_URL) {
    console.warn('⚡ DATABASE_URL environment variable is missing. Running in mock demo mode.');
    return fallback;
  }

  try {
    // Attempt the actual database query
    return await queryFn();
  } catch (error: any) {
    console.error('⚠️ Database connection failed or query error. Falling back to mock demo data:', error.message || error);
    return fallback;
  }
}
