import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { app } from "./config";
import type { CRMUser, UserRole } from "../types/user";

export const db = getFirestore(app);

export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
  role: UserRole = "coordinator",
) => {
  const userRef = doc(db, "users", uid);

  const userProfile = {
    uid,
    email,
    displayName,
    photoURL: photoURL ?? "",
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userProfile);

  return userProfile;
};

export const getUserProfile = async (
  uid: string,
): Promise<CRMUser | null> => {
  const userRef = doc(db, "users", uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    return null;
  }

  return userSnapshot.data() as CRMUser;
};
