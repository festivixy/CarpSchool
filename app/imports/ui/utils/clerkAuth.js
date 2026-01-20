import { Meteor } from "meteor/meteor";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

/**
 * Get Clerk publishable key from server
 * Returns a promise that resolves with the publishable key
 */
export function getClerkPublishableKey() {
  return new Promise((resolve, reject) => {
    Meteor.call("clerk.getPublishableKey", (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.publishableKey);
      }
    });
  });
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
    getClerkPublishableKey()
      .then((key) => {
        setPublishableKey(key);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
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
  return meteorUser?.roles?.includes(role) || false;
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
