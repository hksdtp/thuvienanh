// Test creating a fabric via API
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const fetch = require('node-fetch')

async function testCreateFabric() {
  console.log('🧪 Testing fabric creation...')

  // Create test image (1x1 pixel PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )

  const formData = new FormData()
  formData.append('name', 'Test Fabric ' + Date.now())
  formData.append('code', 'TEST' + Date.now().toString().slice(-6))
  formData.append('description', 'Test fabric created via API')
  formData.append('material', 'Cotton')
  formData.append('width', '150')
  formData.append('weight', '200')
  formData.append('color', 'Blue')
  formData.append('pattern', 'Solid')
  formData.append('finish', 'Matte')
  formData.append('origin', 'Vietnam')
  formData.append('price_per_meter', '100000')
  formData.append('stock_quantity', '100')
  formData.append('min_order_quantity', '1')
  formData.append('tags', JSON.stringify(['test', 'api']))
  formData.append('search_keywords', 'test fabric cotton blue')
  // Add 3 test images
  formData.append('images', testImageBuffer, {
    filename: 'test-image-1.png',
    contentType: 'image/png'
  })
  formData.append('images', testImageBuffer, {
    filename: 'test-image-2.png',
    contentType: 'image/png'
  })
  formData.append('images', testImageBuffer, {
    filename: 'test-image-3.png',
    contentType: 'image/png'
  })

  try {
    console.log('📤 Sending request to http://localhost:4000/api/fabrics...')
    
    const response = await fetch('http://localhost:4000/api/fabrics', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ Fabric created successfully!')
      console.log('   ID:', result.data.id)
      console.log('   Name:', result.data.name)
      console.log('   Code:', result.data.code)
      console.log('   Primary Image URL:', result.data.primary_image_url)
      console.log('\n🔗 View fabric at: http://localhost:4000/fabrics/' + result.data.id)
    } else {
      console.error('❌ Failed to create fabric:', result.error)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testCreateFabric()

