# BlueChain MRV Backend Documentation

## Overview

The BlueChain MRV backend is built using Supabase and includes:
- PostgreSQL database with Row Level Security (RLS)
- Supabase Authentication
- Edge Functions for API endpoints
- Real-time capabilities

## Database Schema

### Tables

1. **profiles** - User profiles with role-based access
   - Roles: generator, validator, consumer
   - Verification status tracking
   - Organization information

2. **projects** - Blue carbon projects
   - Project details (name, location, hectares)
   - Status tracking (submitted, under-review, verified, rejected)
   - CO2 tons calculation
   - Photo and video URLs

3. **sensor_data** - IoT sensor readings
   - Temperature, salinity, pH, dissolved O2, turbidity
   - Linked to projects and validators
   - Timestamp tracking

4. **wallets** - User wallets
   - Blockchain addresses
   - Balance tracking

5. **assets** - Wallet assets
   - Different token types (BCC, USDC, ETH, MATIC)
   - Balance and INR value tracking

6. **transactions** - Transaction history
   - Types: received, sent, swap, buy
   - Status tracking
   - Address details

7. **purchases** - Carbon credit purchases
   - Credit amount and pricing
   - Wallet integration
   - Status tracking

## Edge Functions

### 1. submit-project
**Endpoint:** `/functions/v1/submit-project`
**Method:** POST
**Auth:** Required (Generator role)

Submit a new blue carbon project.

**Request Body:**
```json
{
  "name": "Project Name",
  "hectares": 150,
  "latitude": 21.9497,
  "longitude": 88.9012,
  "address": "Sundarbans, West Bengal",
  "photo_urls": ["url1", "url2"],
  "video_url": "video_url"
}
```

**Response:**
```json
{
  "success": true,
  "project": { /* project object */ }
}
```

### 2. validate-project
**Endpoint:** `/functions/v1/validate-project`
**Method:** POST
**Auth:** Required (Validator role)

Validate and update project status.

**Request Body:**
```json
{
  "project_id": "uuid",
  "status": "verified",
  "co2_tons": 2250,
  "validator_notes": "Project verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "project": { /* updated project */ }
}
```

### 3. purchase-credits
**Endpoint:** `/functions/v1/purchase-credits`
**Method:** POST
**Auth:** Required

Purchase carbon credits.

**Request Body:**
```json
{
  "credits": 100,
  "price_per_credit": 150
}
```

**Response:**
```json
{
  "success": true,
  "purchase": { /* purchase object */ }
}
```

### 4. submit-sensor-data
**Endpoint:** `/functions/v1/submit-sensor-data`
**Method:** POST
**Auth:** Required (Validator role)

Submit IoT sensor data for a project.

**Request Body:**
```json
{
  "project_id": "uuid",
  "temperature": 28.5,
  "salinity": 35.2,
  "ph": 8.1,
  "dissolved_o2": 6.5,
  "turbidity": 2.3
}
```

**Response:**
```json
{
  "success": true,
  "sensor_data": { /* sensor data object */ }
}
```

### 5. create-wallet
**Endpoint:** `/functions/v1/create-wallet`
**Method:** POST
**Auth:** Required

Create a new wallet for the user.

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": "uuid",
    "address": "0x...",
    "balance_inr": 0
  }
}
```

### 6. get-projects
**Endpoint:** `/functions/v1/get-projects`
**Method:** GET
**Auth:** Required

Get projects with optional filters.

**Query Parameters:**
- `status` - Filter by status (optional)
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "projects": [
    { /* project objects */ }
  ]
}
```

## Authentication

### Sign Up
```typescript
import { api } from '@/services/api';

const result = await api.auth.signUp(
  'user@example.com',
  'password123',
  {
    role: 'generator',
    organization_name: 'My Organization',
    registration_number: 'REG123'
  }
);
```

### Sign In
```typescript
const result = await api.auth.signIn('user@example.com', 'password123');
```

### Sign Out
```typescript
await api.auth.signOut();
```

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Users can only access their own data
- Generators can create and view their own projects
- Validators can view under-review and verified projects
- Consumers can view verified projects only
- Only validators can validate projects

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

The database migrations have been applied automatically. Your database includes:
- All tables with proper schemas
- Row Level Security policies
- Indexes for performance
- Triggers for automatic timestamp updates

### 3. Using the API

Import and use the API service:

```typescript
import { api } from '@/services/api';

// Submit a project
const result = await api.projects.submit({
  name: 'My Project',
  hectares: 100,
  latitude: 20.5,
  longitude: 85.3,
  address: 'Project Location'
});

// Purchase credits
const purchase = await api.purchases.create({
  credits: 50,
  price_per_credit: 150
});

// Get wallet
const wallet = await api.wallet.get();
```

### 4. Using the useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, profile, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // Show login form
  }

  return (
    <div>
      <p>Welcome, {profile?.organization_name}</p>
      <p>Role: {profile?.role}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## API Usage Examples

### Creating a Profile After Sign Up
```typescript
const { user } = await api.auth.signUp(
  'user@example.com',
  'password',
  { /* metadata */ }
);

await api.profiles.create({
  id: user.id,
  role: 'generator',
  organization_name: 'Eco Warriors',
  registration_number: 'REG-2024-001',
  email: 'user@example.com'
});
```

### Submitting a Project
```typescript
const project = await api.projects.submit({
  name: 'Mangrove Restoration Project',
  hectares: 150,
  latitude: 21.9497,
  longitude: 88.9012,
  address: 'Sundarbans, West Bengal',
  photo_urls: ['https://example.com/photo1.jpg'],
  video_url: 'https://example.com/video.mp4'
});
```

### Validating a Project
```typescript
const result = await api.projects.validate('project-id', {
  status: 'verified',
  co2_tons: 2250,
  validator_notes: 'All criteria met. Project verified.'
});
```

### Submitting Sensor Data
```typescript
const sensorData = await api.sensorData.submit({
  project_id: 'project-id',
  temperature: 28.5,
  salinity: 35.2,
  ph: 8.1,
  dissolved_o2: 6.5,
  turbidity: 2.3
});
```

### Creating a Wallet
```typescript
const wallet = await api.wallet.create();
console.log('New wallet address:', wallet.wallet.address);
```

### Purchasing Credits
```typescript
const purchase = await api.purchases.create({
  credits: 100,
  price_per_credit: 150
});
```

## Security Considerations

1. **Authentication Required**: All API endpoints require authentication
2. **Role-Based Access**: Each endpoint checks user role before allowing actions
3. **RLS Policies**: Database-level security ensures users can only access authorized data
4. **Input Validation**: All inputs are validated before processing
5. **Secure Tokens**: JWT tokens are used for authentication

## Error Handling

All API calls should be wrapped in try-catch blocks:

```typescript
try {
  const result = await api.projects.submit(projectData);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
}
```

## Testing

To test the backend:

1. Sign up a user with the appropriate role
2. Use the API service to make requests
3. Check the Supabase dashboard for data
4. Verify RLS policies work correctly

## Monitoring

Use Supabase Dashboard to:
- View database tables and data
- Monitor Edge Function logs
- Track authentication events
- Analyze performance metrics

## Support

For issues or questions:
1. Check Supabase logs in the dashboard
2. Review RLS policies
3. Verify environment variables
4. Check network requests in browser DevTools
