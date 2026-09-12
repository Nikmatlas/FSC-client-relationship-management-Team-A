export type RelationshipStatus = "active" | "inactive" | "prospect";

export type PipelineStage =
  | "Prospect"
  | "Research"
  | "Qualified"
  | "Outreach"
  | "Follow-up"
  | "Meeting"
  | "Proposal"
  | "Negotiation"
  | "Partnership"
  | "Active Relationship"
  | "Completed"
  | "Archived";

export interface Organisation {
  id?: string;

  name: string;
  type: string;
  industry: string;
  country: string;

  website: string;
  email: string;
  phone: string;

  relationshipStatus: RelationshipStatus;
  pipelineStage: PipelineStage;

  ownerId: string;

  tags: string[];
  notes: string;

  leadScore: number;
  researchStatus: string;
  businessBrief: string;

  nextAction: string;
  nextFollowUpDate: unknown;

  createdAt: unknown;
  updatedAt: unknown;

  archived: boolean;
}
