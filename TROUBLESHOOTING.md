# Common Issues and Solutions

## StrictPopulateError Issues

### Problem: "Cannot populate path `personal`"

**Cause**: Code trying to populate the old `personal` field that was removed from Project model.

**Solution**: Update populate calls to use new structure:

```javascript
// OLD (will cause error):
.populate('personal encargado')

// NEW (correct):
.populate('personalRoles.personalId personalRoles.roleId encargado')
```

**Common Locations**:

- Project API routes
- Project finalization API
- Any component fetching project data

### Problem: "Cannot populate path `role`"

**Cause**: DiaryEntry model not importing Role model for population.

**Solution**: Add Role model import to DiaryEntry model:

```javascript
// In diaryEntryModel.js
import "./roleModel.js";
```

## Role System Issues

### Problem: Role not displaying in components

**Check**:

1. API returning role data? (Check network tab)
2. Component receiving role prop correctly?
3. Role data structure matches expected format?

**Common Fix**: Ensure role data passed correctly from parent:

```javascript
// In ProjectDiary component
const assignedWorkers =
  projectData?.personalRoles?.map((pr) => ({
    ...pr.personalId,
    _roleId: pr.roleId, // Make sure this is populated
    _roleNotes: pr.notes,
  })) || [];
```

### Problem: Role snapshot not saved in diary entries

**Check**: Diary creation API capturing role correctly:

```javascript
// In /api/diary route.js
const personalRole = project.personalRoles?.find(
  (pr) => pr.personalId?._id?.toString() === workerId
);

if (personalRole && personalRole.roleId) {
  // Role capture logic should be here
}
```

## Data Migration Issues

### Problem: Old components still using `personal` field

**Solution**: Update component to use `personalRoles`:

```javascript
// OLD:
const assignedWorkers = projectData?.personal || [];

// NEW:
const assignedWorkers =
  projectData?.personalRoles?.map((pr) => pr.personalId) || [];
```

### Problem: Mixed data in database (some projects have old structure)

**Solution**: Run migration script or handle both structures:

```javascript
// Defensive coding
const workers =
  projectData?.personalRoles?.map((pr) => pr.personalId) ||
  projectData?.personal ||
  [];
```

## Performance Issues

### Problem: Too many API calls in components

**Solution**: Use React Query properly:

```javascript
// Good: Single query with all needed data
const { data: projectData } = useQuery({
  queryKey: ["project", projectId],
  queryFn: () => fetch(`/api/proyectos/${projectId}`).then((res) => res.json()),
});

// Bad: Multiple separate queries
const { data: project } = useQuery(/* project query */);
const { data: personnel } = useQuery(/* personnel query */);
const { data: roles } = useQuery(/* roles query */);
```

### Problem: Large populate queries

**Solution**: Only populate needed fields:

```javascript
// Good: Specific fields only
.populate('personalRoles.personalId', 'name email')
.populate('personalRoles.roleId', 'name color')

// Bad: Everything
.populate('personalRoles.personalId personalRoles.roleId')
```

## Form Handling Issues

### Problem: Form state not updating correctly

**Common in**: WorkerDiaryEntry time inputs

**Solution**: Ensure useEffect dependencies are correct:

```javascript
useEffect(() => {
  if (currentEntry) {
    // Update form state when entry changes
    setClockInTime(/* ... */);
    setClockOutTime(/* ... */);
  }
}, [currentEntry]); // Make sure dependency is correct
```

### Problem: Validation errors not showing

**Check**:

1. Error state being set correctly?
2. Error display component rendered?
3. Error cleared on successful operation?

```javascript
// Pattern for error handling
const [error, setError] = useState(null);

const handleSubmit = async () => {
  setError(null); // Clear previous errors
  try {
    // API call
  } catch (err) {
    setError(err.message);
  }
};
```

## Development Workflow Issues

### Problem: Server crashes on model changes

**Solution**:

1. Stop development server
2. Clear Next.js cache: `rm -rf .next`
3. Restart server: `npm run dev`

### Problem: Database connection issues

**Check**:

1. MongoDB running?
2. Database connection string correct?
3. Database name matches in all environments?

## Debugging Tips

### API Issues

1. Check browser Network tab for failed requests
2. Check server terminal for error logs
3. Use Postman/curl to test API endpoints directly

### Component Issues

1. Use React Developer Tools
2. Add console.logs for data flow
3. Check props being passed correctly

### Database Issues

1. Use MongoDB Compass to inspect data
2. Check collection names match model definitions
3. Verify populate paths exist in schema

### Quick Debugging Commands

```bash
# Check if server is running
curl http://localhost:3001/api/proyectos

# Check specific endpoint
curl http://localhost:3001/api/proyectos/[id]

# Check database connection
# (In MongoDB shell)
db.proyectos.findOne()
```
