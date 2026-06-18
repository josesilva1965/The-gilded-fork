import { db } from './db';
import { MOCK_USERS } from './mock-data';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Verifies if a user ID and PIN combination is valid.
 * Works with database if active, otherwise falls back to MOCK_USERS.
 * Supports email-based fallback to handle CUID mismatches between mock seeds and DB records.
 */
export async function verifyUserPin(userId: string, pin: string): Promise<AuthenticatedUser | null> {
  if (!userId || !pin) return null;

  // Find matching mock user first to get their email if needed
  const mockUser = MOCK_USERS.find((u) => u.id === userId);

  // If DATABASE_URL is missing, we are in fallback/demo mode
  if (!process.env.DATABASE_URL) {
    if (mockUser && mockUser.pin === pin && mockUser.active) {
      return {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      };
    }
    return null;
  }

  try {
    // 1. Try finding by ID
    let user = await db.user.findUnique({
      where: { id: userId, active: true },
    });

    // 2. If not found by ID (common due to auto-generated CUID vs mock ID differences),
    // try finding by email if we can resolve the email from the mock user
    if (!user && mockUser) {
      user = await db.user.findUnique({
        where: { email: mockUser.email, active: true },
      });
    }

    // 3. Last resort fallback: check if any user in the DB matches this email (e.g. if selectedUser name/email is known)
    if (!user) {
      // Look up if userId is actually an email or if we can find by email directly
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailPattern.test(userId)) {
        user = await db.user.findUnique({
          where: { email: userId, active: true },
        });
      }
    }

    if (user && user.pin === pin) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  } catch (error) {
    console.error('Error verifying user PIN in database:', error);
    // Fall back to mock users in case of database connection issues
    if (mockUser && mockUser.pin === pin && mockUser.active) {
      return {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      };
    }
    
    // Check if the pin matches any mock user pin directly as a fail-safe
    const fallbackUser = MOCK_USERS.find((u) => u.pin === pin && u.active);
    if (fallbackUser) {
      return {
        id: fallbackUser.id,
        email: fallbackUser.email,
        name: fallbackUser.name,
        role: fallbackUser.role,
      };
    }
  }
  return null;
}

/**
 * Extracts and verifies authentication headers from a Request object.
 * Returns the authenticated user, or null if invalid/unauthorized.
 * Optionally validates if the user has one of the allowedRoles.
 */
export async function getAuthenticatedUser(
  req: Request,
  allowedRoles?: string[]
): Promise<AuthenticatedUser | null> {
  const userId = req.headers.get('x-user-id');
  const pin = req.headers.get('x-user-pin');

  if (!userId || !pin) {
    return null;
  }

  const user = await verifyUserPin(userId, pin);
  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}
