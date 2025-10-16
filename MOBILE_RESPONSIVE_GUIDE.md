# Hướng Dẫn Responsive Design - Fabric Library

## 📱 Tổng Quan

Ứng dụng Fabric Library đã được tối ưu hóa hoàn toàn cho mobile với thiết kế responsive hiện đại, animations mượt mà kiểu macOS/iOS, và giao diện hoàn toàn bằng tiếng Việt.

---

## 🎯 Breakpoints

### Kích thước màn hình
```css
Mobile:   < 640px   (Tailwind: default)
Tablet:   640-1024px (Tailwind: sm, md)
Desktop:  > 1024px   (Tailwind: lg, xl, 2xl)
```

### Grid Layout
- **Mobile**: 2 cột
- **Tablet**: 3 cột
- **Desktop**: 3-5 cột (tùy kích thước)

---

## 📲 Mobile Features

### 1. Bottom Sheet Filters
**Vị trí**: Trang `/fabrics`

**Cách hoạt động**:
- Trên mobile, filters không hiển thị ở sidebar
- Click nút "Bộ lọc" (filter icon) ở header
- Bottom sheet slide up từ dưới lên
- Swipe down hoặc click backdrop để đóng

**Animation**:
```tsx
// Spring animation
type: 'spring'
damping: 30
stiffness: 300
```

**Code example**:
```tsx
// Mobile filter button
<button onClick={() => setMobileFiltersOpen(true)}>
  <AdjustmentsHorizontalIcon />
  Bộ lọc
</button>

// Bottom sheet
<FabricFilters
  isMobile={true}
  isOpen={mobileFiltersOpen}
  onClose={() => setMobileFiltersOpen(false)}
/>
```

### 2. Touch-Friendly UI
**Minimum tap target**: 44x44px (iOS guideline)

**Active states**:
```tsx
// Scale down on tap
whileTap={{ scale: 0.95 }}

// CSS active state
active:scale-95
```

**Examples**:
- Buttons: Min height 44px
- Filter dropdowns: Larger padding
- Cards: Easier to tap

### 3. Responsive Header
**Desktop**:
- Full logo + text
- Wide search bar (320px)
- All buttons visible
- User avatar

**Mobile**:
- Compact logo
- Narrow search bar (160px)
- Filter button
- Hamburger menu (future)
- Hidden user avatar

**Code**:
```tsx
// Responsive search bar
<input className="w-40 sm:w-60 lg:w-80" />

// Hidden on mobile
<div className="hidden lg:flex">
  User Avatar
</div>
```

### 4. Responsive Grid
**Auto-responsive**:
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
  {fabrics.map(fabric => <FabricCard />)}
</div>
```

**Gap spacing**:
- Mobile: `gap-3` (12px)
- Desktop: `gap-6` (24px)

### 5. Responsive Padding
**Container padding**:
```tsx
// Mobile: 16px, Desktop: 32px
<div className="px-4 lg:px-8">
```

**Vertical spacing**:
```tsx
// Mobile: 24px, Desktop: 32px
<div className="py-6 lg:py-8">
```

---

## ✨ Animations

### 1. Page Load Animations
**Header slide down**:
```tsx
<motion.div
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
/>
```

**Sidebar slide in**:
```tsx
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ delay: 0.2 }}
/>
```

**Content fade in**:
```tsx
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.3 }}
/>
```

### 2. Card Animations
**Hover lift** (desktop only):
```tsx
<motion.div
  whileHover={{ y: -4 }}
  transition={{ type: 'spring', stiffness: 300 }}
/>
```

**Tap scale**:
```tsx
<motion.div
  whileTap={{ scale: 0.98 }}
/>
```

**Image zoom on hover**:
```css
group-hover:scale-110
transition-all duration-500
```

### 3. Staggered Grid Animation
**Sequential reveal**:
```tsx
{fabrics.map((fabric, index) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <FabricCard />
  </motion.div>
))}
```

**Effect**: Cards appear one by one with 50ms delay

### 4. Loading States
**Spinning loader**:
```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  className="border-2 border-cyan-500 border-t-transparent"
/>
```

**Skeleton pulse**:
```tsx
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ duration: 1.5, repeat: Infinity }}
  className="bg-gray-200"
/>
```

### 5. Filter Animations
**Staggered filter sections**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }} // 0.1s, 0.2s, 0.3s, 0.4s
/>
```

### 6. Empty State Animation
**Scale in**:
```tsx
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
/>
```

---

## 🇻🇳 Việt Hóa

### Sử dụng Translation Function
```tsx
import { t } from '@/lib/translations'

// Basic usage
t('common.save')           // → "Lưu"
t('fabric.title')          // → "Thư Viện Vải"
t('filters.clearFilters')  // → "Xóa bộ lọc"

// With parameters
t('messages.itemsFound', { count: 10 })
// → "Tìm thấy 10 mục"
```

### Translation Categories
```typescript
{
  common: {},      // Từ chung
  nav: {},         // Navigation
  fabric: {},      // Vải vóc
  filters: {},     // Bộ lọc
  priceRanges: {}, // Khoảng giá
  upload: {},      // Upload
  messages: {},    // Thông báo
  placeholders: {} // Placeholders
}
```

### Thêm Translation Mới
**File**: `lib/translations.ts`

```typescript
export const translations = {
  common: {
    // Thêm từ mới
    newWord: 'Từ mới',
  }
}
```

---

## 🎨 Color Detection

### Sử dụng trong Upload Form
```tsx
import ColorDetectionPreview from '@/components/ColorDetectionPreview'

<ColorDetectionPreview
  imageFile={selectedImage}
  onColorSelect={(color) => setDetectedColor(color)}
  selectedColor={detectedColor}
/>
```

### Props
- `imageFile`: File object của ảnh
- `onColorSelect`: Callback khi chọn màu
- `selectedColor`: Màu đang được chọn

### Features
- Tự động detect 5 màu dominant
- Hiển thị confidence %
- Click để chọn màu khác
- Smooth animations

### Màu sắc hỗ trợ
13 màu: Đỏ, Hồng, Cam, Vàng, Xanh lá, Xanh dương, Xanh navy, Tím, Nâu, Kem, Xám, Trắng, Đen

---

## 🧪 Testing Guide

### Desktop Testing
1. Mở http://localhost:4000/fabrics
2. Kiểm tra sidebar filters bên trái
3. Hover vào cards → lift animation
4. Click vào filter → smooth dropdown
5. Resize window → responsive grid

### Mobile Testing (Chrome DevTools)
1. F12 → Toggle device toolbar
2. Chọn iPhone/Android device
3. Kiểm tra:
   - Grid 2 cột
   - Bottom sheet filters
   - Touch-friendly buttons
   - Compact header
   - Smooth animations

### Tablet Testing
1. Chọn iPad device
2. Kiểm tra:
   - Grid 3 cột
   - Sidebar vẫn hiển thị
   - Medium spacing

### Performance Testing
1. Lighthouse audit
2. Check FPS during animations
3. Test on slow 3G
4. Check image lazy loading

---

## 🚀 Performance Tips

### Images
```tsx
// Lazy loading
loading="lazy"

// Responsive sizes
sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"

// Skeleton while loading
{!imageLoaded && <SkeletonLoader />}
```

### Animations
```tsx
// GPU-accelerated properties only
transform: translateY() // ✅
opacity // ✅
height // ❌ (causes reflow)
```

### Reduce Motion
```tsx
// Respect user preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📝 Best Practices

### 1. Mobile-First Approach
```tsx
// ✅ Good: Start with mobile, enhance for desktop
<div className="px-4 lg:px-8">

// ❌ Bad: Desktop-first
<div className="px-8 sm:px-4">
```

### 2. Touch Targets
```tsx
// ✅ Good: Min 44x44px
<button className="h-11 px-4">

// ❌ Bad: Too small
<button className="h-6 px-2">
```

### 3. Animations
```tsx
// ✅ Good: Subtle, purposeful
whileHover={{ y: -4 }}

// ❌ Bad: Excessive, distracting
whileHover={{ scale: 2, rotate: 360 }}
```

### 4. Loading States
```tsx
// ✅ Good: Show skeleton
{loading && <Skeleton />}

// ❌ Bad: Blank screen
{loading && null}
```

---

## 🐛 Troubleshooting

### Bottom Sheet không mở
**Kiểm tra**:
- `mobileFiltersOpen` state
- `isMobile` detection
- AnimatePresence wrapper

### Animations lag
**Giải pháp**:
- Reduce motion complexity
- Use GPU-accelerated properties
- Check for layout thrashing

### Grid không responsive
**Kiểm tra**:
- Tailwind breakpoints
- Container width
- Grid column classes

---

## 📚 Resources

### Framer Motion
- Docs: https://www.framer.com/motion/
- Examples: https://www.framer.com/motion/examples/

### Tailwind CSS
- Docs: https://tailwindcss.com/docs
- Responsive: https://tailwindcss.com/docs/responsive-design

### iOS Design Guidelines
- Human Interface Guidelines
- Touch targets: 44x44pt minimum

---

## ✅ Checklist

### Mobile Optimization
- [x] Bottom sheet filters
- [x] Touch-friendly buttons (44x44px)
- [x] Responsive grid (2 cols)
- [x] Compact header
- [x] Lazy loading images
- [ ] Hamburger menu (future)
- [ ] Swipe gestures (future)

### Animations
- [x] Page load animations
- [x] Card hover/tap
- [x] Filter stagger
- [x] Loading spinner
- [x] Bottom sheet slide
- [x] Skeleton loading

### Localization
- [x] Vietnamese translations
- [x] Translation helper function
- [x] All UI text translated
- [x] Textile terminology

### Color Detection
- [x] Auto-detect dominant colors
- [x] Visual preview component
- [x] 13 Vietnamese color names
- [ ] Integration with upload form (pending)

---

## 🎯 Next Steps

1. **Integrate color detection** vào fabric upload form
2. **Add hamburger menu** cho mobile navigation
3. **Implement swipe gestures** cho image gallery
4. **Add PWA support** để install app
5. **Optimize images** với next/image
6. **Add accessibility** (ARIA labels, keyboard nav)
7. **Performance monitoring** với analytics
8. **A/B testing** color detection accuracy

---

**Cập nhật lần cuối**: 2025-10-11
**Version**: 2.0.0
**Tác giả**: Augment Agent

