import type { Organisation } from "../types/organisation";
import type { Stakeholder } from "../types/stakeholder";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
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

// ============================================================
// Organisations
// ============================================================

export async function createOrganisation(
  organisation: Omit<Organisation, "id" | "createdAt" | "updatedAt">
) {
  const organisationsRef = collection(db, "organisations");

  return addDoc(organisationsRef, {
    ...organisation,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getOrganisations(): Promise<Organisation[]> {
  const organisationsRef = collection(db, "organisations");

  const snapshot = await getDocs(organisationsRef);

  return snapshot.docs.map((organisationDoc) => ({
    id: organisationDoc.id,
    ...organisationDoc.data(),
  })) as Organisation[];
}

export async function getOrganisation(
  organisationId: string
): Promise<Organisation | null> {
  const organisationRef = doc(
    db,
    "organisations",
    organisationId
  );

  const snapshot = await getDoc(organisationRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Organisation;
}

export async function updateOrganisation(
  organisationId: string,
  updates: Partial<
    Omit<Organisation, "id" | "createdAt" | "updatedAt">
  >
) {
  const organisationRef = doc(
    db,
    "organisations",
    organisationId
  );

  return updateDoc(organisationRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveOrganisation(
  organisationId: string
) {
  return updateOrganisation(organisationId, {
    archived: true,
    pipelineStage: "Archived",
    relationshipStatus: "inactive",
  });
}


// ============================================================
// Stakeholders / Contacts
// ============================================================

export async function createStakeholder(
  stakeholder: Omit<
    Stakeholder,
    "id" | "createdAt" | "updatedAt"
  >
) {
  const stakeholdersRef = collection(db, "contacts");

  return addDoc(stakeholdersRef, {
    ...stakeholder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getStakeholdersByOrganisation(
  organisationId: string
): Promise<Stakeholder[]> {
  const stakeholdersRef = collection(db, "contacts");

  const stakeholdersQuery = query(
    stakeholdersRef,
    where("organisationId", "==", organisationId)
  );

  const snapshot = await getDocs(stakeholdersQuery);

  return snapshot.docs.map((stakeholderDoc) => ({
    id: stakeholderDoc.id,
    ...stakeholderDoc.data(),
  })) as Stakeholder[];
}

export async function updateStakeholder(
  stakeholderId: string,
  updates: Partial<
    Omit<Stakeholder, "id" | "createdAt" | "updatedAt">
  >
) {
  const stakeholderRef = doc(
    db,
    "contacts",
    stakeholderId
  );

  return updateDoc(stakeholderRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStakeholder(
  stakeholderId: string
) {
  const stakeholderRef = doc(
    db,
    "contacts",
    stakeholderId
  );

  return deleteDoc(stakeholderRef);
}
