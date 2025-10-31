const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '100.101.50.87',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tva',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'haininh1',
});

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');
    
    // Check if album_images table exists
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    const hasAlbumImages = tablesResult.rows.some(r => r.table_name === 'album_images');
    console.log(`\n${hasAlbumImages ? '✅' : '❌'} album_images table ${hasAlbumImages ? 'exists' : 'MISSING'}`);
    
    if (!hasAlbumImages) {
      console.log('\n🔨 Creating album_images table...');
      
      // Create album_images table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS album_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          image_id VARCHAR(255),
          caption TEXT,
          display_order INTEGER DEFAULT 0,
          added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          added_by VARCHAR(255) DEFAULT 'system'
        );
      `);
      
      // Create indexes
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_album_images_album ON album_images(album_id);
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_album_images_order ON album_images(album_id, display_order);
      `);
      
      console.log('✅ album_images table created successfully!');
    }
    
    // Check table structure
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'album_images'
      ORDER BY ordinal_position;
    `);
    
    if (columnsResult.rows.length > 0) {
      console.log('\n📊 album_images table structure:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
    }
    
    // Check if there are any images in the table
    const countResult = await pool.query('SELECT COUNT(*) as count FROM album_images');
    console.log(`\n📷 Total images in album_images: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
