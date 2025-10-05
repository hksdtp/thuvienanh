# 📋 Upload Feature Test Plan

**Date:** 2025-10-01  
**Feature:** Upload ảnh lên Synology Photos API  
**Scope:** Album creation, file upload, database persistence, error handling  

---

## 🎯 **TEST OBJECTIVES**

1. ✅ Verify album/collection creation works
2. ✅ Verify database persistence (PostgreSQL)
3. ✅ Test file upload to Synology Photos API
4. ✅ Debug console errors
5. ✅ Fix all issues found

---

## 📝 **TEST CASES**

### **TC-01: Album Creation**

**Priority:** Critical  
**Description:** Create new album with valid data  

**Steps:**
1. Navigate to http://localhost:4000/albums
2. Click "Tạo album mới" button
3. Fill in album details:
   - Name: "Test Album Upload"
   - Description: "Test album for upload feature"
   - Folder ID: (optional)
4. Click "Tạo album"

**Expected:**
- ✅ Album created successfully
- ✅ Success message displayed
- ✅ Album appears in list
- ✅ Database record created

**Checkpoints:**
- Form validation works
- API call succeeds
- Database insert succeeds
- UI updates correctly

---

### **TC-02: Database Verification**

**Priority:** Critical  
**Description:** Verify album data persisted in database  

**Steps:**
1. Connect to PostgreSQL (222.252.23.248:5499)
2. Query albums table:
   ```sql
   SELECT * FROM albums 
   WHERE name = 'Test Album Upload' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
3. Verify record exists
4. Check all fields populated correctly

**Expected:**
- ✅ Record exists in database
- ✅ All fields correct (name, description, created_at, etc.)
- ✅ ID generated correctly

---

### **TC-03: File Upload - Single Image**

**Priority:** Critical  
**Description:** Upload single image to album  

**Steps:**
1. Navigate to http://localhost:4000/fabrics
2. Click "Thêm vải mới"
3. Fill in fabric details
4. Select single image file (< 10MB, JPG/PNG)
5. Click "Upload"

**Expected:**
- ✅ File upload progress shown
- ✅ Upload to Synology Photos API succeeds
- ✅ Success message displayed
- ✅ Image appears in list
- ✅ Database record created

**Checkpoints:**
- File validation works
- Synology API authentication succeeds
- Upload progress tracked
- Error handling works
- Database insert succeeds

---

### **TC-04: File Upload - Multiple Images**

**Priority:** High  
**Description:** Upload multiple images at once  

**Steps:**
1. Navigate to http://localhost:4000/fabrics
2. Click "Thêm vải mới"
3. Select multiple image files (2-5 files)
4. Click "Upload"

**Expected:**
- ✅ All files uploaded
- ✅ Progress shown for each file
- ✅ Success/error status per file
- ✅ Database records created for all

---

### **TC-05: Error Handling - Invalid File Type**

**Priority:** Medium  
**Description:** Test validation for invalid file types  

**Steps:**
1. Try to upload .txt, .pdf, .doc file
2. Verify validation error

**Expected:**
- ✅ Validation error shown
- ✅ Upload blocked
- ✅ User-friendly error message

---

### **TC-06: Error Handling - File Size Limit**

**Priority:** Medium  
**Description:** Test file size validation  

**Steps:**
1. Try to upload file > 10MB
2. Verify validation error

**Expected:**
- ✅ Validation error shown
- ✅ Upload blocked
- ✅ Clear error message about size limit

---

### **TC-07: Console Error Check**

**Priority:** Critical  
**Description:** Check for JavaScript/console errors  

**Steps:**
1. Open DevTools Console
2. Perform all above test cases
3. Monitor console for errors

**Expected:**
- ✅ No CORS errors (fixed in previous step)
- ✅ No JavaScript errors
- ✅ No unhandled promise rejections
- ✅ API calls succeed

**Check for:**
- CORS errors
- 404 errors
- 500 errors
- Network errors
- JavaScript exceptions
- React warnings

---

### **TC-08: Network Request Verification**

**Priority:** High  
**Description:** Verify API requests/responses  

**Steps:**
1. Open DevTools Network tab
2. Perform upload
3. Check requests to:
   - `/api/synology/photos?action=test`
   - `/api/synology/photos` (POST)
   - `/api/albums` (POST)
   - `/api/fabrics` (POST)

**Expected:**
- ✅ All requests return 200 OK
- ✅ Response format correct
- ✅ No CORS errors
- ✅ Proper error responses for failures

---

### **TC-09: Synology API Integration**

**Priority:** Critical  
**Description:** Verify Synology Photos API integration  

**Steps:**
1. Test connection: `/api/synology/photos?action=test`
2. Verify authentication succeeds
3. Upload file via API
4. Check file appears in Synology Photos

**Expected:**
- ✅ Authentication succeeds
- ✅ Upload API call succeeds
- ✅ File stored in Synology NAS
- ✅ Metadata returned correctly

---

### **TC-10: Database Relationships**

**Priority:** High  
**Description:** Verify database foreign keys and relationships  

**Steps:**
1. Query related tables:
   ```sql
   -- Check collections
   SELECT * FROM collections ORDER BY created_at DESC LIMIT 5;
   
   -- Check fabrics
   SELECT * FROM fabrics ORDER BY created_at DESC LIMIT 5;
   
   -- Check albums
   SELECT * FROM albums ORDER BY created_at DESC LIMIT 5;
   
   -- Check album_images
   SELECT * FROM album_images ORDER BY created_at DESC LIMIT 5;
   
   -- Check relationships
   SELECT a.name, ai.image_url, ai.created_at
   FROM albums a
   JOIN album_images ai ON a.id = ai.album_id
   ORDER BY ai.created_at DESC
   LIMIT 10;
   ```

**Expected:**
- ✅ All tables have data
- ✅ Foreign keys valid
- ✅ Relationships correct
- ✅ No orphaned records

---

## 🔍 **CHECKPOINTS**

### **Pre-Test Checklist:**
- [ ] Dev server running (http://localhost:4000)
- [ ] Database accessible (222.252.23.248:5499)
- [ ] Synology NAS accessible (222.252.23.248:8888)
- [ ] Test images prepared (< 10MB, JPG/PNG)
- [ ] Browser DevTools ready
- [ ] Playwright installed

### **During Test:**
- [ ] Monitor console for errors
- [ ] Monitor network requests
- [ ] Take screenshots at each step
- [ ] Capture error messages
- [ ] Note any unexpected behavior

### **Post-Test:**
- [ ] Verify database records
- [ ] Check Synology Photos for uploaded files
- [ ] Review all console logs
- [ ] Document all issues found
- [ ] Prioritize fixes

---

## 🎯 **SUCCESS CRITERIA**

### **Must Have (Critical):**
- ✅ Album creation works
- ✅ Database persistence works
- ✅ File upload to Synology succeeds
- ✅ No CORS errors
- ✅ No critical JavaScript errors

### **Should Have (High):**
- ✅ Multiple file upload works
- ✅ Error handling works
- ✅ Progress indication works
- ✅ Success/error messages clear

### **Nice to Have (Medium):**
- ✅ File validation works
- ✅ Size limit validation works
- ✅ User-friendly error messages

---

## 📊 **TEST EXECUTION PLAN**

### **Phase 1: Automated Testing (Playwright)**
1. Setup Playwright
2. Write test scripts
3. Run automated tests
4. Capture screenshots and logs

### **Phase 2: Database Verification**
1. Connect to PostgreSQL
2. Run verification queries
3. Check data integrity
4. Verify relationships

### **Phase 3: Console Debug**
1. Open browser DevTools
2. Monitor console during tests
3. Capture all errors/warnings
4. Analyze error stack traces

### **Phase 4: Fix Issues**
1. Prioritize issues
2. Implement fixes
3. Re-test after each fix
4. Verify all issues resolved

### **Phase 5: Final Verification**
1. Run all tests again
2. Verify no regressions
3. Document results
4. Create test report

---

## 📝 **DELIVERABLES**

1. **Test Report** - `UPLOAD_TEST_REPORT.md`
2. **Database Queries** - SQL scripts and results
3. **Console Logs** - All errors and warnings
4. **Screenshots** - Visual evidence of tests
5. **Fix Documentation** - Code changes and explanations
6. **Verification Report** - Final confirmation all issues fixed

---

**Next Step:** Execute tests using Playwright

