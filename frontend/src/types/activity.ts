export type ActivityType = "Meeting" | "Call" | "Email" | "Meeting Minutes";

export const activityTypes: ActivityType[] = [
  "Meeting",
  "Call",
  "Email",
  "Meeting Minutes",
];

export interface Activity {
  id?: string;

  organisationId: string;
  opportunityId?: string;

  name: string;
  type: ActivityType;
  agenda: string;

  // Stored as "YYYY-MM-DDTHH:mm" from a datetime-local input, so it sorts as text
  dateTime: string;
  duration: string;
  attendees: string;

  outcomes: string;
  nextFollowUpDate: string;

  createdAt: unknown;
  updatedAt: unknown;
}
