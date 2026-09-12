# FSC CRM — Frontend & Backend Development Guide

## 1. Purpose

This document explains how the FSC CRM Team A codebase is organised and which files each team member should edit.

The main goal is to keep the frontend, backend, documentation and design work separated and prevent accidental changes that cause build errors, broken pages, Firebase problems, or merge conflicts.

### Team Members

| Name | Role | Main Responsibility |
|---|---|---|
| **Anay Arora** | Backend Developer | Backend, database, Firestore and backend logic |
| **Sheran Mickayel Narasingha Mudiyanselage** | Frontend Developer | Frontend pages, components and functionality |
| **Sienna Saunders** | UX/UI Designer | UI, UX, layouts and visual design |
| **Semih Eren** | Project Manager | Project management, documentation and coordination |
| **Nicholas Matthew** | Business Analyst | Requirements, business logic, workflows and cross-team support |

### Development Responsibilities

| Area | Main Responsibility |
|---|---|
| Frontend | Sheran — Pages, UI, navigation, components and frontend functionality |
| Backend | Anay — Backend, database, Firestore operations and backend logic |
| UX/UI | Sienna — Design, layouts and visual requirements |
| Documentation / PM | Semih — Documentation, project coordination and project management |
| BA / Requirements | Nicholas — Requirements, workflow, acceptance criteria and scope |
| Cross-Team Support | Nicholas — Can work across frontend, backend and documentation |
| Shared | Team — Types, authentication structure and project configuration |

---

# 2. Project Structure

```text
FSC-client-relationship-management-Team-A/
├── backend/
│   ├── data/
│   │   └── seed-data.json
│   ├── package.json
│   └── src/
│       ├── lib/
│       ├── middleware/
│       ├── routes/
│       └── services/
│
├── Docs/
│   ├── Architecture.md
│   ├── Firestore_schema.md
│   └── Initial_crm_database.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── firebase/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

# 3. Ownership Rules

## 🔵 Sheran — Frontend Developer

Sheran is mainly responsible for the frontend application.

### Main folders

```text
frontend/src/pages/
frontend/src/components/
frontend/src/assets/
frontend/src/hooks/
frontend/src/styles/
```

### Main files

```text
frontend/src/App.tsx
frontend/src/App.css
frontend/src/index.css
```

Sheran can create and modify:

- Pages
- Buttons
- Forms
- Tables
- Cards
- Navigation
- Layouts
- Filters
- Search UI
- Modals
- Loading states
- Error messages
- Responsive behaviour
- User interactions

### Current frontend pages

```text
Dashboard.tsx
Organisations.tsx
OrganisationProfile.tsx
Opportunities.tsx
Pipeline.tsx
Activities.tsx
Login.tsx
AdminUsers.tsx
```

### Coordinate before changing

```text
frontend/src/types/
frontend/src/context/
frontend/src/firebase/
frontend/src/App.tsx
```

These areas can affect authentication, database communication or multiple parts of the application.

---

# 4. 🟢 Anay — Backend & Database Developer

Anay is mainly responsible for backend and database development.

### Main backend folder

```text
backend/
```

### Main areas

```text
backend/src/routes/
backend/src/middleware/
backend/src/services/
backend/src/lib/
backend/data/
```

### Backend responsibilities

- Backend logic
- API routes
- Database operations
- Firestore operations
- Data validation
- Database relationships
- Data processing
- Backend services
- Authentication-related backend logic
- Firebase/Firestore security
- Seed data

### Database documentation

Anay should also coordinate changes to:

```text
Docs/Firestore_schema.md
Docs/Initial_crm_database.md
```

### Important

The current frontend still uses:

```text
frontend/src/firebase/
├── auth.ts
├── config.ts
└── firestore.ts
```

These files should **not be moved or deleted just because the `backend/` folder exists**.

If the architecture changes from:

```text
Frontend → Firebase/Firestore
```

to:

```text
Frontend → Backend → Firebase/Firestore
```

the migration should be planned and coordinated before changing the existing Firebase implementation.

---

# 5. 🟣 Sienna — UX/UI Designer

Sienna is responsible for the visual design and user experience of the application.

### Main areas

```text
frontend/src/components/
frontend/src/pages/
frontend/src/assets/
frontend/src/styles/
```

### Sienna can work on

- UI layouts
- Figma implementation
- Colours
- Typography
- Spacing
- Buttons
- Cards
- Forms
- Navigation
- Responsive design
- Visual consistency
- User experience
- Component appearance

### Main styling files

```text
frontend/src/App.css
frontend/src/index.css
frontend/src/styles/globals.css
frontend/src/styles/theme.css
```

Sienna should coordinate with Sheran when UI changes require changes to frontend functionality.

Sienna should not change backend, database or Firebase logic without coordinating with Anay.

---

# 6. 🟠 Semih — Project Manager & Documentation

Semih is responsible for project management, coordination and project documentation.

### Main documentation area

```text
Docs/
```

Semih can create and update documentation such as:

```text
Docs/Architecture.md
Docs/Firestore_schema.md
Docs/Initial_crm_database.md
```

Semih can also add new documentation files when required.

Examples:

```text
Docs/Requirements.md
Docs/Testing.md
Docs/Security.md
Docs/Git_Workflow.md
Docs/CI_CD.md
Docs/Client_Validation.md
```

### Semih responsibilities

- Project planning
- Sprint coordination
- Team coordination
- Documentation
- Meeting records
- Project status
- Deliverables
- Client communication
- Keeping project documentation organised

Technical documentation should be checked with the relevant developer before being treated as final.

For example:

```text
Database documentation → Anay
Frontend documentation → Sheran
UI/UX documentation → Sienna
Requirements → Nicholas
Project documentation → Semih
```

---

# 7. 🟡 Nicholas — Business Analyst / Cross-Team Support

Can work across the project when required.

### Main responsibilities

- Requirements
- Business analysis
- User stories
- Acceptance criteria
- Business rules
- Workflow decisions
- Scope
- Client validation
- Requirements traceability
- Reviewing implementation against requirements
- Cross-team support

### Can work across

```text
Docs/
frontend/
backend/
```

Can assist with:

```text
Frontend → Sheran
Backend → Anay
UX/UI → Sienna
Documentation → Semih
Architecture → Relevant developers
```

Major technical changes should still be coordinated with the responsible developer.

---

# 8. 🔴 Files That Should NOT Be Edited Casually

The following files affect the entire project and can cause the application to stop building if changed incorrectly.

## `package.json`

Controls:

- Dependencies
- React
- Firebase
- Vite
- TypeScript
- Build scripts

### Rule

**Do not install, remove or upgrade packages without discussing it with the team.**

For example, do not randomly run:

```bash
pnpm add some-package
```

without telling the team.

---

## `pnpm-lock.yaml`

This file records the exact dependency versions used by the project.

### Rule

Do not manually edit this file.

If `package.json` changes, use:

```bash
pnpm install
```

and commit the resulting lockfile.

---

## `pnpm-workspace.yaml`

This controls the pnpm workspace.

### Rule

**Do not change this file unless the team agrees.**

Current configuration:

```yaml
packages:
  - frontend
```

Changes to the workspace configuration can affect local installs and Vercel builds.

---

# 9. TypeScript Configuration

These files include:

```text
frontend/tsconfig.json
frontend/tsconfig.app.json
frontend/tsconfig.node.json
```

### Rule

Treat these as **view-only unless a configuration change is specifically required**.

Changing TypeScript settings can cause many unrelated files to fail compilation.

---

# 10. Vite Configuration

Location:

```text
frontend/vite.config.ts
```

### Rule

View-only unless the team agrees that a Vite configuration change is required.

---

# 11. Application Entry Point

Location:

```text
frontend/src/main.tsx
```

This is the application's entry point.

### Rule

Do not modify unless necessary.

Changes can affect the entire frontend application.

---

# 12. Firebase Files

Current Firebase files:

```text
frontend/src/firebase/
├── auth.ts
├── config.ts
└── firestore.ts
```

These files are currently used by the frontend.

### Rule

**Do not move, rename or delete these files without coordinating with Anay and Nicholas.**

Changes can affect:

- Login
- Google authentication
- Firestore
- User profiles
- Organisation data
- Firebase configuration

---

# 13. Shared Files

Some files affect multiple team members and should be treated as shared files.

Examples:

```text
frontend/src/types/
frontend/src/context/
frontend/src/firebase/
frontend/src/App.tsx
package.json
pnpm-workspace.yaml
```

### Rule

Before making a major change to a shared file:

1. Tell the relevant team member.
2. Explain what is being changed.
3. Make sure the change does not conflict with current work.
4. Run the build/test after the change.
5. Commit the change clearly.

---

# 14. Git Workflow

Before starting work:

```bash
git pull
```

Create a branch for significant work:

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/organisation-search
```

After making changes:

```bash
git status
git add .
git commit -m "Add organisation search"
git push -u origin feature/organisation-search
```

Before merging, make sure the project builds successfully.

For the frontend:

```bash
pnpm --filter frontend run build
```

---

# 15. Important Team Rule

### Do not edit another person's main area without communication.

| Area | Responsible Person |
|---|---|
| Backend | **Anay** |
| Database / Firestore | **Anay** |
| Frontend | **Sheran** |
| UX/UI | **Sienna** |
| Documentation / PM | **Semih** |
| Requirements / BA | **Nicholas** |
| Cross-team technical support | **Nicholas + relevant developer** |

This does not mean team members are completely restricted from other areas.

It means the responsible person should be informed before major changes are made.

---

# 16. Before Pushing Code

Run:

```bash
git status
```

Then check that you have not accidentally modified unrelated files.

For frontend changes:

```bash
pnpm --filter frontend run build
```

If the build fails, fix the issue before pushing.

Do not push broken code to `main`.

---

# 17. Golden Rule

> **Own your area, communicate before changing shared files, and always test before pushing.**

The purpose of this structure is not to stop team members from helping each other.

It is to prevent:

- Broken builds
- Merge conflicts
- Firebase problems
- Accidental database changes
- Unintended UI changes
- Dependency conflicts
- Vercel deployment failures
- Confusion about who is responsible for a file
