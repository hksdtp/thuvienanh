// PostgreSQL Database Connection
// Using pg (node-postgres) client

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tva',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased to 30s for Tailscale connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
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

    // Warm up connection pool on first access
    warmupPool().catch(err => {
      console.error('⚠️ Pool warmup failed (non-critical):', err.message)
    })
  }

  return pool
}

// Warm up the connection pool
let isWarmingUp = false
let isWarmedUp = false

async function warmupPool(): Promise<void> {
  // Prevent multiple warmup attempts
  if (isWarmingUp || isWarmedUp) {
    return
  }

  isWarmingUp = true

  try {
    console.log('🔥 Warming up database connection pool...')
    const client = await getPool().connect()
    await client.query('SELECT 1')
    client.release()
    isWarmedUp = true
    console.log('✅ Database pool warmed up successfully')
  } catch (error: any) {
    console.error('❌ Pool warmup failed:', error.message)
    // Don't throw - allow app to continue
  } finally {
    isWarmingUp = false
  }
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

// Execute a query with retry logic
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  retries = 3
): Promise<QueryResult<T>> {
  const start = Date.now()
  let lastError: any

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await getPool().query<T>(text, params)
      const duration = Date.now() - start
      console.log('📊 Query executed:', { text: text.substring(0, 100), duration, rows: result.rowCount })
      return result
    } catch (error: any) {
      lastError = error
      console.error(`❌ Query error (attempt ${attempt}/${retries}):`, {
        text: text.substring(0, 100),
        error: error.message
      })

      // Don't retry on syntax errors or constraint violations
      if (error.code && !['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code)) {
        throw error
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  console.error('❌ Query failed after all retries:', { text, error: lastError })
  throw lastError
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
