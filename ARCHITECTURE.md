# Admin System Architecture Documentation

## 📋 Overview

This document describes the clean, scalable architecture of the admin system built with Next.js (App Router), Ant Design, and Redux Toolkit.

---

## 🗂️ Folder Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Authentication layout group
│   │   ├── login/
│   │   │   ├── page.tsx           # Login page
│   │   │   └── page.module.css    # Login styles
│   │   └── layout.tsx             # Auth layout (simple)
│   │
│   └── (admin)/                   # Admin layout group (protected)
│       ├── layout.tsx             # Admin shell layout with auth check
│       ├── dashboard/
│       │   └── page.tsx           # Dashboard home
│       └── [other admin pages]/
│
├── components/                    # Reusable components
│   ├── layout/
│   │   ├── AdminLayout.tsx        # Main admin layout wrapper
│   │   ├── Sidebar.tsx            # Left sidebar navigation
│   │   ├── Header.tsx             # Top header with user menu
│   │   ├── Breadcrumbs.tsx        # Page breadcrumbs
│   │   └── Footer.tsx             # Footer component
│   │
│   ├── common/
│   │   └── form/
│   │       ├── FormInput.tsx      # Common input with react-hook-form
│   │       ├── FormPassword.tsx   # Common password input
│   │       ├── FormSubmitButton.tsx
│   │       └── index.ts           # Barrel export
│   │
│   └── ui/                        # Pure UI components (extensible)
│
├── hooks/                         # Custom React hooks
│   ├── useAuth.ts                 # Auth state + operations
│   └── useNavigation.ts           # Navigation state (sidebar collapse)
│
├── store/                         # Redux Toolkit + RTK Query
│   ├── index.ts                   # Store configuration
│   ├── api/
│   │   └── authApi.ts             # Auth API endpoints (RTK Query)
│   └── slices/
│       └── authSlice.ts           # Auth state slice
│
├── types/                         # TypeScript interfaces
│   ├── auth.ts                    # Login/User types
│   ├── user.ts                    # User entity types
│   └── api.ts                     # API response types
│
├── utils/                         # Utility functions
│   ├── api-client.ts              # Fetch wrapper + headers
│   ├── auth.ts                    # localStorage helpers
│   └── validators.ts              # Form validation rules
│
├── constants/                     # App-wide constants
│   ├── routes.ts                  # Route definitions
│   └── menu.ts                    # Sidebar menu config
│
└── styles/                        # Global styles
    └── globals.css                # Global CSS
```

---

## 🔐 Authentication Flow

### 1. **Login Process**

```
User inputs credentials
        ↓
Login form (react-hook-form)
        ↓
RTK Query mutation (authApi.login)
        ↓
API returns { success, token, user }
        ↓
useAuth hook saves to localStorage + Redux
        ↓
Redirect to dashboard
```

### 2. **Route Protection**

```
User navigates to /dashboard
        ↓
Middleware checks auth_token cookie
        ↓
If missing → Redirect to /login
If present → Render layout + page
        ↓
Admin layout checks Redux auth state
        ↓
If not authenticated → Show spinner + redirect to login
If authenticated → Render dashboard
```

### 3. **Auth State Persistence**

- **Storage:** localStorage (`auth_token`, `auth_user`)
- **Restoration:** `useAuth` hook restores on app mount
- **Sync:** Redux state mirrors localStorage

---

## 🎯 Key Architectural Decisions

### 1. **Layout Groups for Separation**
- `(auth)` - Public pages (login)
- `(admin)` - Protected pages (dashboard, etc.)
- **Benefit:** Different UI shells without URL changes

### 2. **RTK Query for API Calls**
- Automatic caching & deduplication
- Request/response hooks (useLoginMutation)
- Single source of truth for API data
- **Follows Vercel Best Practice:** `async-parallel`, `server-cache-react`

### 3. **Redux for Auth State**
- Centralized auth state management
- Easy access from any component
- Persistence via useAuth hook

### 4. **Composition Pattern for Forms**
- `FormInput`, `FormPassword` encapsulate react-hook-form integration
- Reusable, DRY form fields
- Consistent validation

### 5. **Server Components by Default**
- Pages are Server Components
- Client Components used only for interactivity (forms, dropdowns)
- Smaller JS bundle

### 6. **Middleware for Route Protection**
- Centralized auth check
- Redirects non-auth users to login
- No component-level guards needed

---

## 📦 State Management

### Redux Store Structure

```typescript
store: {
  auth: {
    user: AuthUser | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null,
  },
  authApi: { ... } // RTK Query cache
}
```

### Using Auth State

```typescript
// In components
const { isAuthenticated, user, login, logout } = useAuth();

// Or access Redux directly
const auth = useAppSelector((state) => state.auth);
const dispatch = useAppDispatch();
```

---

## 🔗 Data Flow: Login Example

```
Login Page (Client Component)
    ↓
react-hook-form (FormInput, FormPassword)
    ↓
useLoginMutation (RTK Query)
    ↓
POST /api/auth/login
    ↓
Response: { token, user }
    ↓
useAuth.login() → Save to localStorage + Redux
    ↓
router.push('/dashboard')
    ↓
Admin Layout checks auth → Renders dashboard
```

---

## 🛠️ How to Add a New Page

### 1. Create the page file

```typescript
// src/app/(admin)/users/page.tsx
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';

export default function UsersPage() {
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users' },
  ];

  return (
    <AdminLayout pageTitle="Users" breadcrumbs={breadcrumbs}>
      {/* Page content */}
    </AdminLayout>
  );
}
```

### 2. Add to sidebar menu

```typescript
// src/constants/menu.ts
export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: ROUTES.DASHBOARD },
  { key: 'users', label: 'Users', href: '/users' }, // Add this
];
```

### 3. Add route constant (optional but recommended)

```typescript
// src/constants/routes.ts
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users', // Add this
} as const;
```

---

## 🔄 How to Add a New Form

### 1. Create form component

```typescript
// src/components/forms/UserForm.tsx
'use client';

import { Form } from 'antd';
import { useForm } from 'react-hook-form';
import { FormInput, FormSubmitButton } from '@/components/common/form';
import { validateEmail } from '@/utils/validators';

interface UserFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const UserForm = ({ onSubmit, isLoading }: UserFormProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: { email: '', username: '' },
  });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <FormInput
        name="username"
        control={control}
        label="Username"
        rules={{ required: 'Required' }}
      />

      <FormInput
        name="email"
        control={control}
        label="Email"
        type="email"
        rules={{
          validate: validateEmail,
        }}
      />

      <FormSubmitButton isLoading={isLoading}>Save</FormSubmitButton>
    </Form>
  );
};
```

### 2. Use in a page

```typescript
// src/app/(admin)/users/create/page.tsx
'use client';

import { UserForm } from '@/components/forms/UserForm';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function CreateUserPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    // Call API
    setIsLoading(false);
  };

  return (
    <AdminLayout pageTitle="Create User">
      <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
    </AdminLayout>
  );
}
```

---

## 🚀 How to Add an API Endpoint

### 1. Define in RTK Query

```typescript
// src/store/api/userApi.ts
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
    }),
  }),
});

export const { useGetUsersQuery, useCreateUserMutation } = userApi;
```

### 2. Add to store

```typescript
// src/store/index.ts
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer, // Add this
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(userApi.middleware), // Add this
});
```

### 3. Use in component

```typescript
const { data: users, isLoading } = useGetUsersQuery();
const [createUser] = useCreateUserMutation();

await createUser({ name: 'John' });
```

---

## 📝 Best Practices Applied

| Practice | Implementation | Benefit |
|----------|----------------|---------|
| **DRY (Don't Repeat)** | Common components, hooks, utils | Easy to maintain |
| **Composition** | Form components, layout components | Reusable, flexible |
| **Type Safety** | Strict TypeScript, centralized types | Catch errors early |
| **Separation of Concerns** | API → store → hooks → components | Clear dependencies |
| **Scalability** | Folder structure supports growth | Easy to add features |
| **Performance** | Server components, lazy loading ready | Smaller JS bundle |
| **Auth Protection** | Middleware + layout checks | Secure routes |

---

## 🎓 Technologies Used

- **Framework:** Next.js 16 (App Router)
- **UI Library:** Ant Design 5
- **State Management:** Redux Toolkit + RTK Query
- **Forms:** react-hook-form
- **Language:** TypeScript (strict mode)
- **Styling:** Ant Design + CSS Modules

---

## 📚 Quick Reference

### Common Imports

```typescript
// Hooks
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@/hooks/useNavigation';

// Components
import { AdminLayout } from '@/components/layout/AdminLayout';
import { FormInput, FormPassword } from '@/components/common/form';

// Utils
import { validateUsername } from '@/utils/validators';
import { getAuthToken, saveAuthToken } from '@/utils/auth';

// Redux
import { useAppDispatch, useAppSelector } from '@/store';

// Constants
import { ROUTES } from '@/constants/routes';
import { ADMIN_MENU_ITEMS } from '@/constants/menu';
```

---

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

---

## ✨ Next Steps

1. **Add more API endpoints** via RTK Query in `src/store/api/`
2. **Create domain-specific pages** in `src/app/(admin)/`
3. **Add more form components** in `src/components/common/form/`
4. **Implement real authentication** by updating `authApi.ts`
5. **Add unit tests** following the same folder structure

---

**Architecture Version:** 1.0  
**Last Updated:** Feb 3, 2026
