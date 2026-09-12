export type UserRole = "coordinator" | "administrator";

export interface CRMUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
