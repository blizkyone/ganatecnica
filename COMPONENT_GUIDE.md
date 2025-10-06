# Component Architecture

## Key Components and Their Responsibilities

### Project Management

#### ProjectDiary (`src/app/proyectos/[id]/ProjectDiary.js`)

- **Purpose**: Main diary interface for daily work tracking
- **Data Source**: Uses `personalRoles` from project data
- **Key Logic**: Maps `personalRoles` to worker list for diary entries
- **Role Display**: Passes role info to WorkerDiaryEntry components

#### WorkerDiaryEntry (`src/app/proyectos/[id]/WorkerDiaryEntry.js`)

- **Purpose**: Individual worker row in diary table
- **Props**: `worker`, `role`, `roleNotes`, `projectId`, `selectedDate`
- **Actions**: Clock-in, clock-out, edit times and notes
- **Role Display**: Shows role badge with custom colors
- **API Calls**:
  - POST /api/diary (create entry with role capture)
  - PUT /api/diary/[id] (update entry)
  - PUT /api/diary/clock-out (quick clock-out)

#### PersonalManagementModal (`src/app/proyectos/[id]/PersonalManagementModal.js`)

- **Purpose**: Assign personnel to projects with roles
- **Data Flow**:
  1. Select personnel from dropdown
  2. Select role from dropdown
  3. Add optional notes
  4. Saves to project.personalRoles array
- **Role Integration**: Manages project-specific role assignments

### Personnel Management

#### PersonalWorkHistory (`src/app/personal/[id]/PersonalWorkHistory.js`)

- **Purpose**: Display personnel work history across projects
- **Data Source**: GET /api/personal/[id]/work-history
- **Role Display**: Shows role badges from diary entry snapshots
- **Key Feature**: Self-contained data (no project lookups needed)

#### PersonalRoleManagement (`src/app/personal/[id]/PersonalRoleManagement.js`)

- **Purpose**: Manage general roles/capabilities of personnel
- **Scope**: Personal qualifications (not project-specific)
- **Data**: Modifies `personal.roles` array

### Role Administration

#### Admin Role Pages (`src/app/admin/roles/`)

- **Purpose**: CRUD operations for role definitions
- **Features**: Name, description, color picker
- **Used By**: Role dropdowns throughout the app

## Data Flow Patterns

### Role Assignment Flow

```
1. Admin creates roles → Role database
2. Personnel assigned general roles → Personal.roles
3. Project assignment with role → Project.personalRoles
4. Diary entry creation → Captures role snapshot
5. Work history display → Uses role from diary entries
```

### Component Communication

#### Parent → Child Props

```javascript
// ProjectDiary → WorkerDiaryEntry
<WorkerDiaryEntry
  worker={worker} // from personalRoles.personalId
  role={worker._roleId} // from personalRoles.roleId
  roleNotes={worker._roleNotes} // from personalRoles.notes
  projectId={projectId}
  selectedDate={selectedDate}
  onRefresh={onDiaryRefetch}
/>
```

#### Child → Parent Communication

```javascript
// WorkerDiaryEntry → ProjectDiary
onRefresh?.(); // Triggers parent data refetch
```

### State Management Patterns

#### React Query Usage

```javascript
// Standard pattern for API data
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["keyName", id],
  queryFn: () => fetch("/api/endpoint").then((res) => res.json()),
  enabled: !!id,
});
```

#### Local State for Forms

```javascript
// Editing states in WorkerDiaryEntry
const [isEditing, setIsEditing] = useState(false);
const [clockInTime, setClockInTime] = useState("");
const [clockOutTime, setClockOutTime] = useState("");
const [notes, setNotes] = useState("");
```

## Common Component Patterns

### Role Badge Display

```javascript
{
  role && (
    <span
      className="inline-block px-2 py-1 text-xs rounded-full"
      style={{
        backgroundColor: role.color ? `${role.color}20` : "#f3f4f6",
        color: role.color || "#6b7280",
        border: `1px solid ${role.color || "#d1d5db"}`,
      }}
      title={role.description || role.name}
    >
      {role.name}
    </span>
  );
}
```

### Error Handling

```javascript
{
  error && (
    <div className="text-red-600 text-xs mb-2">{error.message || error}</div>
  );
}
```

### Loading States

```javascript
{
  isLoading ? <Loading /> : <ActualContent />;
}
```

## File Organization

### Page Structure

```
src/app/
├── proyectos/
│   ├── page.js                    # Project list
│   └── [id]/
│       ├── page.js                # Project detail
│       ├── ProjectDiary.js        # Main diary component
│       ├── WorkerDiaryEntry.js    # Individual worker row
│       ├── ProjectPersonal.js     # Personnel display
│       └── PersonalManagementModal.js # Role assignment
├── personal/
│   ├── page.js                    # Personnel list
│   └── [id]/
│       ├── page.js                # Personnel detail
│       ├── PersonalWorkHistory.js # Work history
│       └── PersonalRoleManagement.js # Role management
└── admin/
    └── roles/
        └── page.js                # Role administration
```

### API Structure

```
src/app/api/
├── proyectos/
│   ├── route.js                   # Project CRUD
│   └── [id]/
│       ├── route.js               # Individual project
│       └── finalize/route.js      # Project finalization
├── personal/
│   ├── route.js                   # Personnel CRUD
│   └── [id]/
│       ├── route.js               # Individual personnel
│       └── work-history/route.js  # Work history
├── diary/
│   ├── route.js                   # Diary CRUD
│   ├── [id]/route.js              # Individual entry
│   ├── clock-out/route.js         # Quick clock-out
│   └── worker/[id]/route.js       # Worker diary
└── roles/
    ├── route.js                   # Role CRUD
    └── [id]/route.js              # Individual role
```
