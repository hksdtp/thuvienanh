# 🚀 QUICK START - React Native cho iOS

## ⚡ Bắt Đầu Nhanh (5 Phút)

### Bước 1: Chạy Script Tự Động

```bash
# Cho phép execute script
chmod +x mobile-setup.sh

# Chạy script
./mobile-setup.sh
```

Script sẽ:
- ✅ Kiểm tra requirements (Node, Xcode, CocoaPods)
- ✅ Tạo React Native project
- ✅ Cài đặt tất cả dependencies
- ✅ Setup iOS pods

### Bước 2: Copy Template Code

```bash
# Copy toàn bộ source code
cp -r mobile-templates/src ThuVienAnhMobile/

# Copy App.tsx
cp mobile-templates/App.tsx ThuVienAnhMobile/

# Copy tsconfig.json
cp mobile-templates/tsconfig.json ThuVienAnhMobile/
```

### Bước 3: Chạy Backend API

```bash
# Terminal 1: Chạy Next.js backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:4000`

### Bước 4: Chạy React Native App

```bash
# Terminal 2: Di chuyển vào thư mục mobile
cd ThuVienAnhMobile

# Start Metro bundler
npm start

# Terminal 3: Chạy iOS
npm run ios
```

---

## 📱 Kết Quả

App sẽ mở trong iOS Simulator với:
- ✅ Home screen với dashboard
- ✅ Fabrics screen với danh sách vải
- ✅ Albums screen
- ✅ Projects screen
- ✅ Kết nối với backend API

---

## 🔧 Cấu Hình API

Mở `ThuVienAnhMobile/src/constants/config.ts`:

```typescript
export const API_CONFIG = {
  // Development
  DEV_URL: 'http://localhost:4000',
  
  // Production
  PROD_URL: 'https://thuvienanh.ninh.app',
}
```

---

## 📋 Checklist

- [ ] Node.js đã cài (check: `node --version`)
- [ ] Xcode đã cài (check: `xcodebuild -version`)
- [ ] CocoaPods đã cài (check: `pod --version`)
- [ ] Watchman đã cài (check: `watchman --version`)
- [ ] Backend đang chạy tại localhost:4000
- [ ] React Native app đã build thành công
- [ ] App hiển thị trong iOS Simulator

---

## 🎯 Các Màn Hình Đã Có

### ✅ HomeScreen
- Dashboard với menu
- Stats cards
- Navigation

### ✅ FabricsScreen
- Danh sách vải
- Search
- Pull to refresh
- Loading states

### ✅ AlbumsScreen
- Grid layout
- Cover images
- Image count

### ✅ ProjectsScreen
- Project cards
- Status badges
- Featured projects

---

## 🔄 Development Workflow

### 1. Chỉnh sửa code
```bash
# Mở VSCode
code ThuVienAnhMobile
```

### 2. Hot reload
- Nhấn `r` trong Metro bundler để reload
- Hoặc Cmd+R trong iOS Simulator

### 3. Debug
- Cmd+D trong iOS Simulator
- Chọn "Debug"

### 4. View logs
```bash
# Xem logs trong terminal
npx react-native log-ios
```

---

## 📦 Thêm Tính Năng Mới

### Tạo Screen Mới

```bash
# Tạo file screen
touch ThuVienAnhMobile/src/screens/NewScreen.tsx
```

```typescript
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function NewScreen() {
  return (
    <View style={styles.container}>
      <Text>New Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
```

### Thêm vào Navigation

Mở `App.tsx` và thêm:

```typescript
import NewScreen from './src/screens/NewScreen'

// Trong Stack.Navigator
<Stack.Screen
  name="NewScreen"
  component={NewScreen}
  options={{ title: 'New Screen' }}
/>
```

---

## 🎨 Tùy Chỉnh UI

### Colors

Mở `src/constants/config.ts`:

```typescript
export const COLORS = {
  primary: '#3B82F6',      // Đổi màu chính
  secondary: '#10B981',
  // ...
}
```

### Fonts

```typescript
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
}
```

---

## 🐛 Troubleshooting

### Metro bundler không start
```bash
npm start -- --reset-cache
```

### Build failed
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Simulator không mở
```bash
# Mở thủ công
open -a Simulator

# Chọn device
xcrun simctl list devices
```

### API không kết nối được
```bash
# Kiểm tra backend đang chạy
curl http://localhost:4000/api/fabrics

# Nếu không chạy
npm run dev
```

---

## 📤 Build cho App Store

### 1. Mở Xcode

```bash
cd ThuVienAnhMobile/ios
open ThuVienAnhMobile.xcworkspace
```

### 2. Cấu hình Signing

- Chọn project trong Xcode
- Signing & Capabilities
- Chọn Team (Apple Developer Account)
- Bundle Identifier: `com.thuvienanh.mobile`

### 3. Build Archive

- Product > Archive
- Chờ build xong
- Distribute App
- App Store Connect
- Upload

### 4. Submit lên App Store

- Vào [App Store Connect](https://appstoreconnect.apple.com)
- My Apps > + > New App
- Điền thông tin
- Submit for Review

---

## 📊 Performance Tips

### 1. Optimize Images
```typescript
import FastImage from 'react-native-fast-image'

<FastImage
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### 2. Memoize Components
```typescript
import React, { memo } from 'react'

const FabricCard = memo(({ fabric }) => {
  // ...
})
```

### 3. Use FlatList
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

---

## 🎓 Học Thêm

### React Native
- [Docs](https://reactnative.dev/docs/getting-started)
- [Tutorial](https://reactnative.dev/docs/tutorial)

### React Navigation
- [Docs](https://reactnavigation.org/docs/getting-started)
- [Examples](https://reactnavigation.org/docs/hello-react-navigation)

### React Query
- [Docs](https://tanstack.com/query/latest)
- [Examples](https://tanstack.com/query/latest/docs/react/examples/react/simple)

---

## 💡 Tips

1. **Sử dụng TypeScript** - Giúp catch lỗi sớm
2. **React Query** - Quản lý API calls dễ dàng
3. **FlatList** - Hiệu suất tốt cho danh sách dài
4. **FastImage** - Load ảnh nhanh hơn
5. **Memo** - Tránh re-render không cần thiết

---

## 🆘 Cần Giúp Đỡ?

1. Xem `REACT_NATIVE_MIGRATION_GUIDE.md` để biết chi tiết
2. Xem `mobile-templates/README.md` để biết về templates
3. Check React Native docs
4. Google error messages

---

## ✅ Next Steps

Sau khi app chạy thành công:

1. [ ] Thêm authentication
2. [ ] Implement upload ảnh
3. [ ] Thêm offline support
4. [ ] Optimize performance
5. [ ] Add analytics
6. [ ] Write tests
7. [ ] Submit lên App Store

---

**Chúc bạn thành công! 🎉**

