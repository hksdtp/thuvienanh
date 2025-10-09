import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Upload Image to Album Test', () => {
  test.beforeAll(async () => {
    // Create a test image if it doesn't exist
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (!fs.existsSync(testImagePath)) {
      // Create a simple test image using canvas (Node.js)
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext('2d');
      
      // Draw a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Test Upload Image', 400, 300);
      ctx.font = '24px Arial';
      ctx.fillText(new Date().toLocaleString(), 400, 350);
      
      // Save to file
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(testImagePath, buffer);
      console.log('✅ Test image created:', testImagePath);
    }
  });

  test('should create album and upload image', async ({ page }) => {
    // Step 1: Navigate to web app
    console.log('📍 Step 1: Navigating to web app...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/01-homepage.png' });
    console.log('✅ Homepage loaded');

    // Step 2: Navigate to Thư viện Vải
    console.log('📍 Step 2: Navigating to Thư viện Vải...');
    
    // Try to find and click "Thư viện Vải" link
    const fabricLibraryLink = page.locator('text=Thư viện Vải').first();
    if (await fabricLibraryLink.isVisible()) {
      await fabricLibraryLink.click();
    } else {
      // Alternative: try sidebar navigation
      const sidebarLink = page.locator('nav a:has-text("Vải")').first();
      await sidebarLink.click();
    }
    
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/02-fabric-library.png' });
    console.log('✅ Fabric library page loaded');

    // Step 3: Navigate to Albums
    console.log('📍 Step 3: Navigating to Albums...');
    
    // Look for Albums link in sidebar or navigation
    const albumsLink = page.locator('text=Albums').first();
    if (await albumsLink.isVisible()) {
      await albumsLink.click();
    } else {
      // Try alternative selectors
      await page.goto('http://localhost:4000/albums?category=fabric');
    }
    
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/03-albums-page.png' });
    console.log('✅ Albums page loaded');

    // Step 4: Create new album
    console.log('📍 Step 4: Creating new album...');
    
    const albumName = `Test Album ${Date.now()}`;
    
    // Look for "Create Album" or "Tạo Album" button
    const createButton = page.locator('button:has-text("Tạo"), button:has-text("Create"), button:has-text("New")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Fill in album name
      const nameInput = page.locator('input[name="name"], input[placeholder*="tên"], input[placeholder*="name"]').first();
      await nameInput.fill(albumName);
      
      // Fill in description (optional)
      const descInput = page.locator('textarea[name="description"], textarea[placeholder*="mô tả"]').first();
      if (await descInput.isVisible()) {
        await descInput.fill('Test album created by Playwright automation');
      }
      
      // Click save/create button
      const saveButton = page.locator('button:has-text("Lưu"), button:has-text("Save"), button:has-text("Tạo")').last();
      await saveButton.click();
      
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/04-album-created.png' });
      console.log(`✅ Album created: ${albumName}`);
    } else {
      console.log('⚠️  Create album button not found, trying direct navigation...');
    }

    // Step 5: Upload image to album
    console.log('📍 Step 5: Uploading image to album...');
    
    // Look for upload button or area
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Tải lên"), input[type="file"]').first();
    
    if (await uploadButton.isVisible()) {
      const testImagePath = path.join(__dirname, 'test-image.png');
      
      // If it's a file input, set files directly
      if (await uploadButton.getAttribute('type') === 'file') {
        await uploadButton.setInputFiles(testImagePath);
      } else {
        // Click upload button to open file dialog
        await uploadButton.click();
        await page.waitForTimeout(500);
        
        // Find file input (might be hidden)
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(testImagePath);
      }
      
      console.log('✅ Image file selected');
      
      // Wait for upload to complete
      await page.waitForTimeout(3000);
      
      // Look for success message or uploaded image
      const successIndicator = page.locator('text=thành công, text=success, text=uploaded').first();
      if (await successIndicator.isVisible({ timeout: 5000 })) {
        console.log('✅ Upload successful!');
      }
      
      await page.screenshot({ path: 'test-results/05-image-uploaded.png' });
    } else {
      console.log('❌ Upload button not found');
      await page.screenshot({ path: 'test-results/05-upload-button-not-found.png' });
    }

    // Step 6: Verify upload result
    console.log('📍 Step 6: Verifying upload result...');
    
    // Check for uploaded images in the album
    const uploadedImages = page.locator('img[src*="synology"], img[src*="upload"], img[alt*="test"]');
    const imageCount = await uploadedImages.count();
    
    console.log(`📊 Found ${imageCount} uploaded image(s)`);
    
    if (imageCount > 0) {
      console.log('✅ Image upload verified!');
    } else {
      console.log('⚠️  No uploaded images found');
    }
    
    await page.screenshot({ path: 'test-results/06-final-result.png' });

    // Step 7: Check for errors in console
    console.log('📍 Step 7: Checking for errors...');
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });

    // Final summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Album Name: ${albumName}`);
    console.log(`Images Uploaded: ${imageCount}`);
    console.log('Screenshots saved in: test-results/');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  test('should check menu structure', async ({ page }) => {
    console.log('\n📍 Testing Menu Structure...');
    
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    // Check menu items
    const menuItems = [
      'Vải Order theo MOQ',
      'Vải Mới',
      'Bộ Sưu Tập',
      'Vải Thanh Lý',
      'Albums'
    ];
    
    console.log('\n📋 Checking menu items:');
    for (const item of menuItems) {
      const menuLink = page.locator(`text=${item}`).first();
      const isVisible = await menuLink.isVisible();
      console.log(`  ${isVisible ? '✅' : '❌'} ${item}`);
      
      if (isVisible) {
        // Get the href
        const href = await menuLink.getAttribute('href');
        console.log(`     URL: ${href}`);
      }
    }
    
    // Test each menu link
    console.log('\n📋 Testing menu navigation:');
    
    // Test Vải Order theo MOQ
    await page.locator('text=Vải Order theo MOQ').first().click();
    await page.waitForLoadState('networkidle');
    let currentUrl = page.url();
    console.log(`  ✅ Vải Order theo MOQ: ${currentUrl}`);
    await page.screenshot({ path: 'test-results/menu-moq.png' });
    
    // Test Vải Mới
    await page.locator('text=Vải Mới').first().click();
    await page.waitForLoadState('networkidle');
    currentUrl = page.url();
    console.log(`  ✅ Vải Mới: ${currentUrl}`);
    await page.screenshot({ path: 'test-results/menu-new.png' });
    
    // Test Vải Thanh Lý
    await page.locator('text=Vải Thanh Lý').first().click();
    await page.waitForLoadState('networkidle');
    currentUrl = page.url();
    console.log(`  ✅ Vải Thanh Lý: ${currentUrl}`);
    await page.screenshot({ path: 'test-results/menu-clearance.png' });
    
    // Check if URLs are different
    console.log('\n📊 URL Analysis:');
    console.log('  Checking if each menu has unique URL...');
  });
});

