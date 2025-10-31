// Test Synology NAS Connection
// Tests both FileStation API (port 8888) and Photos API (port 6868)

const SYNOLOGY_CONFIG = {
  baseUrl: 'http://222.252.23.248:8888',
  alternativeUrl: 'http://222.252.23.248:6868',
  username: 'haininh',
  password: 'Villad24@',
  targetPath: '/Marketing/Ninh/thuvienanh'
};

async function testConnection() {
  console.log('🔍 Testing Synology NAS Connection...\n');
  
  console.log('📋 Configuration:');
  console.log(`   Primary URL:   ${SYNOLOGY_CONFIG.baseUrl}`);
  console.log(`   Alternative:   ${SYNOLOGY_CONFIG.alternativeUrl}`);
  console.log(`   Username:      ${SYNOLOGY_CONFIG.username}`);
  console.log(`   Target Path:   ${SYNOLOGY_CONFIG.targetPath}`);
  console.log('');

  // Test 1: Check if URLs are reachable
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test 1: URL Reachability');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const urls = [
    { name: 'FileStation (8888)', url: SYNOLOGY_CONFIG.baseUrl },
    { name: 'Photos API (6868)', url: SYNOLOGY_CONFIG.alternativeUrl }
  ];

  let workingUrl = null;

  for (const { name, url } of urls) {
    try {
      console.log(`\n🔗 Testing ${name}...`);
      const testUrl = `${url}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=SYNO.FileStation.Info`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${name} is reachable`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
        if (!workingUrl) workingUrl = url;
      } else {
        console.log(`   ⚠️  ${name} returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${name} is not reachable`);
      console.log(`   Error: ${error.message}`);
    }
  }

  if (!workingUrl) {
    console.log('\n❌ No working URL found. Cannot proceed with authentication test.');
    return;
  }

  console.log(`\n✅ Using working URL: ${workingUrl}`);

  // Test 2: FileStation Authentication
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test 2: FileStation Authentication');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const authUrl = `${workingUrl}/webapi/auth.cgi`;
    const authParams = new URLSearchParams({
      api: 'SYNO.API.Auth',
      version: '3',
      method: 'login',
      account: SYNOLOGY_CONFIG.username,
      passwd: SYNOLOGY_CONFIG.password,
      session: 'FileStation',
      format: 'sid'
    });

    console.log(`\n🔐 Authenticating with FileStation...`);
    console.log(`   URL: ${authUrl}`);
    console.log(`   User: ${SYNOLOGY_CONFIG.username}`);

    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: authParams
    });

    const authData = await authResponse.json();
    console.log(`\n📋 Authentication Response:`);
    console.log(JSON.stringify(authData, null, 2));

    if (authData.success && authData.data?.sid) {
      const sessionId = authData.data.sid;
      console.log(`\n✅ Authentication successful!`);
      console.log(`   Session ID: ${sessionId.substring(0, 20)}...`);

      // Test 3: List files in target directory
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Test 3: List Files in Target Directory');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      try {
        const listUrl = `${workingUrl}/webapi/entry.cgi`;
        const listParams = new URLSearchParams({
          api: 'SYNO.FileStation.List',
          version: '2',
          method: 'list',
          folder_path: SYNOLOGY_CONFIG.targetPath,
          additional: '["size","time","type"]'
        });

        console.log(`\n📁 Listing files in: ${SYNOLOGY_CONFIG.targetPath}`);

        const listResponse = await fetch(listUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': `id=${sessionId}`
          },
          body: listParams
        });

        const listData = await listResponse.json();
        console.log(`\n📋 List Response:`);
        console.log(JSON.stringify(listData, null, 2));

        if (listData.success && listData.data?.files) {
          console.log(`\n✅ Directory accessible!`);
          console.log(`   Found ${listData.data.files.length} items`);
          
          if (listData.data.files.length > 0) {
            console.log(`\n📄 Sample files (first 5):`);
            listData.data.files.slice(0, 5).forEach((file, index) => {
              console.log(`   ${index + 1}. ${file.name} (${file.isdir ? 'DIR' : 'FILE'})`);
            });
          }
        } else {
          console.log(`\n⚠️  Could not list directory`);
          console.log(`   Error: ${JSON.stringify(listData.error)}`);
        }
      } catch (error) {
        console.log(`\n❌ Error listing files: ${error.message}`);
      }

      // Test 4: Check write permissions
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Test 4: Check Write Permissions');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      try {
        const testFileName = `test_upload_${Date.now()}.txt`;
        const testContent = 'This is a test file created by test-synology-connection.js';
        
        console.log(`\n📤 Attempting to create test file: ${testFileName}`);

        // Create a simple text file
        const blob = new Blob([testContent], { type: 'text/plain' });
        const file = new File([blob], testFileName, { type: 'text/plain' });

        const uploadFormData = new FormData();
        uploadFormData.append('api', 'SYNO.FileStation.Upload');
        uploadFormData.append('version', '2');
        uploadFormData.append('method', 'upload');
        uploadFormData.append('path', SYNOLOGY_CONFIG.targetPath);
        uploadFormData.append('create_parents', 'true');
        uploadFormData.append('overwrite', 'true');
        uploadFormData.append('file', file, testFileName);

        const uploadResponse = await fetch(`${workingUrl}/webapi/entry.cgi`, {
          method: 'POST',
          headers: {
            'Cookie': `id=${sessionId}`
          },
          body: uploadFormData
        });

        const uploadData = await uploadResponse.json();
        console.log(`\n📋 Upload Response:`);
        console.log(JSON.stringify(uploadData, null, 2));

        if (uploadData.success) {
          console.log(`\n✅ Write permission confirmed!`);
          console.log(`   Test file uploaded successfully`);
          console.log(`   Path: ${SYNOLOGY_CONFIG.targetPath}/${testFileName}`);
        } else {
          console.log(`\n❌ Write permission denied or upload failed`);
          console.log(`   Error: ${JSON.stringify(uploadData.error)}`);
        }
      } catch (error) {
        console.log(`\n❌ Error testing write permission: ${error.message}`);
      }

      // Logout
      console.log('\n🔓 Logging out...');
      const logoutUrl = `${workingUrl}/webapi/auth.cgi`;
      const logoutParams = new URLSearchParams({
        api: 'SYNO.API.Auth',
        version: '3',
        method: 'logout',
        session: 'FileStation'
      });

      await fetch(logoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: logoutParams
      });

    } else {
      console.log(`\n❌ Authentication failed!`);
      console.log(`   Error: ${JSON.stringify(authData.error)}`);
    }

  } catch (error) {
    console.log(`\n❌ Authentication error: ${error.message}`);
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n✅ Tests completed!`);
  console.log(`\n📝 Next Steps:`);
  console.log(`   1. If all tests passed, upload feature is ready to use`);
  console.log(`   2. Update .env file with working configuration`);
  console.log(`   3. Restart Next.js server: npm run dev`);
  console.log(`   4. Test upload from web interface`);
  console.log('');
}

// Run tests
testConnection().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

