import { createContext } from "react";
import type { User } from "firebase/auth";
import type { CRMUser } from "../types/user";

export type AuthContextType = {
  user: User | null;
  profile: CRMUser | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});
