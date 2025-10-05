# 🔄 Hướng Dẫn Clear Browser Cache

## ⚠️ Vấn Đề

Bạn đã xóa dữ liệu trong database nhưng web vẫn hiển thị dữ liệu cũ.

**Nguyên nhân:** Browser đang cache dữ liệu cũ.

**Xác nhận:**
- ✅ Database đã trống (0 fabrics, 0 collections, 0 albums)
- ✅ API trả về 0 records
- ❌ Web vẫn hiển thị dữ liệu cũ

---

## ✅ Giải Pháp: Hard Refresh Browser

### **Cách 1: Hard Refresh (Khuyến nghị)**

#### **Trên macOS:**
```
⌘ Cmd + Shift + R
hoặc
⌘ Cmd + Option + R
```

#### **Trên Windows/Linux:**
```
Ctrl + Shift + R
hoặc
Ctrl + F5
```

#### **Các bước:**
1. Mở trang: http://localhost:4000
2. Nhấn tổ hợp phím trên
3. Đợi trang reload hoàn toàn
4. Kiểm tra lại

---

### **Cách 2: Clear Cache Trong DevTools**

#### **Chrome/Edge:**
1. Nhấn `F12` để mở DevTools
2. Click chuột phải vào nút Reload (⟳)
3. Chọn **"Empty Cache and Hard Reload"**
4. Đợi trang reload

#### **Firefox:**
1. Nhấn `F12` để mở DevTools
2. Click vào tab **Network**
3. Click chuột phải → **"Clear Browser Cache"**
4. Reload trang (`Cmd+R` hoặc `Ctrl+R`)

#### **Safari:**
1. Nhấn `Cmd + Option + E` để empty cache
2. Reload trang (`Cmd + R`)

---

### **Cách 3: Clear All Browser Data**

#### **Chrome:**
1. Nhấn `Cmd + Shift + Delete` (macOS) hoặc `Ctrl + Shift + Delete` (Windows)
2. Chọn **"Cached images and files"**
3. Time range: **"All time"**
4. Click **"Clear data"**
5. Reload trang

#### **Firefox:**
1. Nhấn `Cmd + Shift + Delete` (macOS) hoặc `Ctrl + Shift + Delete` (Windows)
2. Chọn **"Cache"**
3. Time range: **"Everything"**
4. Click **"Clear Now"**
5. Reload trang

#### **Safari:**
1. Menu **Safari** → **Preferences**
2. Tab **Advanced** → Check "Show Develop menu"
3. Menu **Develop** → **Empty Caches**
4. Reload trang

---

### **Cách 4: Incognito/Private Mode**

Mở trang trong chế độ ẩn danh để bypass cache:

#### **Chrome/Edge:**
```
Cmd + Shift + N (macOS)
Ctrl + Shift + N (Windows)
```

#### **Firefox:**
```
Cmd + Shift + P (macOS)
Ctrl + Shift + P (Windows)
```

#### **Safari:**
```
Cmd + Shift + N
```

Sau đó truy cập: http://localhost:4000

---

### **Cách 5: Disable Cache (Cho Development)**

#### **Chrome DevTools:**
1. Mở DevTools (`F12`)
2. Click vào **Settings** (⚙️)
3. Tab **Preferences**
4. Check ✅ **"Disable cache (while DevTools is open)"**
5. Giữ DevTools mở khi làm việc

#### **Firefox DevTools:**
1. Mở DevTools (`F12`)
2. Click vào **Settings** (⚙️)
3. Tab **Advanced settings**
4. Check ✅ **"Disable HTTP Cache (when toolbox is open)"**
5. Giữ DevTools mở khi làm việc

---

## 🔍 Verify Dữ Liệu Đã Xóa

### **Kiểm tra qua API:**

```bash
# Fabrics
curl http://localhost:4000/api/fabrics | jq '.fabrics | length'
# Kết quả: 0

# Collections
curl http://localhost:4000/api/collections | jq '.collections | length'
# Kết quả: 0

# Albums
curl http://localhost:4000/api/albums | jq '.albums | length'
# Kết quả: 0
```

### **Kiểm tra qua Database:**

```bash
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 -c "
SELECT 
  'fabrics' as table_name, COUNT(*) as count FROM fabrics
UNION ALL
SELECT 'collections', COUNT(*) FROM collections
UNION ALL
SELECT 'albums', COUNT(*) FROM albums;
"
```

**Kết quả mong đợi:**
```
  table_name  | count 
--------------+-------
 fabrics      |     0
 collections  |     0
 albums       |     0
```

---

## ✅ Sau Khi Clear Cache

Bạn sẽ thấy:

### **Trang Fabrics (http://localhost:4000/fabrics):**
```
"Chưa có vải nào"
hoặc
"No fabrics found"
```

### **Trang Collections (http://localhost:4000/collections):**
```
"Chưa có bộ sưu tập nào"
hoặc
"No collections found"
```

### **Trang Albums (http://localhost:4000/albums):**
```
"Chưa có album nào"
hoặc
"No albums found"
```

### **Trang Home (http://localhost:4000/):**
```
Dashboard với số liệu:
- Fabrics: 0
- Collections: 0
- Albums: 0
```

---

## 🚀 Bắt Đầu Tạo Dữ Liệu Thật

Sau khi clear cache và verify dữ liệu đã trống:

1. **Tạo bộ sưu tập đầu tiên:**
   ```
   http://localhost:4000/collections
   → Click "Thêm bộ sưu tập"
   ```

2. **Tạo vải đầu tiên với ảnh thật:**
   ```
   http://localhost:4000/fabrics
   → Click "Thêm vải mới"
   → Chọn "Photos API"
   → Upload ảnh thật
   ```

3. **Tạo album đầu tiên:**
   ```
   http://localhost:4000/albums
   → Click "Tạo album mới"
   ```

---

## 🐛 Nếu Vẫn Không Được

### **Bước 1: Restart Container**
```bash
cd /Users/ninh/Webapp/TVA
docker-compose restart fabric-library
```

### **Bước 2: Verify API**
```bash
curl http://localhost:4000/api/fabrics
```

### **Bước 3: Check Logs**
```bash
docker logs tva-fabric-library --tail 50
```

### **Bước 4: Full Rebuild**
```bash
docker-compose down
docker-compose up -d --build
```

### **Bước 5: Clear Browser Completely**
- Đóng tất cả tabs của localhost:4000
- Clear all browser data
- Restart browser
- Mở lại http://localhost:4000

---

## 📝 Checklist

- [ ] Hard refresh browser (`Cmd+Shift+R` hoặc `Ctrl+Shift+R`)
- [ ] Verify API trả về 0 records
- [ ] Verify database có 0 records
- [ ] Trang web hiển thị "Chưa có dữ liệu"
- [ ] Sẵn sàng tạo dữ liệu thật

---

**Nếu đã làm theo tất cả các bước trên mà vẫn thấy dữ liệu cũ, hãy:**
1. Chụp screenshot trang web
2. Check console logs (F12 → Console)
3. Check network requests (F12 → Network)
4. Gửi thông tin để debug

---

**Chúc bạn thành công! 🎉**

