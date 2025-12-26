# BlueChain MRV API Reference

## Table of Contents
1. [Authentication](#authentication)
2. [Profiles](#profiles)
3. [Projects](#projects)
4. [Sensor Data](#sensor-data)
5. [Wallet](#wallet)
6. [Purchases](#purchases)
7. [Storage](#storage)
8. [Realtime](#realtime)

---

## Authentication

### Sign Up
Create a new user account.

```typescript
import { api } from '@/services/api';

const { user, error } = await api.auth.signUp(
  'user@example.com',
  'securePassword123',
  {
    role: 'generator', // 'generator' | 'validator' | 'consumer'
    organization_name: 'Green Earth Foundation',
    registration_number: 'REG-2024-001',
  }
);
```

### Sign In
Authenticate an existing user.

```typescript
const { user, error } = await api.auth.signIn(
  'user@example.com',
  'securePassword123'
);
```

### Sign Out
Log out the current user.

```typescript
await api.auth.signOut();
```

### Get Current Session
Retrieve the current authentication session.

```typescript
const session = await api.auth.getSession();
```

### Get Current User
Get the authenticated user details.

```typescript
const user = await api.auth.getUser();
```

---

## Profiles

### Create Profile
Create a user profile (automatically done during sign up).

```typescript
const profile = await api.profiles.create({
  id: userId,
  role: 'generator',
  organization_name: 'Green Earth Foundation',
  registration_number: 'REG-2024-001',
  email: 'user@example.com',
});
```

### Get Profile
Retrieve a user's profile.

```typescript
const profile = await api.profiles.get(userId);
```

### Update Profile
Update profile information.

```typescript
const updatedProfile = await api.profiles.update(userId, {
  organization_name: 'Updated Organization Name',
  verification_status: 'verified',
});
```

---

## Projects

### Submit Project
Submit a new blue carbon project (Generator role only).

```typescript
const result = await api.projects.submit({
  name: 'Sundarbans Mangrove Restoration',
  hectares: 150,
  latitude: 21.9497,
  longitude: 88.9012,
  address: 'Sundarbans, West Bengal, India',
  photo_urls: [
    'https://example.com/photo1.jpg',
    'https://example.com/photo2.jpg',
  ],
  video_url: 'https://example.com/video.mp4',
});
```

### List Projects
Get a list of projects with optional filters.

```typescript
// Get all projects
const { projects } = await api.projects.list();

// Get verified projects only
const { projects } = await api.projects.list({ status: 'verified' });

// With pagination
const { projects } = await api.projects.list({
  status: 'under-review',
  limit: 20,
  offset: 0,
});
```

### Get Single Project
Retrieve details of a specific project.

```typescript
const project = await api.projects.get(projectId);
```

### Validate Project
Validate a project and update its status (Validator role only).

```typescript
const result = await api.projects.validate(projectId, {
  status: 'verified', // 'verified' | 'rejected' | 'under-review'
  co2_tons: 2250,
  validator_notes: 'All verification criteria met. Project approved.',
});
```

### Get My Projects
Get all projects submitted by the current user.

```typescript
const projects = await api.projects.getMyProjects();
```

---

## Sensor Data

### Submit Sensor Data
Submit IoT sensor readings for a project (Validator role only).

```typescript
const result = await api.sensorData.submit({
  project_id: projectId,
  temperature: 28.5,
  salinity: 35.2,
  ph: 8.1,
  dissolved_o2: 6.5,
  turbidity: 2.3,
});
```

### Get Sensor Data for Project
Retrieve all sensor readings for a specific project.

```typescript
const sensorReadings = await api.sensorData.getForProject(projectId);
```

---

## Wallet

### Create Wallet
Create a new wallet for the current user.

```typescript
const result = await api.wallet.create();
// Returns: { success: true, wallet: { id, address, balance_inr } }
```

### Get Wallet
Retrieve the current user's wallet information.

```typescript
const wallet = await api.wallet.get();
```

### Get Assets
Get all assets in a wallet.

```typescript
const assets = await api.wallet.getAssets(walletId);
```

### Get Transactions
Retrieve transaction history for a wallet.

```typescript
const transactions = await api.wallet.getTransactions(walletId);
// Returns last 20 transactions, ordered by date
```

---

## Purchases

### Create Purchase
Purchase carbon credits.

```typescript
const result = await api.purchases.create({
  credits: 100,
  price_per_credit: 150,
});
// Total cost: 100 * 150 = ₹15,000
```

### List Purchases
Get all purchases made by the current user.

```typescript
const purchases = await api.purchases.list();
```

---

## Storage

### Upload Project Photo
Upload a photo for a project.

```typescript
import { storage } from '@/services/storage';

const photoUrl = await storage.uploadProjectPhoto(userId, photoFile);
```

### Upload Project Video
Upload a video for a project.

```typescript
const videoUrl = await storage.uploadProjectVideo(userId, videoFile);
```

### Upload Document
Upload a verification document.

```typescript
const documentUrl = await storage.uploadDocument(userId, documentFile);
```

### Upload Multiple Photos
Upload multiple photos at once.

```typescript
const photoUrls = await storage.uploadMultiplePhotos(userId, [
  file1,
  file2,
  file3,
]);
```

### Delete File
Remove a file from storage.

```typescript
await storage.deleteFile('project-photos', 'userId/filename.jpg');
```

---

## Realtime

### Subscribe to Projects
Listen for changes to projects in real-time.

```typescript
import { realtimeService } from '@/services/realtime';

const unsubscribe = realtimeService.subscribeToProjects((payload) => {
  console.log('Project changed:', payload);
  // payload contains: { eventType, new, old, table, schema }
});

// Later, unsubscribe
unsubscribe();
```

### Subscribe to User Projects
Listen for changes to a specific user's projects.

```typescript
const unsubscribe = realtimeService.subscribeToUserProjects(
  userId,
  (payload) => {
    console.log('Your project changed:', payload);
  }
);
```

### Subscribe to Wallet
Listen for wallet transaction updates.

```typescript
const unsubscribe = realtimeService.subscribeToWallet(
  walletId,
  (payload) => {
    console.log('New transaction:', payload);
  }
);
```

### Subscribe to Assets
Listen for asset balance changes.

```typescript
const unsubscribe = realtimeService.subscribeToAssets(
  walletId,
  (payload) => {
    console.log('Asset balance changed:', payload);
  }
);
```

### Unsubscribe All
Stop all realtime subscriptions.

```typescript
realtimeService.unsubscribeAll();
```

---

## Error Handling

All API methods can throw errors. Always wrap calls in try-catch blocks:

```typescript
try {
  const result = await api.projects.submit(projectData);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
  // Show error message to user
}
```

## Common Error Types

- **Authentication Error**: User not logged in or token expired
- **Authorization Error**: User doesn't have permission for the action
- **Validation Error**: Invalid input data
- **Not Found Error**: Resource doesn't exist
- **Network Error**: Connection issues

## Rate Limits

Supabase applies rate limits to prevent abuse:
- API requests: 100 requests per second per user
- Storage uploads: 50 uploads per minute per user
- Realtime connections: 100 concurrent connections per project

## Best Practices

1. **Always check authentication** before making API calls
2. **Handle errors gracefully** with user-friendly messages
3. **Use realtime subscriptions** for live updates instead of polling
4. **Batch operations** when possible to reduce API calls
5. **Cache data locally** when appropriate
6. **Validate input** on the client side before sending to API
7. **Use TypeScript types** from database.ts for type safety
8. **Clean up subscriptions** when components unmount

## TypeScript Support

All API methods are fully typed. Import types from:

```typescript
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
```

## Testing

Use Supabase local development for testing:

```bash
# Start local Supabase
npx supabase start

# Run migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --local > src/types/database.ts
```

## Support

For issues or questions:
- Check the [Backend Setup Documentation](./BACKEND_SETUP.md)
- Review Supabase logs in the dashboard
- Inspect network requests in browser DevTools
- Verify environment variables are set correctly
