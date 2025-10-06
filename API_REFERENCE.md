# API Endpoints Reference

## Projects API

### GET /api/proyectos

- Returns all projects with basic info
- Query params: ?active=true/false

### GET /api/proyectos/[id]

- Returns specific project with populated data
- Populates: personalRoles.personalId, personalRoles.roleId, encargado, client
- Used by: Project detail pages, diary components

### POST /api/proyectos

- Creates new project
- Body: { name, customer_name, client, encargado, address, location }

### PUT /api/proyectos/[id]

- Updates project
- Handles personalRoles assignments

### PUT /api/proyectos/[id]/finalize

- Finalizes project (sets finalized date, active: false)
- Body: { finalizedDate }
- Populates: personalRoles.personalId, personalRoles.roleId, encargado

## Personnel API

### GET /api/personal

- Returns all personnel with role badges
- Populates: roles (general capabilities)

### GET /api/personal/[id]

- Returns specific personnel
- Populates: roles

### GET /api/personal/[id]/work-history

- Returns work history from diary entries
- Populates: project, worker, role from diary entries
- Groups by project, calculates stats

## Diary API

### GET /api/diary

- Query params: project, worker, date, startDate, endDate
- Populates: project, worker, role

### POST /api/diary

- Creates diary entry (clock-in)
- Body: { projectId, workerId, startTime, endTime?, notes, isMaestro }
- Automatically captures role from project.personalRoles
- Saves role snapshot for historical accuracy

### PUT /api/diary/[id]

- Updates diary entry
- Body: { startTime, endTime?, notes }
- Handles both partial and complete updates

### PUT /api/diary/clock-out

- Quick clock-out for active entries
- Body: { projectId, workerId, endTime, notes }

### GET /api/diary/worker/[id]

- Gets all diary entries for specific worker
- Query params: date, startDate, endDate, project

## Roles API

### GET /api/roles

- Returns all roles
- Used by: role selection dropdowns, admin interface

### POST /api/roles

- Creates new role
- Body: { name, description, color }

### PUT /api/roles/[id]

- Updates role
- Body: { name, description, color }

### DELETE /api/roles/[id]

- Deletes role (check for dependencies first)

## Important Populate Patterns

### For Projects (NEW STRUCTURE)

```javascript
.populate('personalRoles.personalId', 'name email phone')
.populate('personalRoles.roleId', 'name description color')
.populate('encargado', 'name email')
```

### For Diary Entries

```javascript
.populate('project', 'name')
.populate('worker', 'name email')
.populate('role', 'name description color')
```

### DEPRECATED - DO NOT USE

```javascript
.populate('personal') // This field was removed!
```

## Response Formats

### Project with Personnel

```json
{
  "_id": "...",
  "name": "Project Name",
  "personalRoles": [
    {
      "personalId": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "roleId": {
        "_id": "...",
        "name": "Electrician",
        "color": "#ff5722"
      },
      "notes": "Lead electrician"
    }
  ]
}
```

### Diary Entry

```json
{
  "_id": "...",
  "project": { "_id": "...", "name": "Project Name" },
  "worker": { "_id": "...", "name": "John Doe" },
  "role": { "_id": "...", "name": "Electrician" },
  "roleSnapshot": {
    "name": "Electrician",
    "description": "Electrical work",
    "color": "#ff5722"
  },
  "startTime": "2025-10-05T08:00:00Z",
  "endTime": "2025-10-05T17:00:00Z",
  "totalHours": 9,
  "status": "completed"
}
```
