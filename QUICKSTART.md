# Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Login

- Navigate to `http://localhost:3000`
- You'll be redirected to `/login`
- Use demo credentials:
  - Username: `admin`
  - Password: `admin123`

### 4. Explore the Dashboard

After login, you'll see the admin dashboard with:

- Left sidebar with navigation menu
- Top header with user profile dropdown
- Main content area with page title and breadcrumbs
- Footer

---

## 📁 File Structure Quick Reference

```
src/
├── app/              # Next.js pages
├── components/       # React components
├── hooks/            # Custom hooks
├── store/            # Redux + RTK Query
├── types/            # TypeScript types
├── utils/            # Utilities
├── constants/        # Constants
└── styles/           # Global styles
```

---

## 🔄 Common Tasks

### Add a New Page

1. Create file: `src/app/(admin)/page-name/page.tsx`
2. Add menu item in `src/constants/menu.ts`
3. Wrap content with `<AdminLayout>`

### Add a Form Field

1. Use `<FormInput>` or `<FormPassword>` from `@/components/common/form`
2. Pass `control` from `react-hook-form`
3. Add validation rules

### Fetch Data from API

1. Define endpoint in `src/store/api/yourApi.ts` using RTK Query
2. Use hook: `const { data } = useYourQuery()`
3. For mutations: `const [mutate] = useYourMutation()`

### Access Auth State

```typescript
const { user, isAuthenticated, logout } = useAuth();
```

---

## 🔒 Authentication

- **Login:** POST `/api/auth/login` with `{ username, password }`
- **Token Storage:** localStorage (`auth_token`)
- **State:** Redux + localStorage (synced via useAuth hook)
- **Route Protection:** Middleware + layout checks

---

## 📚 Architecture Highlights

- ✅ Clean folder structure
- ✅ Reusable form components
- ✅ RTK Query for API calls
- ✅ Type-safe Redux
- ✅ Middleware auth protection
- ✅ Composition pattern for layouts
- ✅ Server components by default

---

## 🛠️ Troubleshooting

### "Module not found" errors

→ Check path aliases in `tsconfig.json` (they should point to `./src/*`)

### Redux not working

→ Ensure `Provider` wraps the app in `app/layout.tsx`

### Forms not submitting

→ Make sure to pass `control` from `useForm()` to form components

### Auth not persisting

→ Check that localStorage is enabled and auth_token is being saved

---

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)
