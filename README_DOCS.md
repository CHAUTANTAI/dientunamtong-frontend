# Documentation Index

## 📚 Main Documentation

### Architecture & Overview
- **[CURRENT_ARCHITECTURE.md](../.cursor/CURRENT_ARCHITECTURE.md)** ⭐ **PRIMARY REFERENCE**
  - Complete system architecture (frontend + backend)
  - Current homepage layout & sections
  - Admin CMS architecture
  - **Status**: ✅ Accurate (Updated 2026-03-18)

- **[ARCHITECTURE.md](ARCHITECTURE.md)**
  - General frontend architecture
  - Folder structure
  - Authentication flow
  - **Status**: ✅ Still accurate

### Technical Guides
- **[QUICKSTART.md](QUICKSTART.md)**
  - Development setup
  - Getting started guide
  - **Status**: ✅ Useful for onboarding

- **[MIGRATION_PRIVATE_TO_PUBLIC_BUCKET.md](MIGRATION_PRIVATE_TO_PUBLIC_BUCKET.md)**
  - Supabase storage migration guide
  - Private → Public bucket transition
  - **Status**: ✅ Technical reference (completed migration)

- **[SUPABASE_STORAGE_GUIDE.md](SUPABASE_STORAGE_GUIDE.md)**
  - Supabase storage usage patterns
  - **Status**: 🔍 Need to review

### Refactor Documentation
- **[CATEGORY_REFACTOR.md](CATEGORY_REFACTOR.md)**
  - Category system refactoring notes
  - **Status**: 🔍 Historical reference

- **[AUTH_REFACTOR.md](AUTH_REFACTOR.md)**
  - Authentication refactoring notes
  - **Status**: 🔍 Historical reference

---

## 🗂️ Backend Documentation

- **[PAGE_SECTIONS_CONTENT_STRUCTURE.md](../backend/docs/PAGE_SECTIONS_CONTENT_STRUCTURE.md)**
  - Database schema for page_sections
  - JSONB content structure
  - All section types with examples
  - **Status**: ✅ Just updated (2026-03-18)

---

## 🗑️ Deleted Files (Outdated)

The following files were removed during cleanup on 2026-03-18:

- ❌ `.cursor/homepage-layout.md` - Outdated layout (replaced by CURRENT_ARCHITECTURE.md)
- ❌ `frontend/HOMEPAGE_EDITOR_REDESIGN_PLAN.md` - Old plan (superseded)
- ❌ `frontend/HOMEPAGE_EDITOR_INTEGRATION.md` - Old integration guide (obsolete)
- ❌ `frontend/REDESIGN_SUMMARY.md` - Old redesign notes (obsolete)
- ❌ `frontend/INTEGRATION_COMPLETE.md` - Partial completion report (obsolete)
- ❌ `frontend/PROJECT_SUMMARY.md` - Old project summary (89% complete snapshot, superseded by CURRENT_ARCHITECTURE.md)

---

## 📖 How to Use This Documentation

### For New Developers:
1. Start with **QUICKSTART.md** for setup
2. Read **ARCHITECTURE.md** for general structure
3. Read **CURRENT_ARCHITECTURE.md** for current state

### For Feature Development:
1. Check **CURRENT_ARCHITECTURE.md** for system overview
2. Check **PAGE_SECTIONS_CONTENT_STRUCTURE.md** for backend schemas
3. Check specific refactor docs if touching that system

### For DevOps/Infrastructure:
1. Read **MIGRATION_PRIVATE_TO_PUBLIC_BUCKET.md** for storage setup
2. Read **SUPABASE_STORAGE_GUIDE.md** for storage patterns

---

**Last Updated**: 2026-03-18  
**Documentation Maintained By**: Development Team
