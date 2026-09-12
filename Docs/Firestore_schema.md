# Firestore Schema

**Food Systems Collective, Web-Based CRM Prototype, Team A, Project 45**

## `organisations` Collection

**Path:** `/organisations/{orgId}`

**Access:** Authenticated Coordinators and Administrators can access organisation records according to Firestore Security Rules.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Organisation or company name |
| `category` | `string` | Yes | Organisation category/type used for grouping and filtering |
| `tags` | `string[]` | No | Free-form relationship tags |
| `pipelineStage` | `string` | Yes | Current stage in the relationship pipeline |
| `ownerId` | `string` | Yes | UID of the assigned relationship owner |
| `leadScore` | `number` | No | Qualification/lead score |
| `nextFollowUpDate` | `Timestamp \| null` | No | Date for the next follow-up |
| `createdAt` | `Timestamp` | Yes | Date and time the organisation was created |
| `updatedAt` | `Timestamp` | Yes | Date and time the organisation was last updated |
| `_schemaVersion` | `number` | Yes | Database schema version |

### Pipeline Stages

The organisation pipeline contains twelve stages:

```text
Prospect
Research
Qualified
Outreach
Follow-up
Meeting
Proposal
Negotiation
Partnership
Active Relationship
Completed
Archived
```

The `Archived` stage is used instead of permanently deleting an inactive organisation.

---

## `contacts` Collection

**Path:** `/contacts/{contactId}`

Contacts are stored as a separate collection and reference their organisation through `orgId`.

| Field | Type | Required | Description |
|---|---|---|---|
| `orgId` | `string` | Yes | ID of the related organisation |
| `name` | `string` | Yes | Contact's full name |
| `role` | `string` | No | Contact's position or role |
| `email` | `string \| null` | No | Contact email address |
| `phone` | `string \| null` | No | Contact phone number |
| `isPrimary` | `boolean` | Yes | Identifies the primary organisation contact |
| `createdAt` | `Timestamp` | Yes | Date and time the contact was created |
| `updatedAt` | `Timestamp` | Yes | Date and time the contact was last updated |
| `_schemaVersion` | `number` | Yes | Database schema version |

Contacts allow an organisation to have multiple stakeholders while identifying one or more primary contacts.

---

## `activities` Collection

**Path:** `/activities/{activityId}`

Activities record communication and relationship interactions.

| Field | Type | Required | Description |
|---|---|---|---|
| `orgId` | `string` | Yes | ID of the related organisation |
| `type` | `string` | Yes | `email`, `call`, `meeting` or `other` |
| `date` | `Timestamp` | Yes | Date and time of the activity |
| `contactId` | `string \| null` | No | Related stakeholder/contact |
| `responsibleUserId` | `string` | Yes | Team member responsible for the activity |
| `notes` | `string` | No | Activity notes |
| `outcome` | `string \| null` | No | Result of the activity |
| `actionItems` | `string[]` | No | Actions resulting from the activity |
| `createdAt` | `Timestamp` | Yes | Date and time the activity was created |
| `_schemaVersion` | `number` | Yes | Database schema version |

Activities provide the organisation profile with a chronological relationship history.

---

## `opportunities` Collection

**Path:** `/opportunities/{opportunityId}`

Opportunities represent potential partnerships, projects, sponsorships or other business development opportunities.

| Field | Type | Required | Description |
|---|---|---|---|
| `orgId` | `string` | Yes | ID of the related organisation |
| `name` | `string` | Yes | Opportunity or project name |
| `type` | `string` | No | Opportunity type |
| `description` | `string` | No | Description of the opportunity |
| `status` | `string` | Yes | Current opportunity status |
| `stage` | `string` | Yes | Current opportunity progression stage |
| `ownerId` | `string` | Yes | UID of the assigned team member |
| `relatedContactIds` | `string[]` | No | Related stakeholder/contact IDs |
| `nextStep` | `string \| null` | No | Expected next action |
| `proposalUrl` | `string \| null` | No | Link to a supporting proposal/document |
| `outcome` | `string \| null` | No | Partnership or opportunity outcome |
| `createdAt` | `Timestamp` | Yes | Date and time the opportunity was created |
| `updatedAt` | `Timestamp` | Yes | Date and time the opportunity was last updated |
| `_schemaVersion` | `number` | Yes | Database schema version |

An opportunity is linked to an organisation through `orgId`, allowing users to view opportunities as part of the organisation's relationship history.

---

## `users` Collection

**Path:** `/users/{userId}`

The `users` collection stores the CRM profile associated with a Firebase Authentication account.

| Field | Type | Required | Description |
|---|---|---|---|
| `uid` | `string` | Yes | Firebase Authentication UID |
| `email` | `string` | Yes | User email address |
| `displayName` | `string` | Yes | User's display name |
| `photoURL` | `string` | No | Profile image URL |
| `role` | `string` | Yes | `coordinator` or `administrator` |
| `createdAt` | `Timestamp` | Yes | Date and time the profile was created |
| `updatedAt` | `Timestamp` | Yes | Date and time the profile was last updated |
| `_schemaVersion` | `number` | Yes | Database schema version |

The Firebase Authentication UID is used as the Firestore document ID.

Example:

```text
/users/oqjoEHBAfZUAPlRubFbPzLWIuty1
```

The user's role determines which administrative functions are available.

### Coordinator

A Coordinator can:

- View organisations.
- Create and update organisations.
- Manage contacts/stakeholders.
- Record activities and meetings.
- Manage relationship pipeline stages.
- Manage opportunities.
- Add relationship notes and tags.
- Search and filter CRM records.
- View the CRM dashboard.

### Administrator

An Administrator can perform all Coordinator functions and additionally:

- View users.
- Manage user roles.
- Manage administrator-level user settings.

---
