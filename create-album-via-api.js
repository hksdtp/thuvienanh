// Create test album via API
async function createAlbum() {
  console.log('🎨 Creating test album via API...')

  try {
    const response = await fetch('http://localhost:4000/api/albums', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Upload Album',
        category: 'fabric',
        description: 'Album test để kiểm tra upload ảnh',
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ Album created successfully!')
      console.log('   ID:', result.data.id)
      console.log('   Name:', result.data.name)
      console.log('   Category:', result.data.category)
      console.log('')
      console.log('🔗 Access album at:')
      console.log(`   http://localhost:4000/albums/${result.data.id}`)
      console.log('')
      console.log('📝 Album ID for API testing:')
      console.log(`   ${result.data.id}`)
    } else {
      console.error('❌ Failed to create album:', result.error)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createAlbum()

