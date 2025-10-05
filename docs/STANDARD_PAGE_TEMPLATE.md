# 📐 STANDARD PAGE TEMPLATE - TVA FABRIC

## 🎯 MỤC ĐÍCH

Tài liệu này định nghĩa **template chuẩn** cho TẤT CẢ các pages trong TVA Fabric để đảm bảo **100% đồng nhất**.

---

## 📋 TEMPLATE STRUCTURE

```tsx
'use client'

import { useState, useEffect } from 'react'
import { IconName, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'

export default function PageName() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/endpoint')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      {/* Page Header - REQUIRED */}
      <PageHeader
        title="Page Title"
        subtitle={`${data.length} items`}
        icon={<IconName className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md">
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>Thêm mới</span>
          </button>
        }
      />

      {/* Content Container - REQUIRED */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Search Bar (Optional) */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-ios-gray-500" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            />
          </div>
        </div>

        {/* Content - REQUIRED */}
        {loading ? (
          // Loading State
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
            <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
          </div>
        ) : data.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
            <IconName className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
              Không có dữ liệu
            </h3>
            <p className="text-sm text-macos-text-secondary">
              Bắt đầu bằng cách thêm mới
            </p>
          </div>
        ) : (
          // Data Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card Component */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 🎨 DESIGN RULES

### **1. Layout Structure (REQUIRED)**

```tsx
<div className="min-h-screen bg-macos-bg-secondary">
  <PageHeader {...} />
  <div className="max-w-7xl mx-auto px-6 py-8">
    {/* Content */}
  </div>
</div>
```

**Rules:**
- ✅ MUST use `min-h-screen bg-macos-bg-secondary`
- ✅ MUST use `PageHeader` component
- ✅ MUST use `max-w-7xl mx-auto px-6 py-8` container
- ❌ NO custom layouts
- ❌ NO sidebars (except Fabrics with filters)
- ❌ NO hero sections
- ❌ NO gradients

---

### **2. PageHeader (REQUIRED)**

```tsx
<PageHeader
  title="Page Title"           // REQUIRED: 2-3 words
  subtitle="Description"        // REQUIRED: Short description or count
  icon={<Icon />}              // REQUIRED: 8x8 icon with ios-blue color
  actions={<Button />}         // OPTIONAL: Action buttons
/>
```

**Rules:**
- ✅ Title: `text-2xl font-semibold`
- ✅ Subtitle: `text-sm text-macos-text-secondary`
- ✅ Icon: `w-8 h-8 text-ios-blue strokeWidth={1.8}`
- ✅ Actions: Button with `bg-ios-blue`

---

### **3. Search Bar (OPTIONAL)**

```tsx
<div className="mb-6">
  <div className="relative max-w-xl">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <MagnifyingGlassIcon className="h-5 w-5 text-ios-gray-500" strokeWidth={2} />
    </div>
    <input
      type="text"
      placeholder="Tìm kiếm..."
      className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
    />
  </div>
</div>
```

**Rules:**
- ✅ MUST use `max-w-xl` (not full width)
- ✅ MUST use icon inside input
- ✅ MUST use standard focus styles

---

### **4. Loading State (REQUIRED)**

```tsx
{loading ? (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
    <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
  </div>
) : ...}
```

**Rules:**
- ✅ MUST use spinner + text
- ✅ MUST use `py-16` spacing
- ✅ MUST use `border-ios-blue`

---

### **5. Empty State (REQUIRED)**

```tsx
{data.length === 0 ? (
  <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
    <Icon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
    <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
      Không có dữ liệu
    </h3>
    <p className="text-sm text-macos-text-secondary">
      Mô tả ngắn gọn
    </p>
  </div>
) : ...}
```

**Rules:**
- ✅ MUST use white card with border
- ✅ MUST use icon 16x16
- ✅ MUST use heading + description

---

### **6. Data Grid (REQUIRED)**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
  {data.map((item, index) => (
    <div
      key={item.id}
      className="animate-slideUp"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Card {...item} />
    </div>
  ))}
</div>
```

**Rules:**
- ✅ MUST use responsive grid: 1-2-3-4 columns
- ✅ MUST use `gap-4`
- ✅ MUST use `animate-fadeIn` on container
- ✅ MUST use `animate-slideUp` on items with staggered delay

---

### **7. Action Button (OPTIONAL)**

```tsx
<button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md">
  <PlusIcon className="w-5 h-5" strokeWidth={2} />
  <span>Thêm mới</span>
</button>
```

**Rules:**
- ✅ MUST use `bg-ios-blue hover:bg-ios-blue-dark`
- ✅ MUST use icon + text
- ✅ MUST use `transition-all hover:shadow-md`

---

## 🚫 FORBIDDEN PATTERNS

### **❌ DO NOT USE:**

1. **Custom Layouts:**
   ```tsx
   ❌ <div className="flex h-screen">
   ❌ <div className="grid grid-cols-3">
   ❌ Sidebars (except Fabrics)
   ```

2. **Hero Sections:**
   ```tsx
   ❌ <div className="bg-gradient-to-br from-purple-600">
   ❌ <div className="py-16 text-center">
   ```

3. **Custom Headers:**
   ```tsx
   ❌ <h1 className="text-4xl">
   ❌ <div className="border-b">
   ```

4. **Fake macOS Windows:**
   ```tsx
   ❌ <div className="flex space-x-1">
   ❌   <div className="w-2 h-2 rounded-full bg-red-500">
   ```

5. **Inconsistent Colors:**
   ```tsx
   ❌ bg-blue-500 (use bg-ios-blue)
   ❌ text-gray-600 (use text-macos-text-secondary)
   ❌ border-gray-200 (use border-macos-border-light)
   ```

---

## ✅ CHECKLIST

Trước khi commit page mới, kiểm tra:

- [ ] Có sử dụng `PageHeader` component?
- [ ] Có sử dụng `max-w-7xl mx-auto px-6 py-8` container?
- [ ] Có loading state với spinner?
- [ ] Có empty state với icon?
- [ ] Có animations (fadeIn, slideUp)?
- [ ] Có sử dụng đúng colors (ios-blue, macos-text-*)?
- [ ] Grid responsive 1-2-3-4 columns?
- [ ] Không có custom layouts?
- [ ] Không có hero sections?
- [ ] Không có gradients?

---

**Template này PHẢI được áp dụng cho TẤT CẢ pages!**

