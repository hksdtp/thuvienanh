// Test backend connection to PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');

console.log('=== Test Backend Database Connection ===\n');

// Database configuration from .env
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tva',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'haininh1',
};

console.log('Database Configuration:');
console.log('  Host:', dbConfig.host);
console.log('  Port:', dbConfig.port);
console.log('  Database:', dbConfig.database);
console.log('  User:', dbConfig.user);
console.log('  Password:', '***' + dbConfig.password.slice(-4));
console.log('');

// Create connection pool
const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    console.log('1. Testing connection...');
    const client = await pool.connect();
    console.log('   ✓ Connected successfully!\n');

    // Test query
    console.log('2. Testing query...');
    const result = await client.query('SELECT version(), current_database(), current_user;');
    console.log('   ✓ Query successful!\n');
    console.log('   PostgreSQL Version:', result.rows[0].version);
    console.log('   Current Database:', result.rows[0].current_database);
    console.log('   Current User:', result.rows[0].current_user);
    console.log('');

    // List tables
    console.log('3. Listing tables...');
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    if (tables.rows.length > 0) {
      console.log('   ✓ Found', tables.rows.length, 'tables:');
      tables.rows.forEach(row => {
        console.log('     -', row.tablename);
      });
    } else {
      console.log('   ⚠ No tables found (database is empty)');
    }
    console.log('');

    // Check tablespace
    console.log('4. Checking tablespace...');
    const tsInfo = await client.query(`
      SELECT spcname, pg_tablespace_location(oid) as location 
      FROM pg_tablespace 
      WHERE spcname = 'tva_tablespace';
    `);
    
    if (tsInfo.rows.length > 0) {
      console.log('   ✓ Tablespace:', tsInfo.rows[0].spcname);
      console.log('   ✓ Location:', tsInfo.rows[0].location);
    } else {
      console.log('   ⚠ Tablespace not found');
    }
    console.log('');

    client.release();
    
    console.log('=== CONNECTION TEST SUCCESSFUL ===');
    console.log('Backend can connect to database!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('');
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();

