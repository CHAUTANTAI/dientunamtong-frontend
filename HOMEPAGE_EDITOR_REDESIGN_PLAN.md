# Homepage Editor Redesign Plan

## 📊 Phân tích Current State

### ❌ **Admin Editor Sections (Cũ - Không match Client)**
1. **Intro Section** - ❌ Không tồn tại trong Client
2. **Banner Section** - ❌ Không tồn tại trong Client
3. **Right Content Box** - ❌ Không tồn tại trong Client
4. **Left Sidebar Categories** - ⚠️ Tên không khớp, cần review
5. **Right Sidebar Items** - ⚠️ Tên không khớp, cần review
6. **Highlight Categories** - ❌ Không tồn tại trong Client
7. **Highlight Products** - ❌ Không tồn tại trong Client
8. **Slider Section** - ✅ Đã có, match Client
9. **Trending Keywords** - ✅ Đã có, match Client

### ✅ **Client Layout Actual Components**

#### **1. Layout Components (Ngoại trừ TopBar & Footer)**
```
ClientLayout.tsx:
├── TopBar                      ❌ KHÔNG EDIT (theo yêu cầu)
├── BannerHeader               🆕 CẦN THÊM EDITOR
│   ├── Logo                   → Edit logo image
│   ├── Banner Image           → Edit banner image
│   └── Hotlines               → Edit 2 hotline numbers
│
├── MegaMenu                   🆕 CẦN THÊM EDITOR
│   ├── Categories             → Auto from DB (không edit)
│   └── Static Items           → Edit: "Bảng giá", "Tem xe", "Video"
│
├── SearchSlogan               🆕 CẦN THÊM EDITOR
│   └── Slogan Text            → Edit slogan marquee text
│
├── SliderArea                 ✅ ĐÃ CÓ EDITOR
│   ├── Main Slides
│   └── Mini Ads
│
└── Footer                     ❌ KHÔNG EDIT (theo yêu cầu)
```

#### **2. HomePage Content (home-page.tsx)**
```
HomePage:
├── LeftSidebar                ⚠️ CẦN REVIEW/UPDATE EDITOR
│   └── Category Tree          → Categories auto from DB
│
├── Main Content (Center)
│   ├── TrendingKeywords       ✅ ĐÃ CÓ EDITOR
│   ├── ProductsSection        🆕 CẦN THÊM EDITOR
│   │   ├── Title              → Edit: "Phụ tùng xe"
│   │   ├── Limit              → Edit: 6
│   │   └── Mode               → auto/manual
│   │
│   ├── NewsSection            🆕 CẦN THÊM EDITOR
│   │   ├── Title              → Edit: "Tin tức xe"
│   │   ├── Limit              → Edit: 6
│   │   └── News Items         → Select manual news
│   │
│   └── VideoSection           🆕 CẦN THÊM EDITOR
│       ├── Title              → Edit title
│       └── Videos             → Add/remove videos
│
└── RightSidebar               ⚠️ CẦN REVIEW/UPDATE EDITOR
    ├── News Items             → Manual items
    └── Promotional Banners    → Optional ads
```

---

## 🎯 Action Plan

### Phase 1: Cleanup Old Sections ❌➡️🗑️
**Goal**: Xóa các sections không còn sử dụng

- [ ] Remove `IntroSection` + `IntroEditModal`
- [ ] Remove `BannerSection` + `BannerManageModal` (⚠️ khác với BannerHeader)
- [ ] Remove `RightContentBoxSection` + `RightContentBoxEditModal`
- [ ] Remove `HighlightCategoriesSection` + `HighlightCategoriesEditModal`
- [ ] Remove `HighlightProductsSection` (no modal exists yet)
- [ ] Clean up all references in `homepage-editor-page.tsx`
- [ ] Clean up `SectionIdentifier` enum in `types/pageSection.ts`

### Phase 2: Update TypeScript Types 📝
**File**: `frontend/src/types/pageSection.ts`

#### Add new content interfaces:
```typescript
// Layout Components
export interface BannerHeaderContent {
  logo_media_id?: string;          // Company logo
  banner_media_id?: string;        // Banner image
  primary_hotline?: string;        // Main phone
  secondary_hotline?: string;      // Secondary phone
}

export interface MegaMenuContent {
  static_items: Array<{
    id: string;
    label: string;
    href: string;
    order: number;
  }>;
}

export interface SearchSloganContent {
  slogan_text: string;             // Marquee text
}

// Already exists (keep these):
// - SliderContent ✅
// - TrendingKeywordsContent ✅

// HomePage Content Sections
export interface ProductsSectionContent {
  title: string;                   // "Phụ tùng xe"
  limit: number;                   // 6
  mode: 'auto' | 'manual';         // auto = latest, manual = selected
  product_ids?: string[];          // For manual mode
}

export interface NewsSectionContent {
  title: string;                   // "Tin tức xe"
  limit: number;                   // 6
  display_mode: 'auto' | 'manual'; // auto = latest, manual = selected
  news_ids?: string[];             // For manual mode
}

export interface VideoSectionContent {
  title?: string;                  // Optional title
  videos: Array<{
    id: string;
    title: string;
    thumbnail_url: string;
    video_url: string;             // YouTube/Vimeo URL
    description?: string;
  }>;
  layout_mode: 'carousel' | 'grid';
}

// Update SectionIdentifier enum
export type SectionIdentifier =
  // Layout sections
  | 'banner_header'
  | 'mega_menu'
  | 'search_slogan'
  | 'slider_section'
  
  // HomePage content sections
  | 'trending_keywords_section'
  | 'products_section'
  | 'news_section'
  | 'video_section'
  | 'left_sidebar'
  | 'right_sidebar';
```

### Phase 3: Create/Update Edit Modals 🎨

#### 3.1 New Modals to Create:

**BannerHeaderEditModal.tsx**
- Upload/select logo image
- Upload/select banner image
- Edit primary hotline (text input)
- Edit secondary hotline (text input)

**MegaMenuEditModal.tsx**
- List of static menu items (Bảng giá, Tem xe, Video)
- Add/Edit/Remove items
- Reorder items (drag & drop or up/down buttons)
- Each item: label, href, order

**SearchSloganEditModal.tsx**
- Simple text area for slogan text
- Preview marquee animation

**ProductsSectionEditModal.tsx**
- Edit title (default: "Phụ tùng xe")
- Edit limit (number input, default: 6)
- Mode selector: Auto (latest) / Manual (select products)
- If manual: Product selector (search & select)

**NewsSectionEditModal.tsx**
- Edit title (default: "Tin tức xe")
- Edit limit (number input, default: 6)
- Mode selector: Auto (latest) / Manual (select news)
- If manual: News selector (search & select)

**VideoSectionEditModal.tsx**
- Edit title (optional)
- Add/Remove videos
- Each video: title, thumbnail URL, video URL (YouTube/Vimeo), description
- Layout mode: Carousel / Grid

#### 3.2 Modals to Review/Update:

**LeftSidebarCategoriesEditModal.tsx** ➡️ Rename to **LeftSidebarEditModal.tsx**
- Review if it matches current `LeftSidebar.tsx` component
- Currently shows category tree (auto from DB)
- Might not need editing if it's purely auto

**RightSidebarItemsEditModal.tsx** ➡️ Rename to **RightSidebarEditModal.tsx**
- Review if it matches current `RightSidebar.tsx` component
- Edit news items list
- Edit promotional banner images

### Phase 4: Refactor homepage-editor-page.tsx 🔧

#### 4.1 State Management
Remove old states:
```typescript
// ❌ REMOVE
const [introSection, setIntroSection] = useState<PageSection | null>(null);
const [bannerSection, setBannerSection] = useState<PageSection | null>(null);
const [rightContentBoxSection, setRightContentBoxSection] = useState<PageSection | null>(null);
const [highlightCategoriesSection, setHighlightCategoriesSection] = useState<PageSection | null>(null);
const [highlightProductsSection, setHighlightProductsSection] = useState<PageSection | null>(null);
```

Add new states:
```typescript
// ✅ ADD - Layout sections
const [bannerHeaderSection, setBannerHeaderSection] = useState<PageSection | null>(null);
const [megaMenuSection, setMegaMenuSection] = useState<PageSection | null>(null);
const [searchSloganSection, setSearchSloganSection] = useState<PageSection | null>(null);
const [sliderSection, setSliderSection] = useState<PageSection | null>(null);

// ✅ ADD - HomePage content sections
const [trendingKeywordsSection, setTrendingKeywordsSection] = useState<PageSection | null>(null);
const [productsSectionState, setProductsSectionState] = useState<PageSection | null>(null);
const [newsSectionState, setNewsSectionState] = useState<PageSection | null>(null);
const [videoSectionState, setVideoSectionState] = useState<PageSection | null>(null);
const [leftSidebarSection, setLeftSidebarSection] = useState<PageSection | null>(null);
const [rightSidebarSection, setRightSidebarSection] = useState<PageSection | null>(null);

// Modal states
const [bannerHeaderModalOpen, setBannerHeaderModalOpen] = useState(false);
const [megaMenuModalOpen, setMegaMenuModalOpen] = useState(false);
const [searchSloganModalOpen, setSearchSloganModalOpen] = useState(false);
const [sliderModalOpen, setSliderModalOpen] = useState(false);
const [trendingKeywordsModalOpen, setTrendingKeywordsModalOpen] = useState(false);
const [productsSectionModalOpen, setProductsSectionModalOpen] = useState(false);
const [newsSectionModalOpen, setNewsSectionModalOpen] = useState(false);
const [videoSectionModalOpen, setVideoSectionModalOpen] = useState(false);
const [leftSidebarModalOpen, setLeftSidebarModalOpen] = useState(false);
const [rightSidebarModalOpen, setRightSidebarModalOpen] = useState(false);
```

#### 4.2 UI Structure
**Sidebar Navigation** (theo thứ tự xuất hiện trong layout):
```
📋 SECTIONS NAVIGATION
├── 1. Banner Header (Layout)
├── 2. Mega Menu (Layout)
├── 3. Search Slogan (Layout)
├── 4. Slider Section (Layout)
├── 5. Trending Keywords (HomePage)
├── 6. Products Section (HomePage)
├── 7. News Section (HomePage)
├── 8. Video Section (HomePage)
├── 9. Left Sidebar (HomePage)
└── 10. Right Sidebar (HomePage)
```

**Main Content Cards** (corresponding order)

#### 4.3 handleSaveAll Update
```typescript
sections: [
  {
    sectionIdentifier: 'banner_header',
    content: bannerHeaderSection.content,
    sortOrder: 0,
    isActive: true,
  },
  {
    sectionIdentifier: 'mega_menu',
    content: megaMenuSection.content,
    sortOrder: 1,
    isActive: true,
  },
  {
    sectionIdentifier: 'search_slogan',
    content: searchSloganSection.content,
    sortOrder: 2,
    isActive: true,
  },
  {
    sectionIdentifier: 'slider_section',
    content: sliderSection.content,
    sortOrder: 3,
    isActive: true,
  },
  {
    sectionIdentifier: 'trending_keywords_section',
    content: trendingKeywordsSection.content,
    sortOrder: 4,
    isActive: true,
  },
  {
    sectionIdentifier: 'products_section',
    content: productsSectionState.content,
    sortOrder: 5,
    isActive: true,
  },
  {
    sectionIdentifier: 'news_section',
    content: newsSectionState.content,
    sortOrder: 6,
    isActive: true,
  },
  {
    sectionIdentifier: 'video_section',
    content: videoSectionState.content,
    sortOrder: 7,
    isActive: true,
  },
  {
    sectionIdentifier: 'left_sidebar',
    content: leftSidebarSection.content,
    sortOrder: 8,
    isActive: true,
  },
  {
    sectionIdentifier: 'right_sidebar',
    content: rightSidebarSection.content,
    sortOrder: 9,
    isActive: true,
  },
]
```

### Phase 5: Connect Client Components to API 🔌

Update these components to fetch config from `useGetActivePageSectionsQuery`:

#### Layout Components:
- `BannerHeader.tsx` - fetch `banner_header` section
- `MegaMenu.tsx` - fetch `mega_menu` section  
- `SearchSlogan.tsx` - fetch `search_slogan` section
- `SliderArea.tsx` - ✅ Already connected
- `ClientFooter.tsx` - ❌ Skip (theo yêu cầu)

#### HomePage Content Components:
- `TrendingKeywords.tsx` - ✅ Already connected
- `ProductsSection.tsx` - fetch `products_section` section
- `NewsSection.tsx` - fetch `news_section` section
- `VideoSection.tsx` - fetch `video_section` section
- `LeftSidebar.tsx` - fetch `left_sidebar` section
- `RightSidebar.tsx` - fetch `right_sidebar` section

#### Connection Pattern (example):
```typescript
// In BannerHeader.tsx
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { BannerHeaderContent } from '@/types/pageSection';

export default function BannerHeader() {
  const { data: sections } = useGetActivePageSectionsQuery('homepage');
  const bannerHeaderSection = sections?.find(s => s.section_identifier === 'banner_header');
  const config = bannerHeaderSection?.content as BannerHeaderContent | undefined;

  // Use config with fallback
  const logoMediaId = config?.logo_media_id || systemInfo?.company_logo;
  const bannerMediaId = config?.banner_media_id || '/default-banner.png';
  const primaryHotline = config?.primary_hotline || systemInfo?.phone || '(0286) 271 3025';
  const secondaryHotline = config?.secondary_hotline || '0909 60 30 25';

  // ... render logic
}
```

---

## 📋 Implementation Checklist

### Phase 1: Cleanup ✅
- [ ] Remove old section imports in `homepage-editor-page.tsx`
- [ ] Remove old section states
- [ ] Remove old modal states
- [ ] Remove old useEffect initializations
- [ ] Remove old hasChanges comparisons
- [ ] Remove old handleSaveAll sections
- [ ] Remove old UI cards
- [ ] Remove old modal renderings
- [ ] Delete unused modal files (Intro, Banner, RightContentBox, HighlightCategories)

### Phase 2: Types ✅
- [ ] Add `BannerHeaderContent` interface
- [ ] Add `MegaMenuContent` interface
- [ ] Add `SearchSloganContent` interface
- [ ] Add `ProductsSectionContent` interface
- [ ] Add `NewsSectionContent` interface
- [ ] Add `VideoSectionContent` interface
- [ ] Update `SectionIdentifier` type
- [ ] Remove old section identifiers from enum

### Phase 3: Modals ✅
- [ ] Create `BannerHeaderEditModal.tsx`
- [ ] Create `MegaMenuEditModal.tsx`
- [ ] Create `SearchSloganEditModal.tsx`
- [ ] Create `ProductsSectionEditModal.tsx`
- [ ] Create `NewsSectionEditModal.tsx`
- [ ] Create `VideoSectionEditModal.tsx`
- [ ] Review/Update `LeftSidebarEditModal.tsx`
- [ ] Review/Update `RightSidebarEditModal.tsx`

### Phase 4: Homepage Editor Integration ✅
- [ ] Add new section states (10 sections)
- [ ] Add new modal states (10 modals)
- [ ] Update hasChanges useMemo
- [ ] Update useEffect initialization
- [ ] Update handleSaveAll
- [ ] Update sidebar navigation (10 items)
- [ ] Update main content cards (10 cards)
- [ ] Render all 10 modals

### Phase 5: Client Components API Connection ✅
- [ ] Connect `BannerHeader.tsx` to API
- [ ] Connect `MegaMenu.tsx` to API
- [ ] Connect `SearchSlogan.tsx` to API
- [ ] Connect `ProductsSection.tsx` to API
- [ ] Connect `NewsSection.tsx` to API
- [ ] Connect `VideoSection.tsx` to API
- [ ] Connect `LeftSidebar.tsx` to API
- [ ] Connect `RightSidebar.tsx` to API

### Phase 6: Testing ✅
- [ ] Test admin editor: Create/Edit each section
- [ ] Test save all sections
- [ ] Test client display: All sections render correctly
- [ ] Test responsive layout (mobile/tablet/desktop)
- [ ] Test fallback data when sections not configured

---

## 🎯 Success Criteria

✅ Admin có thể edit tất cả các phần trong layout (trừ TopBar & Footer):
  - BannerHeader (logo, banner, hotlines)
  - MegaMenu (static items)
  - SearchSlogan (slogan text)
  - SliderArea (slides, mini ads)

✅ Admin có thể edit tất cả HomePage content sections:
  - TrendingKeywords
  - ProductsSection
  - NewsSection
  - VideoSection
  - LeftSidebar
  - RightSidebar

✅ Client components tự động fetch config từ API

✅ Changes từ admin reflected ngay lập tức ở client

✅ Build & Lint pass successfully

---

## 📝 Notes

1. **TopBar & Footer**: Không edit theo yêu cầu user
2. **Categories trong MegaMenu**: Auto từ DB, chỉ edit static items
3. **LeftSidebar categories**: Auto từ DB, không cần edit
4. **Media Upload**: Sử dụng Supabase upload pattern đã có
5. **Sort Order**: Layout components (0-3), HomePage sections (4-9)
6. **Fallback Strategy**: Props > API > Hard-coded defaults

---

**Status**: READY TO IMPLEMENT 🚀
