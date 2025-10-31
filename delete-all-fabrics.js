// Script to delete all fabrics from database
// User will start fresh

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

async function deleteAllFabrics() {
  try {
    console.log('🗑️  Starting to delete all fabrics...\n')

    // 1. Get count before deletion
    const countResult = await pool.query('SELECT COUNT(*) FROM fabrics')
    const fabricsCount = parseInt(countResult.rows[0].count)
    
    const imagesResult = await pool.query('SELECT COUNT(*) FROM fabric_images')
    const imagesCount = parseInt(imagesResult.rows[0].count)

    const collectionFabricsResult = await pool.query('SELECT COUNT(*) FROM collection_fabrics')
    const collectionFabricsCount = parseInt(collectionFabricsResult.rows[0].count)

    console.log(`📊 Current state:`)
    console.log(`   - Fabrics: ${fabricsCount}`)
    console.log(`   - Fabric images: ${imagesCount}`)
    console.log(`   - Collection-Fabric relations: ${collectionFabricsCount}\n`)

    // 2. Delete all collection_fabrics relations first (foreign key constraint)
    console.log('🗑️  Deleting all collection-fabric relations...')
    const deleteCollectionFabricsResult = await pool.query('DELETE FROM collection_fabrics')
    console.log(`   ✅ Deleted ${deleteCollectionFabricsResult.rowCount} relations\n`)

    // 3. Delete all fabric_images (foreign key constraint)
    console.log('🗑️  Deleting all fabric images...')
    const deleteImagesResult = await pool.query('DELETE FROM fabric_images')
    console.log(`   ✅ Deleted ${deleteImagesResult.rowCount} images\n`)

    // 4. Delete all fabrics
    console.log('🗑️  Deleting all fabrics...')
    const deleteFabricsResult = await pool.query('DELETE FROM fabrics')
    console.log(`   ✅ Deleted ${deleteFabricsResult.rowCount} fabrics\n`)

    // 5. Verify deletion
    const verifyFabricsResult = await pool.query('SELECT COUNT(*) FROM fabrics')
    const verifyImagesResult = await pool.query('SELECT COUNT(*) FROM fabric_images')
    const verifyCollectionFabricsResult = await pool.query('SELECT COUNT(*) FROM collection_fabrics')

    console.log('✅ Verification:')
    console.log(`   - Fabrics remaining: ${verifyFabricsResult.rows[0].count}`)
    console.log(`   - Fabric images remaining: ${verifyImagesResult.rows[0].count}`)
    console.log(`   - Collection-Fabric relations remaining: ${verifyCollectionFabricsResult.rows[0].count}\n`)

    console.log('🎉 All fabrics deleted successfully!')
    console.log('📝 Database is now clean. You can start fresh.\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

deleteAllFabrics()

