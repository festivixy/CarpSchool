import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const CLERK_LOAD_TIMEOUT_MS = 15000;

/**
 * Get Clerk publishable key from public settings
 * Returns the publishable key directly
 */
export function getClerkPublishableKey() {
  const publishableKey = Meteor.settings?.public?.clerk?.publishableKey;

  if (!publishableKey) {
    throw new Error("Clerk publishable key not configured. Set clerk.publishableKey in settings.json public section.");
  }

  return publishableKey;
}

/**
 * Hook to get Clerk publishable key
 * Returns { publishableKey, loading, error }
 */
export function useClerkPublishableKey() {
  const [publishableKey, setPublishableKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const key = getClerkPublishableKey();
      setPublishableKey(key);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, []);

  return { publishableKey, loading, error };
}

/**
 * Clerk-Meteor integration hook
 * Provides Meteor user data based on Clerk session
 */
/**
 * Exchange a Clerk session token for a Meteor session.
 *
 * Clerk alone never logged Meteor in, so Meteor.userId() stayed null and every
 * publication and method that gates on this.userId silently returned nothing.
 * The server verifies the token before honouring it; see
 * imports/api/accounts/ClerkLoginHandler.js.
 */
export const loginToMeteorWithClerk = getToken => new Promise((resolve, reject) => {
  getToken()
    .then((clerkToken) => {
      if (!clerkToken) {
        reject(new Error("No Clerk session token available"));
        return;
      }
      Accounts.callLoginMethod({
        methodArguments: [{ type: "clerk", clerkToken }],
        userCallback: (err) => (err ? reject(err) : resolve()),
      });
    })
    .catch(reject);
});

// Module-level cache of in-flight "log in to Meteor + fetch the Meteor user"
// promises, keyed by Clerk user id. Several route wrappers can call
// useClerkUser() concurrently on first load; without this each one would
// kick off its own Accounts.callLoginMethod/Meteor.call round trip.
const meteorUserPromiseCache = new Map();

function getMeteorUserForClerkUser(clerkUserId, getToken) {
  const cached = meteorUserPromiseCache.get(clerkUserId);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    if (!Meteor.userId()) {
      await loginToMeteorWithClerk(getToken);
    }

    return new Promise((resolve, reject) => {
      Meteor.call("clerk.getMeteorUser", clerkUserId, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  })();

  meteorUserPromiseCache.set(clerkUserId, promise);
  promise.catch(() => {
    meteorUserPromiseCache.delete(clerkUserId);
  });

  return promise;
}

/**
 * Clears a Meteor session that has outlived its Clerk one.
 *
 * Clerk is the source of truth. A Meteor session can survive it -- the Clerk
 * session expiring, a sign-out in another tab, or a sign-out on a page that
 * never mounted this reconciliation. While it does, the server still honours
 * that session and the UI reads the account as present, which is how signed-out
 * visitors were being shown the admin menus.
 *
 * Mount this once at the root so it runs on public routes too; useClerkUser
 * also calls it for the screens behind the auth gate.
 */
export function useClerkMeteorSessionSync() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn && Meteor.userId()) {
      Meteor.logout();
    }
  }, [isLoaded, isSignedIn]);
}

export function useClerkUser() {
  const { isSignedIn, userId: clerkUserId, isLoaded: clerkLoaded, getToken } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [meteorUser, setMeteorUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timedOut, setTimedOut] = useState(false);

  // If Clerk never finishes loading, stop spinning forever and surface it.
  useEffect(() => {
    if (clerkLoaded) {
      setTimedOut(false);
      return undefined;
    }

    const timer = setTimeout(() => setTimedOut(true), CLERK_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [clerkLoaded]);

  // Clerk signed out from under us (e.g. session expired in another tab)
  // while Meteor still thinks we're logged in - clean that up.
  useClerkMeteorSessionSync();

  useEffect(() => {
    let cancelled = false;

    async function fetchMeteorUser() {
      if (!isSignedIn || !clerkUserId) {
        setMeteorUser(null);
        setError(null);
        setLoading(false);
        return;
      }

      // First check if we already have the user cached
      const cachedUser = Meteor.user();
      if (cachedUser?.profile?.clerkUserId === clerkUserId) {
        setMeteorUser(cachedUser);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        const result = await getMeteorUserForClerkUser(clerkUserId, getToken);
        if (cancelled) return;
        setMeteorUser(result);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to get Meteor user:", err);
        setMeteorUser(null);
        setError(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (clerkLoaded) {
      fetchMeteorUser();
    }

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, clerkUserId, clerkLoaded, getToken]);

  return {
    isLoaded: clerkLoaded && userLoaded && !loading,
    isSignedIn,
    clerkUserId,
    clerkUser,
    meteorUser,
    user: meteorUser, // Alias for compatibility
    error,
    timedOut,
  };
}

/**
 * Check if user has a specific role
 */
export function useHasRole(role) {
  const { meteorUser } = useClerkUser();
  if (!meteorUser?.roles) return false;
  return meteorUser.roles.includes(role);
}

/**
 * Hook to check if user is system admin
 */
export function useIsSystemAdmin() {
  const { meteorUser } = useClerkUser();
  if (!meteorUser?.roles) return false;
  return meteorUser.roles.includes("system");
}

/**
 * Hook to check if user has any admin role (system or school-specific)
 */
export function useIsAdmin() {
  const { meteorUser } = useClerkUser();
  if (!meteorUser?.roles) return false;

  // Check for system role
  if (meteorUser.roles.includes("system")) return true;

  // Check for any school admin role
  return meteorUser.roles.some(role => role.startsWith("admin."));
}

/**
 * Hook to check if user is admin of a specific school
 */
export function useIsSchoolAdmin(schoolId = null) {
  const { meteorUser } = useClerkUser();
  if (!meteorUser?.roles) return false;

  // If no schoolId provided, check if user is admin of their own school
  const targetSchoolId = schoolId || meteorUser.schoolId;
  if (!targetSchoolId) return false;

  return meteorUser.roles.includes(`admin.${targetSchoolId}`);
}

/**
 * Hook to get current user ID (Meteor ID)
 */
export function useUserId() {
  const { meteorUser } = useClerkUser();
  return meteorUser?._id || null;
}

/**
 * Hook to check if user is logged in (Meteor session)
 */
export function useIsLoggedIn() {
  const { isSignedIn, meteorUser } = useClerkUser();
  return isSignedIn && !!meteorUser;
}
