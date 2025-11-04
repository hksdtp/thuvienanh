# 🎨 DESIGN SYSTEM - THƯ VIỆN ANH

## Áp dụng Apple App Store Today Tab Design vào Web App

---

## 1. COLOR PALETTE

### 1.1 Base Colors
```css
:root {
  /* Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F7;
  --bg-tertiary: #FAFAFA;
  --bg-card: #FFFFFF;
  
  /* Text */
  --text-primary: #1D1D1F;
  --text-secondary: #6E6E73;
  --text-tertiary: #86868B;
  
  /* Borders */
  --border-light: #E5E5EA;
  --border-medium: #D2D2D7;
  
  /* Accent */
  --accent-primary: #007AFF;
  --accent-primary-hover: #0051D5;
  --accent-success: #34C759;
  --accent-warning: #FF9500;
  --accent-error: #FF3B30;
  
  /* Overlays */
  --overlay-light: rgba(0, 0, 0, 0.04);
  --overlay-medium: rgba(0, 0, 0, 0.08);
  --overlay-dark: rgba(0, 0, 0, 0.6);
}
```

---

## 2. TYPOGRAPHY SCALE

### 2.1 Font Stack
```css
:root {
  --font-primary: -apple-system, BlinkMacSystemFont, "SF Pro Display", 
                  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SF Mono", Monaco, "Cascadia Code", "Courier New", monospace;
}
```

### 2.2 Type Scale
```css
:root {
  /* Display */
  --text-display-size: 48px;
  --text-display-line: 52px;
  --text-display-weight: 700;
  --text-display-spacing: -0.5px;
  
  /* Title 1 */
  --text-title1-size: 34px;
  --text-title1-line: 41px;
  --text-title1-weight: 700;
  --text-title1-spacing: -0.4px;
  
  /* Title 2 */
  --text-title2-size: 28px;
  --text-title2-line: 34px;
  --text-title2-weight: 700;
  --text-title2-spacing: -0.3px;
  
  /* Title 3 */
  --text-title3-size: 22px;
  --text-title3-line: 28px;
  --text-title3-weight: 600;
  --text-title3-spacing: -0.2px;
  
  /* Headline */
  --text-headline-size: 17px;
  --text-headline-line: 22px;
  --text-headline-weight: 600;
  --text-headline-spacing: -0.4px;
  
  /* Body */
  --text-body-size: 17px;
  --text-body-line: 22px;
  --text-body-weight: 400;
  --text-body-spacing: -0.4px;
  
  /* Caption */
  --text-caption-size: 13px;
  --text-caption-line: 18px;
  --text-caption-weight: 400;
  --text-caption-spacing: -0.1px;
  
  /* Overline */
  --text-overline-size: 11px;
  --text-overline-line: 13px;
  --text-overline-weight: 600;
  --text-overline-spacing: 0.06px;
}
```

---

## 3. SPACING SYSTEM

```css
:root {
  --space-1: 4px;   /* Micro */
  --space-2: 8px;   /* Small */
  --space-3: 12px;  /* Medium */
  --space-4: 16px;  /* Default */
  --space-5: 20px;  /* Large */
  --space-6: 24px;  /* XL */
  --space-8: 32px;  /* 2XL */
  --space-12: 48px; /* 3XL */
  --space-16: 64px; /* 4XL */
}
```

---

## 4. BORDER RADIUS

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}
```

---

## 5. SHADOWS

```css
:root {
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15);
  
  --shadow-card: 
    0 0 0 0.5px rgba(0, 0, 0, 0.04),
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 8px 16px rgba(0, 0, 0, 0.08);
    
  --shadow-card-hover:
    0 0 0 0.5px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 20px 40px rgba(0, 0, 0, 0.15);
}
```

---

## 6. TRANSITIONS

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

## 7. COMPONENT LIBRARY

### 7.1 Card Component

#### Hero Card (Featured)
```tsx
<div className="card-hero">
  <div className="card-image">
    <img src="..." alt="..." />
    <div className="card-overlay" />
  </div>
  <div className="card-content">
    <span className="card-overline">CÔNG TRÌNH NỔI BẬT</span>
    <h2 className="card-title">Tên công trình</h2>
    <p className="card-subtitle">Mô tả ngắn gọn</p>
    <button className="card-cta">Xem chi tiết</button>
  </div>
</div>
```

**Styles**:
```css
.card-hero {
  position: relative;
  width: 100%;
  height: 650px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: transform var(--transition-normal),
              box-shadow var(--transition-normal);
}

.card-hero:hover {
  transform: scale(1.02) translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.card-image {
  position: absolute;
  inset: 0;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0) 50%
  );
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-6);
  color: white;
}

.card-overline {
  font-size: var(--text-overline-size);
  font-weight: var(--text-overline-weight);
  letter-spacing: var(--text-overline-spacing);
  text-transform: uppercase;
  opacity: 0.8;
}

.card-title {
  font-size: var(--text-title1-size);
  font-weight: var(--text-title1-weight);
  letter-spacing: var(--text-title1-spacing);
  line-height: var(--text-title1-line);
  margin-top: var(--space-2);
}

.card-subtitle {
  font-size: var(--text-body-size);
  line-height: var(--text-body-line);
  margin-top: var(--space-3);
  opacity: 0.9;
}
```

#### Standard Card
```tsx
<div className="card-standard">
  <div className="card-image">
    <img src="..." alt="..." />
  </div>
  <div className="card-content">
    <span className="card-category">Vải</span>
    <h3 className="card-title">Tên vải</h3>
    <p className="card-description">Mô tả</p>
  </div>
</div>
```

**Styles**:
```css
.card-standard {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-normal),
              box-shadow var(--transition-normal);
}

.card-standard:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-card-hover);
}

.card-image {
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--bg-secondary);
}

.card-content {
  padding: var(--space-4);
}

.card-category {
  font-size: var(--text-caption-size);
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.card-title {
  font-size: var(--text-headline-size);
  font-weight: var(--text-headline-weight);
  color: var(--text-primary);
  margin-top: var(--space-2);
}
```

### 7.2 Button Component

```css
/* Primary Button */
.btn-primary {
  background: var(--accent-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: var(--text-headline-size);
  font-weight: var(--text-headline-weight);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background: var(--accent-primary-hover);
  transform: scale(1.02);
}

.btn-primary:active {
  transform: scale(0.98);
}

/* Secondary Button */
.btn-secondary {
  background: rgba(0, 122, 255, 0.1);
  color: var(--accent-primary);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: var(--text-headline-size);
  font-weight: var(--text-headline-weight);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

/* Text Button */
.btn-text {
  background: transparent;
  color: var(--accent-primary);
  padding: 8px 0;
  font-size: var(--text-headline-size);
  font-weight: var(--text-headline-weight);
  border: none;
  cursor: pointer;
}
```

### 7.3 Section Header

```tsx
<div className="section-header">
  <div>
    <span className="section-overline">DANH MỤC</span>
    <h2 className="section-title">Tiêu đề section</h2>
  </div>
  <a href="#" className="section-link">Xem tất cả →</a>
</div>
```

```css
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-6);
}

.section-overline {
  font-size: var(--text-overline-size);
  font-weight: var(--text-overline-weight);
  letter-spacing: var(--text-overline-spacing);
  text-transform: uppercase;
  color: var(--text-secondary);
}

.section-title {
  font-size: var(--text-title2-size);
  font-weight: var(--text-title2-weight);
  letter-spacing: var(--text-title2-spacing);
  color: var(--text-primary);
  margin-top: var(--space-2);
}

.section-link {
  font-size: var(--text-headline-size);
  font-weight: var(--text-headline-weight);
  color: var(--accent-primary);
  text-decoration: none;
}
```

---

## 8. LAYOUT GRID

### 8.1 Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-5);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--space-4);
  }
}
```

### 8.2 Grid System
```css
.grid {
  display: grid;
  gap: var(--space-4);
}

/* 2 columns */
.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* 3 columns */
.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* 4 columns */
.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Responsive */
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

---

## 9. ANIMATIONS

### 9.1 Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 9.2 Stagger Animation
```css
.stagger-item {
  opacity: 0;
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 50ms; }
.stagger-item:nth-child(3) { animation-delay: 100ms; }
.stagger-item:nth-child(4) { animation-delay: 150ms; }
```

---

## 10. RESPONSIVE BREAKPOINTS

```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

---

**Ngày tạo**: 2025-11-03  
**Phiên bản**: 1.0  
**Status**: Ready for Implementation

