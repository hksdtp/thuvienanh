# 🚀 IMPLEMENTATION PLAN - REDESIGN THƯ VIỆN ANH

## Kế hoạch triển khai theo phong cách Apple App Store Today Tab

---

## PHASE 1: FOUNDATION (Ngày 1-2)

### 1.1 Setup Design Tokens
**Files to create/modify**:
- `styles/design-tokens.css` - CSS variables cho design system
- `tailwind.config.js` - Update Tailwind config với tokens mới

**Tasks**:
- [ ] Tạo CSS variables cho colors, typography, spacing
- [ ] Update Tailwind theme với design tokens
- [ ] Test design tokens trên một component mẫu

**Estimated time**: 2-3 hours

---

### 1.2 Typography System
**Files to create/modify**:
- `styles/typography.css` - Typography classes
- `app/globals.css` - Update global styles

**Tasks**:
- [ ] Implement font stack (SF Pro Display fallback)
- [ ] Create typography utility classes (.text-display, .text-title1, etc.)
- [ ] Test typography trên các màn hình khác nhau

**Estimated time**: 2 hours

---

### 1.3 Base Layout Structure
**Files to create/modify**:
- `components/layouts/AppStoreLayout.tsx` - New layout component
- `app/layout.tsx` - Update root layout

**Tasks**:
- [ ] Tạo container system
- [ ] Implement responsive grid
- [ ] Setup spacing utilities

**Estimated time**: 2-3 hours

---

## PHASE 2: CORE COMPONENTS (Ngày 3-5)

### 2.1 Card Components
**Files to create**:
- `components/cards/HeroCard.tsx` - Featured card lớn
- `components/cards/StandardCard.tsx` - Card tiêu chuẩn
- `components/cards/CompactCard.tsx` - Card nhỏ gọn
- `components/cards/CardSkeleton.tsx` - Loading state

**Tasks**:
- [ ] Implement HeroCard với image overlay
- [ ] Implement StandardCard với hover effects
- [ ] Implement CompactCard cho list view
- [ ] Add loading skeletons
- [ ] Test responsive behavior

**Estimated time**: 6-8 hours

---

### 2.2 Section Components
**Files to create**:
- `components/sections/SectionHeader.tsx` - Section header với title + link
- `components/sections/FeaturedSection.tsx` - Hero section
- `components/sections/GridSection.tsx` - Grid layout section
- `components/sections/ScrollSection.tsx` - Horizontal scroll section

**Tasks**:
- [ ] Implement SectionHeader component
- [ ] Create reusable section layouts
- [ ] Add scroll behavior cho horizontal sections
- [ ] Test với real data

**Estimated time**: 4-5 hours

---

### 2.3 Navigation Components
**Files to modify**:
- `components/Header.tsx` - Update header với blur effect
- `components/SidebarIOS.tsx` - Update sidebar styling

**Tasks**:
- [ ] Add backdrop-filter blur cho header
- [ ] Implement sticky header behavior
- [ ] Update sidebar với new design tokens
- [ ] Add smooth transitions

**Estimated time**: 3-4 hours

---

## PHASE 3: PAGE REDESIGN (Ngày 6-8)

### 3.1 Home Page (Today Tab Style)
**Files to modify**:
- `app/page.tsx` - Main home page
- `components/MainContent.tsx` - Update main content

**New Structure**:
```
1. Hero Section (Featured Project/Album)
2. Daily Picks (2-3 featured items)
3. Latest Fabrics (Grid)
4. Collections (Horizontal scroll)
5. Projects Gallery (Grid)
```

**Tasks**:
- [ ] Implement hero section với featured content
- [ ] Create daily picks section
- [ ] Update fabrics grid với new cards
- [ ] Add horizontal scroll cho collections
- [ ] Implement stagger animations

**Estimated time**: 6-8 hours

---

### 3.2 Fabrics Page
**Files to modify**:
- `app/fabrics/page.tsx` - Fabrics listing
- `app/fabrics/[id]/page.tsx` - Fabric detail

**Tasks**:
- [ ] Redesign fabrics grid với StandardCard
- [ ] Add filter/sort UI
- [ ] Update detail page với hero image
- [ ] Add related fabrics section

**Estimated time**: 4-5 hours

---

### 3.3 Projects Page
**Files to modify**:
- `app/projects/page.tsx` - Projects listing
- `app/projects/[id]/page.tsx` - Project detail

**Tasks**:
- [ ] Redesign projects grid
- [ ] Update detail page layout
- [ ] Add image gallery với lightbox
- [ ] Implement project info cards

**Estimated time**: 4-5 hours

---

### 3.4 Albums Page
**Files to modify**:
- `app/albums/page.tsx` - Albums listing
- `app/albums/[id]/page.tsx` - Album detail

**Tasks**:
- [ ] Redesign albums grid
- [ ] Update detail page với photo grid
- [ ] Add album cover hero section
- [ ] Implement photo viewer

**Estimated time**: 4-5 hours

---

## PHASE 4: ANIMATIONS & INTERACTIONS (Ngày 9-10)

### 4.1 Hover & Click Animations
**Files to create**:
- `styles/animations.css` - Animation keyframes
- `hooks/useHoverAnimation.ts` - Custom hook cho hover effects

**Tasks**:
- [ ] Implement card hover animations (scale + shadow)
- [ ] Add button press animations
- [ ] Create smooth page transitions
- [ ] Add loading animations

**Estimated time**: 4-5 hours

---

### 4.2 Scroll Animations
**Files to create**:
- `hooks/useScrollAnimation.ts` - Scroll-triggered animations
- `components/animations/FadeIn.tsx` - Fade in on scroll

**Tasks**:
- [ ] Implement fade-in on scroll
- [ ] Add parallax effect cho hero images
- [ ] Create stagger animations cho grids
- [ ] Test performance (60fps)

**Estimated time**: 4-5 hours

---

### 4.3 Page Transitions
**Files to modify**:
- `components/PageTransition.tsx` - Update transitions

**Tasks**:
- [ ] Implement smooth page transitions
- [ ] Add loading states
- [ ] Create skeleton screens
- [ ] Test navigation flow

**Estimated time**: 3-4 hours

---

## PHASE 5: RESPONSIVE & POLISH (Ngày 11-12)

### 5.1 Mobile Optimization
**Tasks**:
- [ ] Test tất cả pages trên mobile (< 768px)
- [ ] Adjust card sizes cho mobile
- [ ] Fix spacing issues
- [ ] Test touch interactions
- [ ] Optimize images cho mobile

**Estimated time**: 4-5 hours

---

### 5.2 Tablet Optimization
**Tasks**:
- [ ] Test trên tablet (768px - 1024px)
- [ ] Adjust grid layouts
- [ ] Test sidebar behavior
- [ ] Fix any layout issues

**Estimated time**: 2-3 hours

---

### 5.3 Performance Optimization
**Tasks**:
- [ ] Optimize images (WebP, lazy loading)
- [ ] Reduce bundle size
- [ ] Implement code splitting
- [ ] Test Core Web Vitals
- [ ] Fix any performance issues

**Estimated time**: 3-4 hours

---

### 5.4 Accessibility (a11y)
**Tasks**:
- [ ] Add proper ARIA labels
- [ ] Test keyboard navigation
- [ ] Check color contrast ratios
- [ ] Add focus states
- [ ] Test với screen readers

**Estimated time**: 3-4 hours

---

### 5.5 Final Polish
**Tasks**:
- [ ] Review tất cả animations (smooth 60fps)
- [ ] Fix any visual bugs
- [ ] Test cross-browser (Chrome, Safari, Firefox)
- [ ] Update documentation
- [ ] Create style guide

**Estimated time**: 4-5 hours

---

## PHASE 6: TESTING & DEPLOYMENT (Ngày 13-14)

### 6.1 Testing
**Tasks**:
- [ ] Manual testing tất cả pages
- [ ] Test responsive trên real devices
- [ ] Test performance
- [ ] Fix bugs
- [ ] User acceptance testing

**Estimated time**: 4-6 hours

---

### 6.2 Deployment
**Tasks**:
- [ ] Build production
- [ ] Test production build locally
- [ ] Deploy to staging
- [ ] Final testing trên staging
- [ ] Deploy to production
- [ ] Monitor for issues

**Estimated time**: 2-3 hours

---

## TIMELINE SUMMARY

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: Foundation | 2 days | Design tokens, Typography, Layout |
| Phase 2: Core Components | 3 days | Cards, Sections, Navigation |
| Phase 3: Page Redesign | 3 days | Home, Fabrics, Projects, Albums |
| Phase 4: Animations | 2 days | Hover, Scroll, Transitions |
| Phase 5: Polish | 2 days | Responsive, Performance, a11y |
| Phase 6: Testing & Deploy | 2 days | Testing, Deployment |
| **TOTAL** | **14 days** | **~80-100 hours** |

---

## PRIORITY LEVELS

### 🔴 Critical (Must Have)
- Design tokens setup
- Card components
- Home page redesign
- Responsive layout
- Basic animations

### 🟡 Important (Should Have)
- All page redesigns
- Scroll animations
- Performance optimization
- Accessibility

### 🟢 Nice to Have
- Advanced animations
- Parallax effects
- Dark mode
- Gesture support

---

## RISK MITIGATION

### Potential Risks:
1. **Performance issues** với nhiều animations
   - Solution: Use CSS transforms, will-change, requestAnimationFrame
   
2. **Browser compatibility** với backdrop-filter
   - Solution: Provide fallbacks cho older browsers
   
3. **Image loading** chậm
   - Solution: Implement lazy loading, blur-up technique
   
4. **Responsive issues** trên nhiều devices
   - Solution: Test sớm và thường xuyên

---

## SUCCESS METRICS

- [ ] Page load time < 2s
- [ ] Lighthouse score > 90
- [ ] Smooth 60fps animations
- [ ] Mobile-friendly (responsive)
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Cross-browser compatible

---

**Ngày tạo**: 2025-11-03  
**Phiên bản**: 1.0  
**Status**: Ready to Start

