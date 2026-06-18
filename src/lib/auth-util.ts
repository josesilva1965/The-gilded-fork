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
 */
export async function verifyUserPin(userId: string, pin: string): Promise<AuthenticatedUser | null> {
  if (!userId || !pin) return null;

  // If DATABASE_URL is missing, we are in fallback/demo mode
  if (!process.env.DATABASE_URL) {
    const mockUser = MOCK_USERS.find((u) => u.id === userId && u.pin === pin && u.active);
    if (mockUser) {
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
    const user = await db.user.findUnique({
      where: { id: userId, active: true },
    });
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
    // Fall back to mock users in case of temporary database outage
    const mockUser = MOCK_USERS.find((u) => u.id === userId && u.pin === pin && u.active);
    if (mockUser) {
      return {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
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
