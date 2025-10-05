// PostgreSQL Database Connection
// Using pg (node-postgres) client

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tva_fabric_library',
  user: process.env.POSTGRES_USER || 'tva_admin',
  password: process.env.POSTGRES_PASSWORD || 'Villad24@TVA',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
}

// Create connection pool
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig)
    
    // Log connection events
    pool.on('connect', () => {
      console.log('✅ PostgreSQL: New client connected')
    })
    
    pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err)
    })
    
    pool.on('remove', () => {
      console.log('🔌 PostgreSQL: Client removed from pool')
    })
  }
  
  return pool
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log('✅ Database connection successful:', result.rows[0])
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Execute a query
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const result = await getPool().query<T>(text, params)
    const duration = Date.now() - start
    console.log('📊 Query executed:', { text: text.substring(0, 100), duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('❌ Query error:', { text, error })
    throw error
  }
}

// Execute queries within a transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    console.log('✅ Transaction committed')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Transaction rolled back:', error)
    throw error
  } finally {
    client.release()
  }
}

// Get a client from pool (for complex operations)
export async function getClient(): Promise<PoolClient> {
  return await getPool().connect()
}

// Close all connections (for graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('🔌 Database pool closed')
  }
}

// Helper: Check if database is using mock data or real data
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await testConnection()
    return true
  } catch {
    return false
  }
}

// Helper: Get database stats
export async function getDatabaseStats(): Promise<{
  collections: number
  fabrics: number
  albums: number
  users: number
}> {
  try {
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM collections WHERE is_active = true) as collections,
        (SELECT COUNT(*) FROM fabrics WHERE is_active = true) as fabrics,
        (SELECT COUNT(*) FROM albums WHERE is_active = true) as albums,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as users
    `)
    
    return result.rows[0]
  } catch (error) {
    console.error('Error getting database stats:', error)
    return { collections: 0, fabrics: 0, albums: 0, users: 0 }
  }
}

// Export default pool getter
export default getPool
