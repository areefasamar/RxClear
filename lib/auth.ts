'use client';

import { useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { auth, isConfigured } from "./firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    const currentAuth = auth;
    if (!currentAuth) return;

    const unsubscribe = onAuthStateChanged(currentAuth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        signInAnonymously(currentAuth).catch((error) => {
          console.error("Anonymous auth failed:", error);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
