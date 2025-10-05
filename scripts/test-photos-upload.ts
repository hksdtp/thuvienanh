#!/usr/bin/env tsx
/**
 * Test script for Synology Photos Upload API
 * Usage: npx tsx scripts/test-photos-upload.ts
 */

import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import fetch from 'node-fetch'

const API_URL = 'http://localhost:3000/api/synology/photos-upload'
const FOLDER_ID = 49 // Folder "taothu" in /Web/taothu

async function testConnection() {
  console.log('🔍 Testing Synology Photos API connection...\n')
  
  try {
    const response = await fetch(`${API_URL}?folderId=${FOLDER_ID}`)
    const data = await response.json()
    
    console.log('📊 Connection test result:')
    console.log(JSON.stringify(data, null, 2))
    console.log()
    
    return data.success
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

async function uploadTestImage() {
  console.log('📤 Testing image upload...\n')
  
  try {
    // Create a test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    
    // Create form data
    const formData = new FormData()
    formData.append('files', testImageBuffer, {
      filename: `test-upload-${Date.now()}.png`,
      contentType: 'image/png'
    })
    formData.append('folderId', FOLDER_ID.toString())
    
    console.log(`📸 Uploading test image to folder ID: ${FOLDER_ID}`)
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders()
    })
    
    const data = await response.json()
    
    console.log('\n📊 Upload result:')
    console.log(JSON.stringify(data, null, 2))
    console.log()
    
    if (data.success) {
      console.log('✅ Upload test PASSED!')
      console.log('\n📋 Uploaded file details:')
      data.data?.forEach((file: any, index: number) => {
        console.log(`\n  File ${index + 1}:`)
        console.log(`    Name: ${file.filename}`)
        console.log(`    Success: ${file.success}`)
        if (file.success && file.data) {
          console.log(`    ID: ${file.data.id}`)
          console.log(`    Synology ID: ${file.data.synologyId}`)
          console.log(`    Folder ID: ${file.data.folderId}`)
          console.log(`    URL: ${file.data.url}`)
          console.log(`    Thumbnail: ${file.data.thumbnailUrl}`)
        } else if (file.error) {
          console.log(`    Error: ${file.error}`)
        }
      })
    } else {
      console.log('❌ Upload test FAILED!')
      console.log(`   Error: ${data.error || 'Unknown error'}`)
    }
    
    return data.success
  } catch (error) {
    console.error('❌ Upload test error:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Synology Photos Upload API Test\n')
  console.log('=' .repeat(50))
  console.log()
  
  // Test 1: Connection
  const connectionOk = await testConnection()
  if (!connectionOk) {
    console.log('❌ Connection test failed. Aborting.')
    process.exit(1)
  }
  
  console.log('✅ Connection test passed!\n')
  console.log('=' .repeat(50))
  console.log()
  
  // Test 2: Upload
  const uploadOk = await uploadTestImage()
  
  console.log()
  console.log('=' .repeat(50))
  console.log()
  
  if (uploadOk) {
    console.log('🎉 ALL TESTS PASSED!')
    console.log('\n✅ Synology Photos Upload API is working correctly!')
    console.log(`✅ Images are being uploaded to folder ID: ${FOLDER_ID} (/Web/taothu)`)
    process.exit(0)
  } else {
    console.log('❌ TESTS FAILED!')
    console.log('\n⚠️  Please check the error messages above.')
    process.exit(1)
  }
}

// Run tests
main().catch(error => {
  console.error('❌ Test script error:', error)
  process.exit(1)
})

