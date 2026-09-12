export interface Stakeholder {
  id?: string;

  organisationId: string;

  name: string;
  position: string;
  email: string;
  phone: string;

  isPrimary: boolean;

  notes: string;

  createdAt: unknown;
  updatedAt: unknown;
}
