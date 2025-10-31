// Test Synology upload connection
require('dotenv').config()

async function testSynologyConnection() {
  const baseUrl = process.env.SYNOLOGY_BASE_URL
  const username = process.env.SYNOLOGY_USERNAME
  const password = process.env.SYNOLOGY_PASSWORD

  console.log('🔍 Testing Synology connection...')
  console.log('Base URL:', baseUrl)
  console.log('Username:', username)
  console.log('Password:', password ? '***' : 'NOT SET')

  if (!baseUrl || !username || !password) {
    console.error('❌ Missing Synology credentials')
    return
  }

  try {
    // Test 1: API Info
    console.log('\n📡 Test 1: API Info')
    const infoUrl = `${baseUrl}/webapi/entry.cgi?api=SYNO.API.Info&version=1&method=query&query=SYNO.API.Auth`
    console.log('URL:', infoUrl)
    
    const infoResponse = await fetch(infoUrl)
    const infoResult = await infoResponse.json()
    console.log('Result:', JSON.stringify(infoResult, null, 2))

    // Test 2: Authentication
    console.log('\n🔐 Test 2: Authentication')
    const authUrl = `${baseUrl}/webapi/entry.cgi?api=SYNO.API.Auth&version=6&method=login&account=${encodeURIComponent(username)}&passwd=${encodeURIComponent(password)}&session=FileStation&format=sid`
    console.log('URL:', authUrl.replace(password, '***'))
    
    const authResponse = await fetch(authUrl)
    const authResult = await authResponse.json()
    
    if (authResult.success) {
      console.log('✅ Authentication successful!')
      console.log('Session ID:', authResult.data?.sid)
      
      // Test 3: List folders
      console.log('\n📁 Test 3: List folders')
      const listUrl = `${baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=/Marketing/Ninh/thuvienanh&_sid=${authResult.data.sid}`
      console.log('URL:', listUrl)
      
      const listResponse = await fetch(listUrl)
      const listResult = await listResponse.json()
      console.log('Result:', JSON.stringify(listResult, null, 2))
      
      if (listResult.success) {
        console.log('✅ Folder listing successful!')
        console.log('Files/Folders:', listResult.data?.files?.length || 0)
      } else {
        console.log('❌ Folder listing failed:', listResult.error)
      }
      
      // Logout
      console.log('\n🚪 Logging out...')
      const logoutUrl = `${baseUrl}/webapi/entry.cgi?api=SYNO.API.Auth&version=6&method=logout&session=FileStation&_sid=${authResult.data.sid}`
      await fetch(logoutUrl)
      console.log('✅ Logged out')
      
    } else {
      console.log('❌ Authentication failed:', authResult.error)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testSynologyConnection()

