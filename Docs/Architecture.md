# Architecture

**Food Systems Collective, Web-Based CRM Prototype, Team A, Project 45**

## System Overview

The system is a web-based CRM prototype built using **React, Vite and TypeScript** for the frontend, with **Firebase** providing authentication, database storage and hosting.

The frontend is developed as a single-page React application and can be deployed as a static web application through Firebase Hosting. Firebase Authentication manages user authentication, while Cloud Firestore stores the CRM data. Firestore Security Rules control access to CRM records based on the authenticated user's role.

All components are contained within a single Firebase project to provide a simple and unified development and deployment workflow.

The system uses a direct connection between the React frontend and Firebase services. The Firebase client SDK is used by the application to communicate with Firebase Authentication and Cloud Firestore.

The application does not maintain a server-side session or custom authentication system. When a user signs in, Firebase Authentication manages the authenticated user session and provides authentication context to Firestore requests.

The two supported user roles are:

- **Coordinator** — can manage CRM organisations, stakeholders, activities, pipeline information and opportunities.
- **Administrator** — has the same CRM permissions as a Coordinator, with additional permissions for managing users and user roles.

The system therefore follows the following architecture:

```text
React + Vite + TypeScript
          |
          | Firebase Client SDK
          |
    +-----+------------------+
    |                        |
    v                        v
Firebase Authentication   Cloud Firestore
    |                        |
    |                        |
    v                        v
Users & Roles          CRM Data Collections
                             |
                 +-----------+-----------+
                 |           |           |
                 v           v           v
            Organisations Contacts   Activities
                 |
                 v
            Opportunities
```

## Frontend Technology

The frontend uses:

- **React** for the user interface and component structure.
- **Vite** for development and production builds.
- **TypeScript** for type-safe application development.
- **React Router** for client-side navigation and protected routes.
- **Firebase Web SDK** for authentication and Firestore access.
- **Lucide React** for interface icons.

The application is organised into reusable components, pages, authentication components, Firebase services, hooks and TypeScript data models.

The frontend is responsible for:

- Displaying CRM information.
- Providing forms for creating and updating CRM records.
- Searching and filtering CRM records.
- Displaying the relationship pipeline.
- Displaying dashboards and relationship activity.
- Managing authenticated navigation.
- Restricting administrator-only pages based on the user's role.

## Authentication and Authorisation

Firebase Authentication is used to authenticate users.

The prototype supports:

- Google sign-in.
- Email and password authentication.

After authentication, a corresponding user profile is stored in the Firestore `users` collection.

Each user profile contains a role:

```text
coordinator
administrator
```

The user's Firebase Authentication UID is used as the document ID in the `users` collection.

The application uses the authenticated user's profile to determine access to protected pages.

For example:

```text
Unauthenticated user
        |
        v
      Login
        |
        v
Authenticated user
        |
        +----------------------+
        |                      |
        v                      v
   Coordinator           Administrator
        |                      |
        v                      v
   CRM Dashboard        CRM Dashboard
                              |
                              v
                       User Management
```

React Router protected routes prevent unauthenticated users from accessing CRM pages.

Administrator-only routes are additionally protected by checking that the authenticated user's Firestore profile has the `administrator` role.

## Database Approach Selected

The database is **Cloud Firestore**.

Firestore was selected because:

- It integrates directly with the existing Firebase project.
- It does not require a separate database server.
- It works directly with the React frontend through the Firebase SDK.
- It supports real-time and document-based data access.
- It is suitable for the relationship-based CRM data required by the project.
- Firebase Security Rules can be used to restrict access to CRM records.
- It supports timestamps, arrays and references required by the CRM data model.

The database is organised into five collections:

1. `users`
2. `organisations`
3. `contacts`
4. `activities`
5. `opportunities`

Organisations form the main CRM entity. Contacts, activities and opportunities reference an organisation using its document ID.

The relationship pipeline is represented using the `pipelineStage` field on an organisation rather than using a separate pipeline collection.

The dashboard is also not stored as a separate collection. Dashboard information is calculated from the existing CRM collections using queries, filters and counts.
