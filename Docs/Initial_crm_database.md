# Initial CRM Database

**Food Systems Collective, Web-Based CRM Prototype, Team A, Project 45**

## Overview

The database is Cloud Firestore and is structured around five collections:

| Collection | Key Fields | Module |
|---|---|---|
| `users` | uid, email, displayName, role | Authentication and User Management |
| `organisations` | name, category, tags, pipelineStage, ownerId, leadScore, nextFollowUpDate | Organisations, Stakeholders and Pipeline |
| `contacts` | orgId, name, role, email, phone, isPrimary | Organisations and Stakeholders |
| `activities` | orgId, type, date, contactId, responsibleUserId, notes, outcome | Meetings and Activities |
| `opportunities` | orgId, name, type, status, stage, ownerId, relatedContactIds, nextStep | Partnerships and Opportunities |

## Relationship Between Collections

The collections are linked using document IDs rather than nesting all information inside a single organisation document.

```text
users
  |
  | ownerId / responsibleUserId
  |
  v
organisations
  |
  +------------------+
  |                  |
  | orgId            | orgId
  v                  v
contacts          activities
  |
  | relatedContactIds
  v
opportunities
```

An organisation is therefore the central relationship entity.

For example:

```text
Organisation
    |
    +-- Stakeholders / Contacts
    |
    +-- Activities
    |
    +-- Meetings
    |
    +-- Opportunities
    |
    +-- Pipeline Stage
    |
    +-- Relationship Owner
```

## Pipeline Design

The CRM pipeline is represented by the `pipelineStage` field on the organisation document.

```text
Prospect
   ↓
Research
   ↓
Qualified
   ↓
Outreach
   ↓
Follow-up
   ↓
Meeting
   ↓
Proposal
   ↓
Negotiation
   ↓
Partnership
   ↓
Active Relationship
   ↓
Completed
   ↓
Archived
```

This allows the pipeline board and dashboard to be generated from the organisation collection without requiring a separate pipeline collection.

## Dashboard Design

The dashboard does not have its own database collection.

Dashboard information is calculated from the existing collections.

Examples include:

- Total active organisations.
- Organisations by pipeline stage.
- Upcoming follow-ups.
- Overdue follow-ups.
- Recent activities.
- Upcoming meetings.
- Active opportunities.
- Relationship activity.

This avoids storing duplicate dashboard information and reduces the possibility of inconsistencies between the dashboard and the underlying CRM records.

---

# Security and Access Control

Firestore Security Rules are used to control access to the database.

Unauthenticated users cannot access CRM data.

Authenticated users are identified through Firebase Authentication.

The intended permission structure is:

```text
                     Firebase Authentication
                              |
                 +------------+------------+
                 |                         |
                 v                         v
            Coordinator              Administrator
                 |                         |
                 v                         v
          CRM functionality         CRM functionality
                                           +
                                    User Management
```

The application will use role-based Firestore Security Rules so that users cannot gain administrator permissions simply by changing values in the frontend.

User roles are stored in Firestore and will be protected so that normal Coordinators cannot modify their own role.

Hard deletion of CRM records is avoided where possible. Organisations can instead be moved to the `Archived` pipeline stage, while historical activities remain available as part of the relationship history.

---

# Infrastructure Requirements

The Firebase project provides the core infrastructure for the prototype:

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Firestore Security Rules

The React application is built using Vite and can be deployed to Firebase Hosting.

The deployment workflow is:

```text
GitHub Repository
       |
       v
React + Vite Build
       |
       v
Production Build
       |
       v
Firebase Hosting
       |
       v
Live CRM Prototype
```

Local development uses the Firebase project configuration through environment variables.

Sensitive local configuration values are stored in `.env.local` and are excluded from Git version control.

The Firestore database is configured in **Production mode**, with access controlled through Firestore Security Rules.

---

# Current Implementation Status

The following foundation has been implemented:

- React + Vite + TypeScript frontend.
- Firebase project configured.
- Firebase Authentication configured.
- Google authentication configured.
- Email/password authentication configured.
- Firestore database created.
- Firestore user profiles implemented.
- Coordinator and Administrator roles implemented.
- Authentication state tracking implemented.
- Protected routes implemented.
- Administrator-only route protection implemented.
- Login redirection to the CRM dashboard implemented.

The remaining implementation will focus on the CRM functionality described in Epics 1–6, beginning with Organisations and Stakeholders.
