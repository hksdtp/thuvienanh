# 📱 Hướng Dẫn Chuyển Đổi Sang React Native

## 🎯 Tổng Quan

Dự án **Thư Viện Ảnh VẢI** sẽ được chuyển đổi thành:
- **Backend API**: Next.js (giữ nguyên, chạy trên server)
- **Mobile App**: React Native (iOS + Android)

---

## 📋 YÊU CẦU HỆ THỐNG

### Đã có sẵn:
- ✅ macOS
- ✅ Xcode (đã cài)
- ✅ Swift (đã cài)

### Cần cài thêm:
```bash
# 1. Homebrew (nếu chưa có)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js (đã có rồi)
# Kiểm tra: node --version

# 3. Watchman (cho React Native)
brew install watchman

# 4. CocoaPods (cho iOS dependencies)
sudo gem install cocoapods

# 5. React Native CLI
npm install -g react-native-cli
```

---

## 🚀 BƯỚC 1: TẠO DỰ ÁN REACT NATIVE

### Option A: React Native CLI (Native thuần - Khuyến nghị)

```bash
# Di chuyển vào thư mục dự án
cd /Users/nihdev/Web/thuvienanh

# Tạo thư mục mobile
npx react-native@latest init ThuVienAnhMobile --template react-native-template-typescript

# Di chuyển vào thư mục mobile
cd ThuVienAnhMobile

# Cài đặt iOS dependencies
cd ios && pod install && cd ..
```

### Option B: Expo (Dễ hơn, nhiều tính năng)

```bash
cd /Users/nihdev/Web/thuvienanh

# Tạo Expo app
npx create-expo-app@latest ThuVienAnhMobile --template blank-typescript

cd ThuVienAnhMobile
```

---

## 📦 BƯỚC 2: CÀI ĐẶT DEPENDENCIES

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI Components
npm install react-native-paper
npm install react-native-vector-icons

# Image handling
npm install react-native-fast-image
npm install react-native-image-picker

# API & State Management
npm install axios
npm install @tanstack/react-query
npm install zustand

# Forms & Validation
npm install react-hook-form
npm install zod

# Utilities
npm install date-fns
npm install react-native-uuid

# iOS specific (nếu dùng React Native CLI)
cd ios && pod install && cd ..
```

---

## 🏗️ BƯỚC 3: CẤU TRÚC DỰ ÁN

```
ThuVienAnhMobile/
├── src/
│   ├── screens/              # Màn hình chính
│   │   ├── HomeScreen.tsx
│   │   ├── FabricsScreen.tsx
│   │   ├── FabricDetailScreen.tsx
│   │   ├── AlbumsScreen.tsx
│   │   ├── AlbumDetailScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   ├── ProjectDetailScreen.tsx
│   │   ├── CollectionsScreen.tsx
│   │   └── UploadScreen.tsx
│   │
│   ├── components/           # Components tái sử dụng
│   │   ├── cards/
│   │   │   ├── FabricCard.tsx
│   │   │   ├── AlbumCard.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   └── CollectionCard.tsx
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterModal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── gallery/
│   │       ├── ImageGallery.tsx
│   │       └── ImageLightbox.tsx
│   │
│   ├── navigation/           # React Navigation
│   │   ├── AppNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/             # API Services
│   │   ├── api.ts           # Base API client
│   │   ├── fabricsApi.ts
│   │   ├── albumsApi.ts
│   │   ├── projectsApi.ts
│   │   ├── collectionsApi.ts
│   │   └── uploadApi.ts
│   │
│   ├── hooks/               # Custom Hooks
│   │   ├── useFabrics.ts
│   │   ├── useAlbums.ts
│   │   ├── useProjects.ts
│   │   └── useImagePicker.ts
│   │
│   ├── store/               # State Management (Zustand)
│   │   ├── useAuthStore.ts
│   │   └── useFilterStore.ts
│   │
│   ├── types/               # TypeScript Types
│   │   ├── database.ts      # Copy từ web app
│   │   └── navigation.ts
│   │
│   ├── utils/               # Utilities
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   └── constants/           # Constants
│       ├── colors.ts
│       └── config.ts
│
├── App.tsx                  # Entry point
├── app.json
└── package.json
```

---

## 🔌 BƯỚC 4: KẾT NỐI VỚI BACKEND API

### 4.1. Cấu hình API Base URL

Tạo file `src/constants/config.ts`:

```typescript
export const API_CONFIG = {
  // Development: Backend chạy local
  DEV_URL: 'http://localhost:4000',
  
  // Production: Backend trên server
  PROD_URL: 'https://thuvienanh.ninh.app',
  
  // Sử dụng URL nào?
  BASE_URL: __DEV__ 
    ? 'http://localhost:4000'  // Dev mode
    : 'https://thuvienanh.ninh.app',  // Production
}
```

### 4.2. Tạo API Client

Tạo file `src/services/api.ts`:

```typescript
import axios from 'axios'
import { API_CONFIG } from '../constants/config'

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Thêm auth token nếu có
    // const token = getAuthToken()
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
```

---

## 📱 BƯỚC 5: TẠO SCREENS & COMPONENTS

### 5.1. Home Screen

Tạo file `src/screens/HomeScreen.tsx`:

```typescript
import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useFabrics } from '../hooks/useFabrics'
import FabricCard from '../components/cards/FabricCard'

export default function HomeScreen() {
  const { data: fabrics, isLoading } = useFabrics()

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thư Viện Ảnh VẢI</Text>
      {fabrics?.map((fabric) => (
        <FabricCard key={fabric.id} fabric={fabric} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
})
```

---

## 🧪 BƯỚC 6: CHẠY THỬ ỨNG DỤNG

### Chạy Backend API (Terminal 1)
```bash
cd /Users/nihdev/Web/thuvienanh
npm run dev
# Backend chạy tại http://localhost:4000
```

### Chạy React Native App (Terminal 2)

#### Với React Native CLI:
```bash
cd /Users/nihdev/Web/thuvienanh/ThuVienAnhMobile

# Chạy Metro bundler
npm start

# Trong terminal khác, chạy iOS
npm run ios
# Hoặc
npx react-native run-ios
```

#### Với Expo:
```bash
cd /Users/nihdev/Web/thuvienanh/ThuVienAnhMobile

# Chạy Expo
npx expo start

# Nhấn 'i' để mở iOS simulator
```

---

## 📤 BƯỚC 7: BUILD VÀ DEPLOY LÊN APP STORE

### 7.1. Cấu hình App trong Xcode

```bash
# Mở project trong Xcode
cd ThuVienAnhMobile/ios
open ThuVienAnhMobile.xcworkspace
```

Trong Xcode:
1. Chọn project > Signing & Capabilities
2. Chọn Team (Apple Developer Account)
3. Đổi Bundle Identifier: `com.thuvienanh.mobile`
4. Cấu hình App Icons & Launch Screen

### 7.2. Build Archive

1. Trong Xcode: Product > Archive
2. Chọn Archive > Distribute App
3. Chọn App Store Connect
4. Upload lên App Store

### 7.3. Submit lên App Store

1. Vào [App Store Connect](https://appstoreconnect.apple.com)
2. Tạo App mới
3. Điền thông tin app
4. Submit for Review

---

## 🔄 MIGRATION CHECKLIST

### Phase 1: Setup (1-2 ngày)
- [ ] Tạo React Native project
- [ ] Cài đặt dependencies
- [ ] Setup navigation
- [ ] Kết nối API backend

### Phase 2: Core Features (3-5 ngày)
- [ ] Home screen với dashboard
- [ ] Fabrics listing & detail
- [ ] Albums listing & detail
- [ ] Projects listing & detail
- [ ] Collections listing & detail

### Phase 3: Advanced Features (2-3 ngày)
- [ ] Image upload
- [ ] Search & filters
- [ ] Image gallery & lightbox
- [ ] Offline support

### Phase 4: Polish (2-3 ngày)
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing

### Phase 5: Deployment (1-2 ngày)
- [ ] Build production app
- [ ] Test trên thiết bị thật
- [ ] Submit lên App Store
- [ ] App Store review

**Tổng thời gian ước tính: 2-3 tuần**

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Backend API phải accessible từ mobile**
   - Development: Dùng ngrok hoặc local network
   - Production: Deploy backend lên server public

2. **Image URLs**
   - Đảm bảo image URLs từ Synology accessible từ mobile
   - Có thể cần proxy qua backend API

3. **Authentication**
   - Thêm JWT authentication cho API
   - Lưu token trong AsyncStorage

4. **Offline Support**
   - Cache data với React Query
   - Lưu images locally

---

## 🆘 TROUBLESHOOTING

### Lỗi: "Unable to connect to development server"
```bash
# Reset Metro bundler
npm start -- --reset-cache
```

### Lỗi: "Pod install failed"
```bash
cd ios
pod deintegrate
pod install
```

### Lỗi: "Build failed in Xcode"
- Clean build folder: Cmd + Shift + K
- Rebuild: Cmd + B

---

## 📚 TÀI LIỆU THAM KHẢO

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)

