// Check price_per_meter column in fabrics table
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

async function checkPriceColumn() {
  try {
    console.log('🔍 Checking price_per_meter column...\n')

    // 1. Check column definition
    const columnInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'fabrics' AND column_name = 'price_per_meter'
    `)
    
    console.log('📋 Column definition:')
    console.log(columnInfo.rows[0])
    console.log()

    // 2. Check actual data
    const fabrics = await pool.query(`
      SELECT id, code, name, price_per_meter, 
             pg_typeof(price_per_meter) as price_type
      FROM fabrics
      ORDER BY created_at DESC
      LIMIT 10
    `)
    
    console.log(`📊 Recent fabrics (${fabrics.rows.length}):`)
    fabrics.rows.forEach(f => {
      console.log(`  - ${f.code}: ${f.name}`)
      console.log(`    Price: ${f.price_per_meter} (type: ${f.price_type})`)
    })
    console.log()

    // 3. Check for NULL or zero prices
    const nullPrices = await pool.query(`
      SELECT COUNT(*) as count
      FROM fabrics
      WHERE price_per_meter IS NULL OR price_per_meter = 0
    `)
    
    console.log(`⚠️  Fabrics with NULL or 0 price: ${nullPrices.rows[0].count}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

checkPriceColumn()

