require('dotenv').config();

async function testDeleteFolder() {
  console.log('🧪 Testing Synology folder deletion\n');
  
  // Test authentication
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
    
    if (!authData.success) {
      console.log('❌ Authentication failed:', authData.error);
      return;
    }
    
    console.log('✅ Authenticated successfully');
    const sid = authData.data.sid;
    
    // List folders to see what exists
    console.log('\n📁 Listing folders in /Marketing/Ninh/thuvienanh/...\n');
    
    const listUrl = `${process.env.SYNOLOGY_BASE_URL}/webapi/entry.cgi`;
    const listParams = new URLSearchParams({
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'list',
      folder_path: '/Marketing/Ninh/thuvienanh',
      _sid: sid
    });
    
    const listResponse = await fetch(listUrl + '?' + listParams);
    const listData = await listResponse.json();
    
    if (listData.success) {
      console.log('Folders found:');
      listData.data.files.forEach(file => {
        if (file.isdir) {
          console.log(`  📁 ${file.path}`);
          
          // List subfolders
          const subListParams = new URLSearchParams({
            api: 'SYNO.FileStation.List',
            version: '2',
            method: 'list',
            folder_path: file.path,
            _sid: sid
          });
          
          fetch(listUrl + '?' + subListParams).then(r => r.json()).then(subData => {
            if (subData.success && subData.data.files.length > 0) {
              subData.data.files.forEach(subFile => {
                if (subFile.isdir) {
                  console.log(`     └─ ${subFile.name}`);
                }
              });
            }
          });
        }
      });
      
      // Wait for subfolder listing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ask which folder to delete
      console.log('\n⚠️ Test deletion (will delete /Marketing/Ninh/thuvienanh/fabric/Test Upload Album if exists)');
      
      const testPath = '/Marketing/Ninh/thuvienanh/fabric/Test Upload Album';
      console.log(`\n🗑️ Attempting to delete: ${testPath}`);
      
      const deleteParams = new URLSearchParams({
        api: 'SYNO.FileStation.Delete',
        version: '2',
        method: 'delete',
        path: testPath,
        recursive: 'true',
        _sid: sid
      });
      
      const deleteResponse = await fetch(listUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: deleteParams.toString()
      });
      
      const deleteData = await deleteResponse.json();
      
      if (deleteData.success) {
        console.log('✅ Folder deleted successfully!');
      } else {
        console.log('❌ Delete failed:', deleteData.error);
        if (deleteData.error && deleteData.error.code === 408) {
          console.log('   Error 408: File/folder not found');
        }
      }
    }
    
    // Logout
    await fetch(`${process.env.SYNOLOGY_BASE_URL}/webapi/auth.cgi?api=SYNO.API.Auth&version=1&method=logout&session=FileStation&_sid=${sid}`);
    console.log('\n🔒 Logged out');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDeleteFolder();
