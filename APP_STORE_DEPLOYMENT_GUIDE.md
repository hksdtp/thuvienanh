# 📱 Hướng Dẫn Deploy Lên App Store

## 🎯 Tổng Quan

Hướng dẫn chi tiết từng bước để deploy React Native app lên Apple App Store.

---

## 📋 YÊU CẦU

### 1. Apple Developer Account
- ✅ Đăng ký tại: https://developer.apple.com
- 💰 Chi phí: $99/năm
- ⏱️ Thời gian duyệt: 1-2 ngày làm việc

### 2. Thiết Bị & Phần Mềm
- ✅ Mac với macOS mới nhất
- ✅ Xcode mới nhất (từ App Store)
- ✅ React Native app đã build thành công

### 3. Tài Liệu Cần Chuẩn Bị
- App Icon (1024x1024px)
- Screenshots (các kích thước iPhone)
- App Description (tiếng Việt & tiếng Anh)
- Privacy Policy URL
- Support URL

---

## 🚀 BƯỚC 1: CHUẨN BỊ APP

### 1.1. Cập Nhật App Info

Mở `ThuVienAnhMobile/ios/ThuVienAnhMobile/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>Thư Viện Ảnh VẢI</string>

<key>CFBundleShortVersionString</key>
<string>1.0.0</string>

<key>CFBundleVersion</key>
<string>1</string>
```

### 1.2. Tạo App Icon

**Kích thước cần thiết:**
- 1024x1024px (App Store)
- 180x180px (iPhone)
- 120x120px (iPhone)
- 87x87px (iPhone)
- 80x80px (iPad)
- 76x76px (iPad)
- 60x60px (iPhone)
- 58x58px (iPhone)
- 40x40px (iPhone/iPad)
- 29x29px (iPhone/iPad)
- 20x20px (iPhone/iPad)

**Tool tự động:**
```bash
# Sử dụng online tool
# https://appicon.co
# Upload ảnh 1024x1024, download tất cả sizes
```

Copy vào: `ThuVienAnhMobile/ios/ThuVienAnhMobile/Images.xcassets/AppIcon.appiconset/`

### 1.3. Tạo Launch Screen

Mở `ThuVienAnhMobile/ios/ThuVienAnhMobile/LaunchScreen.storyboard` trong Xcode và customize.

---

## 🔐 BƯỚC 2: SETUP SIGNING & CAPABILITIES

### 2.1. Mở Xcode

```bash
cd ThuVienAnhMobile/ios
open ThuVienAnhMobile.xcworkspace
```

### 2.2. Cấu Hình Signing

1. Chọn project `ThuVienAnhMobile` trong sidebar
2. Chọn target `ThuVienAnhMobile`
3. Tab "Signing & Capabilities"
4. **Automatically manage signing**: ✅ Check
5. **Team**: Chọn Apple Developer Team của bạn
6. **Bundle Identifier**: `com.thuvienanh.mobile` (hoặc domain của bạn)

### 2.3. Thêm Capabilities (Nếu Cần)

- Push Notifications
- Background Modes
- Camera
- Photo Library

---

## 📦 BƯỚC 3: BUILD ARCHIVE

### 3.1. Chọn Device

Trong Xcode toolbar:
- Chọn: **Any iOS Device (arm64)**

### 3.2. Build Archive

1. Menu: **Product > Archive**
2. Chờ build (5-10 phút)
3. Nếu thành công, Organizer window sẽ mở

### 3.3. Validate Archive

1. Trong Organizer, chọn archive vừa build
2. Click **Validate App**
3. Chọn distribution method: **App Store Connect**
4. Chọn signing: **Automatically manage signing**
5. Click **Validate**
6. Chờ validation (2-5 phút)

---

## 🌐 BƯỚC 4: TẠO APP TRÊN APP STORE CONNECT

### 4.1. Đăng Nhập App Store Connect

Truy cập: https://appstoreconnect.apple.com

### 4.2. Tạo App Mới

1. Click **My Apps**
2. Click **+** > **New App**
3. Điền thông tin:
   - **Platform**: iOS
   - **Name**: Thư Viện Ảnh VẢI
   - **Primary Language**: Vietnamese
   - **Bundle ID**: com.thuvienanh.mobile
   - **SKU**: thuvienanh-mobile-001
   - **User Access**: Full Access

### 4.3. Điền Thông Tin App

#### App Information
- **Name**: Thư Viện Ảnh VẢI
- **Subtitle**: Quản lý thư viện ảnh vải
- **Category**: 
  - Primary: Business
  - Secondary: Productivity

#### Pricing and Availability
- **Price**: Free
- **Availability**: All countries

#### Privacy Policy
Tạo file `privacy-policy.html` và host trên:
- GitHub Pages
- Vercel
- Hoặc website của bạn

URL: `https://thuvienanh.ninh.app/privacy-policy`

#### App Privacy
Khai báo data collection:
- ✅ Contact Info (nếu có)
- ✅ Photos (nếu upload ảnh)
- ✅ User Content

---

## 📸 BƯỚC 5: CHUẨN BỊ SCREENSHOTS

### 5.1. Kích Thước Cần Thiết

**iPhone 6.7" (iPhone 14 Pro Max)**
- 1290 x 2796 pixels
- Cần: 3-10 screenshots

**iPhone 6.5" (iPhone 11 Pro Max)**
- 1242 x 2688 pixels
- Cần: 3-10 screenshots

**iPhone 5.5" (iPhone 8 Plus)**
- 1242 x 2208 pixels
- Optional

### 5.2. Chụp Screenshots

```bash
# Chạy app trong simulator
npm run ios

# Chọn device: iPhone 14 Pro Max
# Chụp màn hình: Cmd + S

# Screenshots sẽ lưu tại Desktop
```

### 5.3. Edit Screenshots (Optional)

Sử dụng tools:
- Figma
- Sketch
- Canva
- Screenshot.rocks

---

## 📤 BƯỚC 6: UPLOAD BUILD

### 6.1. Distribute App

1. Trong Xcode Organizer
2. Chọn archive
3. Click **Distribute App**
4. Chọn: **App Store Connect**
5. Chọn: **Upload**
6. Signing: **Automatically manage signing**
7. Click **Upload**
8. Chờ upload (5-15 phút)

### 6.2. Kiểm Tra Upload

1. Vào App Store Connect
2. My Apps > Thư Viện Ảnh VẢI
3. Tab **TestFlight**
4. Sau 5-10 phút, build sẽ xuất hiện
5. Chờ "Processing" hoàn tất (10-30 phút)

---

## 🧪 BƯỚC 7: TESTFLIGHT (OPTIONAL)

### 7.1. Internal Testing

1. Tab **TestFlight**
2. **Internal Testing** > **+**
3. Thêm testers (email)
4. Testers sẽ nhận email invite
5. Download TestFlight app
6. Test app

### 7.2. External Testing (Optional)

1. **External Testing** > **+**
2. Tạo group
3. Thêm testers
4. Submit for review (1-2 ngày)

---

## 🚀 BƯỚC 8: SUBMIT FOR REVIEW

### 8.1. Chọn Build

1. Tab **App Store**
2. Version: **1.0.0**
3. **Build**: Chọn build vừa upload
4. Click **Save**

### 8.2. Điền Thông Tin Version

#### What's New in This Version
```
Phiên bản đầu tiên của Thư Viện Ảnh VẢI:
- Quản lý thư viện vải
- Tìm kiếm và lọc vải
- Quản lý albums và dự án
- Upload và quản lý ảnh
```

#### Promotional Text (Optional)
```
Ứng dụng quản lý thư viện ảnh vải chuyên nghiệp cho Marketing và Sales team.
```

#### Description
```
Thư Viện Ảnh VẢI là ứng dụng quản lý thư viện ảnh vải chuyên nghiệp, giúp Marketing và Sales team:

✨ TÍNH NĂNG CHÍNH:
• Quản lý thư viện vải với thông tin chi tiết
• Tìm kiếm và lọc vải theo nhiều tiêu chí
• Quản lý albums và bộ sưu tập ảnh
• Quản lý dự án và ứng dụng vải
• Upload và tổ chức ảnh dễ dàng
• Giao diện đẹp, dễ sử dụng

🎯 DÀNH CHO:
• Marketing team
• Sales team
• Nhà thiết kế nội thất
• Kiến trúc sư

📱 YÊU CẦU:
• iOS 13.0 trở lên
• Kết nối internet

🔒 BẢO MẬT:
• Dữ liệu được mã hóa
• Tuân thủ chính sách bảo mật

💡 HỖ TRỢ:
Email: support@thuvienanh.com
Website: https://thuvienanh.ninh.app
```

#### Keywords
```
vải, fabric, thư viện, library, ảnh, photo, quản lý, management, nội thất, interior
```

#### Support URL
```
https://thuvienanh.ninh.app/support
```

#### Marketing URL (Optional)
```
https://thuvienanh.ninh.app
```

### 8.3. Upload Screenshots

1. Drag & drop screenshots vào từng device size
2. Sắp xếp thứ tự
3. Click **Save**

### 8.4. App Review Information

#### Contact Information
- First Name: [Tên của bạn]
- Last Name: [Họ của bạn]
- Phone: [Số điện thoại]
- Email: [Email]

#### Demo Account (Nếu cần login)
- Username: demo@thuvienanh.com
- Password: Demo123456
- Notes: Account for review purposes

#### Notes
```
Ứng dụng kết nối với backend API tại https://thuvienanh.ninh.app

Tính năng chính:
- Xem danh sách vải
- Tìm kiếm vải
- Xem albums
- Xem dự án

Không cần đăng nhập để sử dụng các tính năng cơ bản.
```

### 8.5. Submit

1. Kiểm tra lại tất cả thông tin
2. Click **Add for Review**
3. Click **Submit to App Review**
4. Confirm

---

## ⏱️ BƯỚC 9: CHỜ REVIEW

### Timeline
- **In Review**: 1-3 ngày
- **Pending Developer Release**: App đã được duyệt
- **Ready for Sale**: App đã lên store

### Status Tracking
1. Vào App Store Connect
2. My Apps > Thư Viện Ảnh VẢI
3. Xem status

### Email Notifications
Apple sẽ gửi email khi:
- App vào review
- App được approve
- App bị reject (nếu có)

---

## ✅ BƯỚC 10: APP APPROVED

### 10.1. Release App

Khi status = "Pending Developer Release":
1. Click **Release This Version**
2. App sẽ lên store trong vài giờ

### 10.2. Kiểm Tra Trên App Store

1. Mở App Store trên iPhone
2. Search "Thư Viện Ảnh VẢI"
3. Download và test

---

## 🔄 UPDATE APP (VERSION MỚI)

### 1. Tăng Version Number

`Info.plist`:
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.1</string>

<key>CFBundleVersion</key>
<string>2</string>
```

### 2. Build Archive Mới

Lặp lại Bước 3

### 3. Upload Build Mới

Lặp lại Bước 6

### 4. Tạo Version Mới

1. App Store Connect
2. My Apps > Thư Viện Ảnh VẢI
3. **+** > **iOS**
4. Version: 1.0.1
5. Chọn build mới
6. Điền "What's New"
7. Submit for Review

---

## 🐛 TROUBLESHOOTING

### Build Failed
```bash
# Clean build
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod deintegrate
pod install
cd ..
npm run ios
```

### Archive Failed
- Check signing certificates
- Check provisioning profiles
- Update Xcode
- Restart Xcode

### Upload Failed
- Check internet connection
- Check Apple Developer account status
- Try again later

### App Rejected
- Đọc rejection reason
- Fix issues
- Submit lại

---

## 📊 METRICS & ANALYTICS

### App Store Connect Analytics
- Downloads
- Sessions
- Active devices
- Crashes
- Ratings & Reviews

### Add Analytics SDK
```bash
npm install @react-native-firebase/analytics
```

---

## 💰 MONETIZATION (OPTIONAL)

### In-App Purchases
1. App Store Connect > Features > In-App Purchases
2. Create products
3. Implement in app

### Subscriptions
1. Create subscription groups
2. Add subscription products
3. Implement in app

---

## 📚 TÀI LIỆU THAM KHẢO

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [TestFlight Guide](https://developer.apple.com/testflight/)

---

## ✅ CHECKLIST HOÀN CHỈNH

- [ ] Apple Developer Account đã đăng ký
- [ ] App icon đã tạo (1024x1024)
- [ ] Screenshots đã chụp (tất cả sizes)
- [ ] Privacy Policy đã tạo
- [ ] App description đã viết
- [ ] Signing & Capabilities đã setup
- [ ] Archive build thành công
- [ ] Validate thành công
- [ ] Upload lên App Store Connect
- [ ] App info đã điền đầy đủ
- [ ] Screenshots đã upload
- [ ] Submit for review
- [ ] App được approve
- [ ] App đã lên store

---

**Chúc bạn thành công! 🎉**

