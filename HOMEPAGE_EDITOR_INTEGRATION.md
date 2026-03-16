# Homepage Editor Integration Guide

## ✅ Completed Foundation

### 1. Types & Schemas ✓
- `SliderContent`, `TrendingKeywordsContent`, `ProductsSectionContent`, `NewsSectionContent`, `VideoSectionContent` trong `pageSection.ts`
- Updated `SectionIdentifier` enum with 5 new sections

### 2. Admin Modals ✓
- `SliderEditModal.tsx` - Manage slides + mini ads + settings
- `TrendingKeywordsEditModal.tsx` - Manage keywords with sorting

### 3. Client Components ✓
- `MainSlider.tsx` - Refactored slider component
- `MiniAdsColumn.tsx` - Refactored mini ads component
- `SliderArea.tsx` - Container với props interface
- `TrendingKeywords.tsx` - Với props interface configurable

---

## 📝 TODO: Homepage Editor Integration

### Step 1: Add imports to `homepage-editor-page.tsx`

```typescript
import type { SliderContent, TrendingKeywordsContent } from '@/types/pageSection';
import SliderEditModal from './SliderEditModal';
import TrendingKeywordsEditModal from './TrendingKeywordsEditModal';
```

### Step 2: Add state variables (after line 37)

```typescript
// New homepage sections
const [sliderSection, setSliderSection] = useState<PageSection | null>(null);
const [trendingKeywordsSection, setTrendingKeywordsSection] = useState<PageSection | null>(null);
```

### Step 3: Add modal states (after line 50)

```typescript
const [sliderModalOpen, setSliderModalOpen] = useState(false);
const [trendingKeywordsModalOpen, setTrendingKeywordsModalOpen] = useState(false);
```

### Step 4: Initialize sections trong `useEffect` (after line 186)

```typescript
const slider = sections.find(s => s.section_identifier === 'slider_section');
setSliderSection(slider || {
  id: '',
  page_identifier: 'homepage',
  section_identifier: 'slider_section',
  content: { slides: [], mini_ads: [], slider_settings: {}, mini_ad_settings: {} },
  sort_order: 7,
  is_active: true,
  created_at: '',
  updated_at: '',
});

const trendingKeywords = sections.find(s => s.section_identifier === 'trending_keywords_section');
setTrendingKeywordsSection(trendingKeywords || {
  id: '',
  page_identifier: 'homepage',
  section_identifier: 'trending_keywords_section',
  content: { title: 'Xu hướng tìm kiếm:', show_icon: true, keywords: [] },
  sort_order: 8,
  is_active: true,
  created_at: '',
  updated_at: '',
});
```

### Step 5: Add to `handleSaveAll` sections array (after line 298)

```typescript
{
  sectionIdentifier: 'slider_section',
  content: sliderSection.content,
  sortOrder: 7,
  isActive: true,
},
{
  sectionIdentifier: 'trending_keywords_section',
  content: trendingKeywordsSection.content,
  sortOrder: 8,
  isActive: true,
},
```

### Step 6: Add to hasChanges check (after line 96)

```typescript
const slider = sections.find(s => s.section_identifier === 'slider_section');
if (slider && sliderSection && compareContent(slider.content, sliderSection.content)) return true;

const trendingKw = sections.find(s => s.section_identifier === 'trending_keywords_section');
if (trendingKw && trendingKeywordsSection && compareContent(trendingKw.content, trendingKeywordsSection.content)) return true;
```

### Step 7: Add sidebar buttons (after line 437)

```typescript
<Button
  type="text"
  block
  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
  onClick={() => document.getElementById('slider-section')?.scrollIntoView({ behavior: 'smooth' })}
>
  8. Slider Section
</Button>
<Button
  type="text"
  block
  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
  onClick={() => document.getElementById('trending-keywords-section')?.scrollIntoView({ behavior: 'smooth' })}
>
  9. Trending Keywords
</Button>
```

### Step 8: Add Card sections (after line 625)

```typescript
{/* Slider Section */}
<Card
  id="slider-section"
  title={
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>Slider Section</span>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setSliderModalOpen(true)}
      >
        Edit Slider
      </Button>
    </div>
  }
>
  {sliderSection?.content?.slides?.length > 0 || sliderSection?.content?.mini_ads?.length > 0 ? (
    <Text>
      {sliderSection.content.slides?.length || 0} slides, {sliderSection.content.mini_ads?.length || 0} mini ads configured
    </Text>
  ) : (
    <Text type="secondary">No slides configured</Text>
  )}
</Card>

{/* Trending Keywords Section */}
<Card
  id="trending-keywords-section"
  title={
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>Trending Keywords Section</span>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setTrendingKeywordsModalOpen(true)}
      >
        Edit Keywords
      </Button>
    </div>
  }
>
  {trendingKeywordsSection?.content?.keywords?.length > 0 ? (
    <Text>
      {trendingKeywordsSection.content.keywords.length} keywords configured
    </Text>
  ) : (
    <Text type="secondary">No keywords configured</Text>
  )}
</Card>
```

### Step 9: Add modals (after line 723)

```typescript
{sliderSection && (
  <SliderEditModal
    open={sliderModalOpen}
    onClose={() => setSliderModalOpen(false)}
    content={sliderSection.content as unknown as SliderContent}
    onSave={(newContent) => {
      setSliderSection({
        ...sliderSection,
        content: newContent as unknown as Record<string, unknown>,
      } as PageSection);
      setSliderModalOpen(false);
      message.success('Slider updated. Click "Save All" to persist changes.');
    }}
  />
)}

{trendingKeywordsSection && (
  <TrendingKeywordsEditModal
    open={trendingKeywordsModalOpen}
    onClose={() => setTrendingKeywordsModalOpen(false)}
    content={trendingKeywordsSection.content as unknown as TrendingKeywordsContent}
    onSave={(newContent) => {
      setTrendingKeywordsSection({
        ...trendingKeywordsSection,
        content: newContent as unknown as Record<string, unknown>,
      } as PageSection);
      setTrendingKeywordsModalOpen(false);
      message.success('Keywords updated. Click "Save All" to persist changes.');
    }}
  />
)}
```

---

## 🔄 Next Steps

After Homepage Editor integration:
1. Update `SliderArea` component to fetch from API
2. Update `TrendingKeywords` component to fetch from API  
3. Update `home-page.tsx` to use API data
4. Test complete flow
