import { User } from '../types';
import { DEMO_USERS, DEMO_STUDENT } from '../sampleData';

const CURRENT_USER_KEY = 'campusfix_current_user';
const ALL_USERS_KEY = 'campusfix_all_users';

/**
 * Retrieves the stored current user session from localStorage,
 * falling back to the default demo student.
 */
export function getStoredCurrentUser(): User {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.id && parsed.name) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read current user from localStorage', err);
  }
  return DEMO_STUDENT;
}

/**
 * Saves current active user into localStorage.
 */
export function setStoredCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to save current user to localStorage', err);
  }
}

/**
 * Retrieves all registered campus users stored locally,
 * seeding with demo users if first visit.
 */
export function getAllStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(ALL_USERS_KEY);
    if (data) {
      const parsed: User[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure standard demo users are always present in the list
        const ids = new Set(parsed.map((u) => u.id));
        const combined = [...parsed];
        for (const demo of DEMO_USERS) {
          if (!ids.has(demo.id)) {
            combined.push(demo);
          }
        }
        return combined;
      }
    }
  } catch (err) {
    console.error('Failed to read registered users from localStorage', err);
  }

  // Initial seed
  try {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(DEMO_USERS));
  } catch (err) {
    console.error('Failed to seed initial users', err);
  }
  return DEMO_USERS;
}

/**
 * Saves a newly registered or updated user into local storage and syncs to backend API.
 */
export async function saveUserInformation(user: User): Promise<User> {
  // 1. Update localStorage immediately
  const existingUsers = getAllStoredUsers();
  const existingIndex = existingUsers.findIndex(
    (u) => u.id === user.id || u.collegeId.toUpperCase() === user.collegeId.toUpperCase()
  );

  let updatedList: User[];
  if (existingIndex >= 0) {
    updatedList = existingUsers.map((u, idx) => (idx === existingIndex ? { ...u, ...user } : u));
  } else {
    updatedList = [user, ...existingUsers];
  }

  try {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedList));
    setStoredCurrentUser(user);
  } catch (err) {
    console.error('Failed to persist user to localStorage', err);
  }

  // 2. Synchronize to server-side API (non-blocking fallback)
  try {
    const endpoint = existingIndex >= 0 ? `/api/users/${user.id}` : '/api/users/register';
    const method = existingIndex >= 0 ? 'PUT' : 'POST';
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (serverErr) {
    console.warn('Server sync skipped/fallback:', serverErr);
  }

  return user;
}

/**
 * Authenticates user by College ID / Email and optional password.
 */
export async function authenticateUser(identifier: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();

  // Try API first
  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setStoredCurrentUser(data.user);
        // Ensure local list also has this user
        saveUserLocally(data.user);
        return { success: true, user: data.user };
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      // If server returned specific message, use it unless server offline
      if (res.status === 401 || res.status === 400 || res.status === 409) {
        return { success: false, error: errData.error || 'Invalid credentials.' };
      }
    }
  } catch (apiErr) {
    console.warn('API authentication unreachable, attempting local authentication', apiErr);
  }

  // Local fallback
  const allUsers = getAllStoredUsers();
  const match = allUsers.find(
    (u) =>
      u.collegeId.toLowerCase() === cleanId ||
      u.email.toLowerCase() === cleanId
  );

  if (!match) {
    return {
      success: false,
      error: `No campus user registered with ID or Email "${identifier}". Please register an account below.`,
    };
  }

  if (password && match.password && match.password !== password) {
    return {
      success: false,
      error: 'Incorrect institutional password. (Demo password: password123)',
    };
  }

  setStoredCurrentUser(match);
  return { success: true, user: match };
}

/**
 * Synchronizes stored users with the backend server API.
 */
export async function syncStoredUsersWithBackend(): Promise<void> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users) && data.users.length > 0) {
        const local = getAllStoredUsers();
        const localMap = new Map(local.map((u) => [u.id, u]));
        data.users.forEach((serverUser: User) => {
          localMap.set(serverUser.id, { ...localMap.get(serverUser.id), ...serverUser });
        });
        const merged = Array.from(localMap.values());
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(merged));
      }
    }
  } catch (err) {
    console.warn('Could not sync users with backend API:', err);
  }
}

function saveUserLocally(user: User): void {
  const users = getAllStoredUsers();
  const exists = users.some((u) => u.id === user.id);
  if (!exists) {
    try {
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify([user, ...users]));
    } catch (e) {
      console.error(e);
    }
  }
}
