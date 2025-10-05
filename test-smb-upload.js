const SMB2 = require('@marsaud/smb2');
const fs = require('fs');

// SMB Configuration
const smb2Client = new SMB2({
  share: '\\\\222.252.23.248\\marketing',
  domain: 'WORKGROUP',
  username: 'haininh',
  password: 'Villad24@',
  port: 445,
  autoCloseTimeout: 10000
});

console.log('=== Testing SMB Upload ===\n');

// Test 1: List directory
console.log('1. Listing directory: Ninh/thuvienanh');
smb2Client.readdir('Ninh/thuvienanh', (err, files) => {
  if (err) {
    console.error('❌ List directory error:', err.message);
  } else {
    console.log('✅ Directory listing successful:');
    console.log('   Files:', files.length);
    files.slice(0, 5).forEach(file => {
      console.log('   -', file);
    });
  }
  console.log('');

  // Test 2: Upload file
  console.log('2. Uploading test file...');
  const testContent = `Test upload at ${new Date().toISOString()}`;
  const testFileName = `test-${Date.now()}.txt`;
  const testPath = `Ninh/thuvienanh/${testFileName}`;

  smb2Client.writeFile(testPath, Buffer.from(testContent), (err) => {
    if (err) {
      console.error('❌ Upload error:', err.message);
      console.error('   Error code:', err.code);
    } else {
      console.log('✅ Upload successful!');
      console.log('   File:', testPath);
      
      // Test 3: Read back the file
      console.log('\n3. Reading back the file...');
      smb2Client.readFile(testPath, (err, data) => {
        if (err) {
          console.error('❌ Read error:', err.message);
        } else {
          console.log('✅ Read successful!');
          console.log('   Content:', data.toString());
        }
        
        // Cleanup
        smb2Client.disconnect();
        console.log('\nDone!');
      });
    }
  });
});

