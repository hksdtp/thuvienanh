// Test Database Connection to Windows 10 PostgreSQL
const { Client } = require('pg');

async function testConnection() {
  console.log('🔍 Testing PostgreSQL Connection...\n');
  
  const config = {
    host: '100.101.50.87',
    port: 5432,
    user: 'postgres',
    password: 'haininh1',
    database: 'tva',
    connectionTimeoutMillis: 10000,
  };

  console.log('📋 Connection Config:');
  console.log(`   Host:     ${config.host}`);
  console.log(`   Port:     ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User:     ${config.user}`);
  console.log('');

  const client = new Client(config);

  try {
    console.log('🔗 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Test 1: Check PostgreSQL version
    console.log('📊 Test 1: PostgreSQL Version');
    const versionResult = await client.query('SELECT version()');
    console.log(`   ${versionResult.rows[0].version}\n`);

    // Test 2: List all tables
    console.log('📊 Test 2: List Tables');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`   Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    console.log('');

    // Test 3: Count records in each table
    console.log('📊 Test 3: Record Counts');
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        const count = countResult.rows[0].count;
        console.log(`   ${tableName.padEnd(30)} ${count} records`);
      } catch (err) {
        console.log(`   ${tableName.padEnd(30)} Error: ${err.message}`);
      }
    }
    console.log('');

    // Test 4: Check specific tables exist
    console.log('📊 Test 4: Check Required Tables');
    const requiredTables = ['fabrics', 'collections', 'albums', 'projects', 'events'];
    for (const tableName of requiredTables) {
      const exists = tablesResult.rows.some(row => row.table_name === tableName);
      console.log(`   ${tableName.padEnd(20)} ${exists ? '✅ Exists' : '❌ Missing'}`);
    }
    console.log('');

    // Test 5: Sample data from fabrics table (if exists)
    if (tablesResult.rows.some(row => row.table_name === 'fabrics')) {
      console.log('📊 Test 5: Sample Fabrics Data');
      const fabricsResult = await client.query('SELECT id, name, code FROM fabrics LIMIT 3');
      if (fabricsResult.rows.length > 0) {
        fabricsResult.rows.forEach((fabric, index) => {
          console.log(`   ${index + 1}. ${fabric.name} (${fabric.code})`);
        });
      } else {
        console.log('   No fabrics found');
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE CONNECTION TEST SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ DATABASE CONNECTION TEST FAILED!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('\n🔴 Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code:    ${error.code || 'N/A'}`);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check if PostgreSQL is running on Windows 10');
    console.error('   2. Verify database "tva" exists');
    console.error('   3. Check username and password are correct');
    console.error('   4. Ensure PostgreSQL is listening on localhost:5432');
    console.error('   5. Check pg_hba.conf allows local connections');
    console.error('');
  } finally {
    await client.end();
    console.log('🔌 Connection closed\n');
  }
}

testConnection();

