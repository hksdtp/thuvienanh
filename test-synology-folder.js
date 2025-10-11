require('dotenv').config();

async function testSynologyConnection() {
  console.log('🔍 Testing Synology Connection and Folder Creation\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('- SYNOLOGY_BASE_URL:', process.env.SYNOLOGY_BASE_URL);
  console.log('- SYNOLOGY_USERNAME:', process.env.SYNOLOGY_USERNAME);
  console.log('- ENABLE_SYNOLOGY_FOLDER_CREATION:', process.env.ENABLE_SYNOLOGY_FOLDER_CREATION);
  console.log('\n');

  // Test basic connection
  console.log('🌐 Testing connection to Synology NAS...');
  try {
    const response = await fetch(process.env.SYNOLOGY_BASE_URL + '/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=SYNO.FileStation.Info');
    if (response.ok) {
      console.log('✅ Connection successful!');
      const data = await response.json();
      console.log('📦 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Connection failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }

  console.log('\n🔐 Testing authentication...');
  
  // Try to authenticate
  const authUrl = `${process.env.SYNOLOGY_BASE_URL}/webapi/auth.cgi`;
  const authParams = new URLSearchParams({
    api: 'SYNO.API.Auth',
    version: '3',
    method: 'login',
    account: process.env.SYNOLOGY_USERNAME,
    passwd: process.env.SYNOLOGY_PASSWORD,
    session: 'FileStation',
    format: 'sid'
  });

  try {
    const authResponse = await fetch(authUrl + '?' + authParams);
    const authData = await authResponse.json();
    
    if (authData.success) {
      console.log('✅ Authentication successful!');
      console.log('📋 Session ID:', authData.data.sid);
      
      // Test folder creation
      console.log('\n📁 Testing folder creation...');
      
      const createFolderUrl = `${process.env.SYNOLOGY_BASE_URL}/webapi/entry.cgi`;
      const testFolderPath = '/Marketing/Ninh/thuvienanh/test-folder-' + Date.now();
      
      // Split path
      const lastSlashIndex = testFolderPath.lastIndexOf('/');
      const parentPath = testFolderPath.substring(0, lastSlashIndex) || '/';
      const folderName = testFolderPath.substring(lastSlashIndex + 1);
      
      console.log('📂 Creating folder:', folderName);
      console.log('📍 In parent path:', parentPath);
      
      const createParams = new URLSearchParams({
        api: 'SYNO.FileStation.CreateFolder',
        version: '2',
        method: 'create',
        folder_path: JSON.stringify([parentPath]),
        name: JSON.stringify([folderName]),
        _sid: authData.data.sid
      });

      const createResponse = await fetch(createFolderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: createParams.toString()
      });
      
      const createData = await createResponse.json();
      console.log('📦 Create folder response:', JSON.stringify(createData, null, 2));
      
      if (createData.success) {
        console.log('✅ Folder created successfully!');
      } else {
        console.log('❌ Folder creation failed:', createData.error);
        
        // Check error codes
        if (createData.error && createData.error.code === 119) {
          console.log('⚠️ Error 119: Duplicate folder name - folder might already exist');
        } else if (createData.error && createData.error.code === 101) {
          console.log('⚠️ Error 101: No permission to create folder in this location');
        }
      }
      
      // Logout
      const logoutUrl = `${process.env.SYNOLOGY_BASE_URL}/webapi/auth.cgi?api=SYNO.API.Auth&version=1&method=logout&session=FileStation&_sid=${authData.data.sid}`;
      await fetch(logoutUrl);
      console.log('\n🔒 Logged out from Synology');
      
    } else {
      console.log('❌ Authentication failed:', authData.error);
      if (authData.error && authData.error.code === 400) {
        console.log('⚠️ Error 400: Invalid username or password');
      } else if (authData.error && authData.error.code === 401) {
        console.log('⚠️ Error 401: Account disabled');
      } else if (authData.error && authData.error.code === 402) {
        console.log('⚠️ Error 402: Permission denied');
      }
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
  }
}

testSynologyConnection();
