# Ganatecnica Web - Codebase Map

## Project Overview

Construction management system with personnel tracking, project management, and role-based diary entries.

## Core Architecture

### Database Models (`src/models/`)

- **projectModel.js** - Project schema with personalRoles (personnel assignments with roles)
- **personalModel.js** - Personnel/worker information with general roles
- **roleModel.js** - Role definitions (name, description, color)
- **diaryEntryModel.js** - Work diary entries with role snapshots
- **clienteModel.js** - Client information
- **maestroModel.js** - Master/supervisor specific model
- **obreroModel.js** - Worker specific model
- **userModel.js** - User authentication

### API Routes (`src/app/api/`)

#### Projects (`/api/proyectos/`)

- `route.js` - GET all projects, POST create project
- `[id]/route.js` - GET/PUT/DELETE specific project (populates personalRoles)
- `[id]/finalize/route.js` - PUT finalize project

#### Personnel (`/api/personal/`)

- `route.js` - GET all personnel, POST create personnel
- `[id]/route.js` - GET/PUT/DELETE specific personnel
- `[id]/work-history/route.js` - GET work history from diary entries

#### Diary (`/api/diary/`)

- `route.js` - GET diary entries, POST create entry (with role capture)
- `[id]/route.js` - GET/PUT/DELETE specific diary entry
- `clock-out/route.js` - PUT clock out worker
- `worker/[id]/route.js` - GET diary entries for specific worker

#### Roles (`/api/roles/`)

- `route.js` - GET all roles, POST create role
- `[id]/route.js` - GET/PUT/DELETE specific role

### Frontend Components (`src/app/`)

#### Project Pages (`proyectos/`)

- `page.js` - Project list with role filtering
- `[id]/page.js` - Project detail page
- `[id]/ProjectDiary.js` - Daily work tracking interface
- `[id]/WorkerDiaryEntry.js` - Individual worker diary row
- `[id]/ProjectPersonal.js` - Project personnel display
- `[id]/PersonalManagementModal.js` - Assign personnel with roles

#### Personnel Pages (`personal/`)

- `page.js` - Personnel list with role badges
- `[id]/page.js` - Personnel detail page
- `[id]/PersonalWorkHistory.js` - Work history with roles
- `[id]/PersonalRoleManagement.js` - Manage personal roles

#### Admin Pages (`admin/`)

- `roles/page.js` - Role management interface

### Key Data Structures

#### Project.personalRoles

```javascript
personalRoles: [
  {
    personalId: ObjectId, // ref Personal
    roleId: ObjectId, // ref Role
    notes: String, // optional assignment notes
  },
];
```

#### DiaryEntry with Role Tracking

```javascript
{
  project: ObjectId,
  worker: ObjectId,
  role: ObjectId,           // ref Role
  roleSnapshot: {           // historical data
    name: String,
    description: String,
    color: String
  },
  startTime: Date,
  endTime: Date,            // optional
  // ... other fields
}
```

## Important Design Decisions

### Role System

- **Personal Roles**: General capabilities/qualifications of a person
- **Project Roles**: Specific role assigned to person in a project (stored in personalRoles)
- **Diary Role Capture**: Role information saved in diary entries for historical accuracy

### Data Migration Notes

- Removed old `personal` field from Project model
- Replaced with `personalRoles` for role-aware assignments
- Updated all populate calls and components accordingly

## Common Operations

### Adding Personnel to Project with Role

1. Use PersonalManagementModal component
2. Select personnel and assign role
3. Saves to project.personalRoles array

### Creating Diary Entries

1. WorkerDiaryEntry component handles UI
2. Looks up worker's role from project.personalRoles
3. Saves role reference + snapshot to diary entry

### Displaying Work History

1. PersonalWorkHistory queries diary entries
2. Uses role information directly from diary entries
3. No need to cross-reference project data

## Error Patterns to Watch

### StrictPopulateError

- Usually means trying to populate removed `personal` field
- Solution: Update to use `personalRoles.personalId` and `personalRoles.roleId`

### Role Not Found

- Check if Role model is imported in DiaryEntry model
- Ensure populate paths are correct

## Development Workflow

1. Models define schema and relationships
2. API routes handle CRUD with proper population
3. Components use React Query for data fetching
4. Role information flows: Personal → Project Assignment → Diary Entry → Work History
