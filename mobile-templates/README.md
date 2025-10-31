# 📱 Thư Viện Ảnh VẢI - React Native Mobile App

## 🎯 Templates cho React Native App

Thư mục này chứa các template code để bạn sử dụng khi tạo React Native app.

## 📋 Cách Sử Dụng

### Bước 1: Tạo React Native Project

```bash
# Chạy script tự động
chmod +x ../mobile-setup.sh
../mobile-setup.sh

# Hoặc tạo thủ công
npx react-native@latest init ThuVienAnhMobile --template react-native-template-typescript
```

### Bước 2: Copy Templates

Sau khi tạo project, copy các file từ thư mục này:

```bash
# Copy toàn bộ src folder
cp -r mobile-templates/src ThuVienAnhMobile/

# Copy App.tsx
cp mobile-templates/App.tsx ThuVienAnhMobile/

# Copy package.json dependencies (merge thủ công)
# Mở mobile-templates/package.json và thêm dependencies vào ThuVienAnhMobile/package.json
```

### Bước 3: Cài Đặt Dependencies

```bash
cd ThuVienAnhMobile

# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..
```

### Bước 4: Chạy App

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run iOS
npm run ios

# Hoặc run Android
npm run android
```

## 📁 Cấu Trúc Templates

```
mobile-templates/
├── src/
│   ├── constants/
│   │   └── config.ts          # App configuration
│   ├── services/
│   │   ├── api.ts             # Base API client
│   │   ├── fabricsApi.ts      # Fabrics API
│   │   └── albumsApi.ts       # Albums API
│   ├── types/
│   │   └── database.ts        # TypeScript types
│   └── screens/
│       ├── HomeScreen.tsx     # Home screen
│       └── FabricsScreen.tsx  # Fabrics listing
├── App.tsx                    # App entry point
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🔧 Cấu Hình

### API Base URL

Mở `src/constants/config.ts` và cấu hình:

```typescript
export const API_CONFIG = {
  DEV_URL: 'http://localhost:4000',        // Backend local
  PROD_URL: 'https://thuvienanh.ninh.app', // Backend production
}
```

### Kết Nối Backend

Đảm bảo backend Next.js đang chạy:

```bash
# Trong thư mục gốc dự án
npm run dev
```

Backend sẽ chạy tại `http://localhost:4000`

## 📱 Screens Đã Có

### ✅ HomeScreen
- Dashboard với menu chính
- Stats tổng quan
- Navigation đến các màn hình khác

### ✅ FabricsScreen
- Danh sách vải
- Search functionality
- Pull to refresh
- Loading states

### 🚧 Cần Tạo Thêm

- AlbumsScreen
- AlbumDetailScreen
- ProjectsScreen
- ProjectDetailScreen
- CollectionsScreen
- FabricDetailScreen
- UploadScreen

## 🎨 UI Components

Sử dụng React Native Paper cho UI components:

```typescript
import { Button, Card, TextInput } from 'react-native-paper'
```

## 📤 Upload Ảnh

Sử dụng `react-native-image-picker`:

```typescript
import { launchImageLibrary } from 'react-native-image-picker'

const pickImage = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
  })
  
  if (result.assets) {
    // Upload image
  }
}
```

## 🔄 State Management

Sử dụng Zustand cho global state:

```typescript
import { create } from 'zustand'

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

## 📊 Data Fetching

Sử dụng React Query:

```typescript
import { useQuery } from '@tanstack/react-query'
import { fabricsApi } from '../services/fabricsApi'

const { data, isLoading } = useQuery({
  queryKey: ['fabrics'],
  queryFn: () => fabricsApi.getAll(),
})
```

## 🐛 Debugging

### React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Run
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### Flipper

Flipper đã được tích hợp sẵn trong React Native.

## 📦 Build Production

### iOS

```bash
# Build trong Xcode
cd ios
open ThuVienAnhMobile.xcworkspace

# Trong Xcode:
# Product > Archive
```

### Android

```bash
cd android
./gradlew assembleRelease

# APK sẽ ở:
# android/app/build/outputs/apk/release/app-release.apk
```

## 🚀 Deploy lên App Store

1. Mở Xcode
2. Product > Archive
3. Distribute App
4. App Store Connect
5. Upload

## 📚 Tài Liệu

- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [React Query](https://tanstack.com/query)
- [React Native Paper](https://callstack.github.io/react-native-paper)

## 💡 Tips

1. **Hot Reload**: Nhấn `r` trong Metro bundler để reload
2. **Debug Menu**: Shake device hoặc Cmd+D (iOS) / Cmd+M (Android)
3. **Clear Cache**: `npm start -- --reset-cache`
4. **Rebuild iOS**: `cd ios && pod install && cd .. && npm run ios`

## 🆘 Troubleshooting

### Metro bundler không start
```bash
npm start -- --reset-cache
```

### Pod install failed
```bash
cd ios
pod deintegrate
pod install
```

### Build failed
```bash
# Clean build
cd ios
xcodebuild clean
cd ..
npm run ios
```

## 📞 Hỗ Trợ

Xem file `REACT_NATIVE_MIGRATION_GUIDE.md` trong thư mục gốc để biết thêm chi tiết.

