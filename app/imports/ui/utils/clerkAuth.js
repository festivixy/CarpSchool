import { Meteor } from "meteor/meteor";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

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
export function useClerkUser() {
  const { isSignedIn, userId: clerkUserId, isLoaded: clerkLoaded } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [meteorUser, setMeteorUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeteorUser() {
      if (!isSignedIn || !clerkUserId) {
        setMeteorUser(null);
        setLoading(false);
        return;
      }

      try {
        // First check if we already have the user cached
        const cachedUser = Meteor.user();
        if (cachedUser?.profile?.clerkUserId === clerkUserId) {
          setMeteorUser(cachedUser);
          setLoading(false);
          return;
        }

        // Call method to get/create Meteor user from Clerk
        Meteor.call("clerk.getMeteorUser", clerkUserId, (err, result) => {
          if (err) {
            console.error("Failed to get Meteor user:", err);
            setMeteorUser(null);
          } else {
            setMeteorUser(result);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching Meteor user:", error);
        setMeteorUser(null);
        setLoading(false);
      }
    }

    if (clerkLoaded) {
      fetchMeteorUser();
    }
  }, [isSignedIn, clerkUserId, clerkLoaded]);

  return {
    isLoaded: clerkLoaded && userLoaded && !loading,
    isSignedIn,
    clerkUserId,
    clerkUser,
    meteorUser,
    user: meteorUser, // Alias for compatibility
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
