// Script to delete all fabric images data
// User will re-upload manually

const { Pool } = require('pg')

const pool = new Pool({
  host: '100.115.191.19',
  port: 5432,
  database: 'thuvienanh_db',
  user: 'nihdev',
  password: 'haininh1',
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

async function deleteAllFabricImages() {
  try {
    console.log('🗑️  Starting to delete all fabric images...\n')

    // 1. Get count before deletion
    const countResult = await pool.query('SELECT COUNT(*) FROM fabric_images')
    const fabricImagesCount = parseInt(countResult.rows[0].count)
    
    const fabricsResult = await pool.query('SELECT COUNT(*) FROM fabrics WHERE primary_image_url IS NOT NULL')
    const fabricsWithImagesCount = parseInt(fabricsResult.rows[0].count)

    console.log(`📊 Current state:`)
    console.log(`   - Fabric images in fabric_images table: ${fabricImagesCount}`)
    console.log(`   - Fabrics with primary_image_url: ${fabricsWithImagesCount}\n`)

    // 2. Delete all from fabric_images table
    console.log('🗑️  Deleting all records from fabric_images table...')
    const deleteImagesResult = await pool.query('DELETE FROM fabric_images')
    console.log(`   ✅ Deleted ${deleteImagesResult.rowCount} records from fabric_images\n`)

    // 3. Set all primary_image_url to NULL in fabrics table
    console.log('🗑️  Setting all primary_image_url to NULL in fabrics table...')
    const updateFabricsResult = await pool.query('UPDATE fabrics SET primary_image_url = NULL')
    console.log(`   ✅ Updated ${updateFabricsResult.rowCount} fabrics\n`)

    // 4. Verify deletion
    const verifyImagesResult = await pool.query('SELECT COUNT(*) FROM fabric_images')
    const verifyFabricsResult = await pool.query('SELECT COUNT(*) FROM fabrics WHERE primary_image_url IS NOT NULL')

    console.log('✅ Verification:')
    console.log(`   - Fabric images remaining: ${verifyImagesResult.rows[0].count}`)
    console.log(`   - Fabrics with primary_image_url: ${verifyFabricsResult.rows[0].count}\n`)

    console.log('🎉 All fabric images data deleted successfully!')
    console.log('📝 You can now upload images manually.\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

deleteAllFabricImages()

