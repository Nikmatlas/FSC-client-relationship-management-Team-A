import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { auth } from "../firebase/auth";
import { getUserProfile } from "../firebase/firestore";
import { AuthContext } from "./auth-context";
import type { CRMUser } from "../types/user";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CRMUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            const userProfile = await getUserProfile(
              firebaseUser.uid
            );

            setProfile(userProfile);
          } catch (error) {
            console.error(
              "Failed to load user profile:",
              error
            );

            setProfile(null);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
