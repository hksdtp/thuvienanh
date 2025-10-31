// API Route to optimize database by adding indexes
// POST /api/admin/optimize-database

import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { ApiResponse } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()
    const results: string[] = []
    
    console.log('🚀 Starting database optimization...')
    results.push('🚀 Starting database optimization...')
    
    // ========================================================================
    // DROP EXISTING INDEXES (for idempotency)
    // ========================================================================
    
    const indexesToDrop = [
      'idx_fabrics_material',
      'idx_fabrics_color',
      'idx_fabrics_pattern',
      'idx_fabrics_created_at',
      'idx_fabrics_is_active',
      'idx_fabrics_search_keywords_gin',
      'idx_fabrics_tags_gin',
      'idx_fabrics_active_created',
      'idx_fabrics_code_unique',
      'idx_fabrics_price',
      'idx_fabrics_stock',
      'idx_fabrics_material_color',
      'idx_fabric_images_fabric_id',
      'idx_fabric_images_sort_order',
      'idx_fabric_images_primary',
      'idx_collections_created_at',
      'idx_collections_is_active',
      'idx_collections_created_by',
      'idx_collection_fabrics_collection_id',
      'idx_collection_fabrics_fabric_id',
      'idx_collection_fabrics_sort',
      'idx_collection_fabrics_unique',
      'idx_albums_category',
      'idx_albums_created_at',
      'idx_albums_is_active',
      // 'idx_albums_category_path', // Removed: column doesn't exist
      'idx_album_images_album_id',
      'idx_album_images_sort_order'
    ]
    
    for (const indexName of indexesToDrop) {
      try {
        await pool.query(`DROP INDEX IF EXISTS ${indexName}`)
        console.log(`✅ Dropped index: ${indexName}`)
      } catch (error: any) {
        console.log(`⚠️  Could not drop ${indexName}: ${error.message}`)
      }
    }
    
    results.push(`✅ Dropped ${indexesToDrop.length} existing indexes`)
    
    // ========================================================================
    // CREATE NEW INDEXES
    // ========================================================================
    
    const indexQueries = [
      // FABRICS TABLE INDEXES
      {
        name: 'idx_fabrics_material',
        query: 'CREATE INDEX idx_fabrics_material ON fabrics(material) WHERE is_active = true'
      },
      {
        name: 'idx_fabrics_color',
        query: 'CREATE INDEX idx_fabrics_color ON fabrics(color) WHERE is_active = true'
      },
      {
        name: 'idx_fabrics_pattern',
        query: 'CREATE INDEX idx_fabrics_pattern ON fabrics(pattern) WHERE is_active = true'
      },
      {
        name: 'idx_fabrics_created_at',
        query: 'CREATE INDEX idx_fabrics_created_at ON fabrics(created_at DESC) WHERE is_active = true'
      },
      {
        name: 'idx_fabrics_is_active',
        query: 'CREATE INDEX idx_fabrics_is_active ON fabrics(is_active)'
      },
      {
        name: 'idx_fabrics_code_unique',
        query: 'CREATE UNIQUE INDEX idx_fabrics_code_unique ON fabrics(code) WHERE is_active = true'
      },
      {
        name: 'idx_fabrics_price',
        query: 'CREATE INDEX idx_fabrics_price ON fabrics(price_per_meter) WHERE is_active = true AND price_per_meter IS NOT NULL'
      },
      {
        name: 'idx_fabrics_stock',
        query: 'CREATE INDEX idx_fabrics_stock ON fabrics(stock_quantity) WHERE is_active = true AND stock_quantity IS NOT NULL'
      },
      {
        name: 'idx_fabrics_search_keywords_gin',
        query: "CREATE INDEX idx_fabrics_search_keywords_gin ON fabrics USING GIN(to_tsvector('english', COALESCE(search_keywords, '')))"
      },
      {
        name: 'idx_fabrics_tags_gin',
        query: 'CREATE INDEX idx_fabrics_tags_gin ON fabrics USING GIN(tags)'
      },
      {
        name: 'idx_fabrics_active_created',
        query: 'CREATE INDEX idx_fabrics_active_created ON fabrics(is_active, created_at DESC)'
      },
      {
        name: 'idx_fabrics_material_color',
        query: 'CREATE INDEX idx_fabrics_material_color ON fabrics(material, color) WHERE is_active = true'
      },
      
      // FABRIC_IMAGES TABLE INDEXES
      {
        name: 'idx_fabric_images_fabric_id',
        query: 'CREATE INDEX idx_fabric_images_fabric_id ON fabric_images(fabric_id)'
      },
      {
        name: 'idx_fabric_images_sort_order',
        query: 'CREATE INDEX idx_fabric_images_sort_order ON fabric_images(fabric_id, sort_order)'
      },
      {
        name: 'idx_fabric_images_primary',
        query: 'CREATE INDEX idx_fabric_images_primary ON fabric_images(fabric_id, is_primary) WHERE is_primary = true'
      },
      
      // COLLECTIONS TABLE INDEXES
      {
        name: 'idx_collections_created_at',
        query: 'CREATE INDEX idx_collections_created_at ON collections(created_at DESC) WHERE is_active = true'
      },
      {
        name: 'idx_collections_is_active',
        query: 'CREATE INDEX idx_collections_is_active ON collections(is_active)'
      },
      {
        name: 'idx_collections_created_by',
        query: 'CREATE INDEX idx_collections_created_by ON collections(created_by) WHERE is_active = true'
      },
      
      // COLLECTION_FABRICS TABLE INDEXES
      {
        name: 'idx_collection_fabrics_collection_id',
        query: 'CREATE INDEX idx_collection_fabrics_collection_id ON collection_fabrics(collection_id)'
      },
      {
        name: 'idx_collection_fabrics_fabric_id',
        query: 'CREATE INDEX idx_collection_fabrics_fabric_id ON collection_fabrics(fabric_id)'
      },
      {
        name: 'idx_collection_fabrics_sort',
        query: 'CREATE INDEX idx_collection_fabrics_sort ON collection_fabrics(collection_id, sort_order)'
      },
      {
        name: 'idx_collection_fabrics_unique',
        query: 'CREATE UNIQUE INDEX idx_collection_fabrics_unique ON collection_fabrics(collection_id, fabric_id)'
      },
      
      // ALBUMS TABLE INDEXES
      {
        name: 'idx_albums_category',
        query: 'CREATE INDEX idx_albums_category ON albums(category) WHERE is_active = true'
      },
      {
        name: 'idx_albums_created_at',
        query: 'CREATE INDEX idx_albums_created_at ON albums(created_at DESC) WHERE is_active = true'
      },
      {
        name: 'idx_albums_is_active',
        query: 'CREATE INDEX idx_albums_is_active ON albums(is_active)'
      },
      // Removed: category_path column doesn't exist in albums table
      
      // ALBUM_IMAGES TABLE INDEXES
      {
        name: 'idx_album_images_album_id',
        query: 'CREATE INDEX idx_album_images_album_id ON album_images(album_id)'
      },
      {
        name: 'idx_album_images_sort_order',
        query: 'CREATE INDEX idx_album_images_sort_order ON album_images(album_id, sort_order)'
      }
    ]
    
    let successCount = 0
    let failCount = 0
    
    for (const { name, query } of indexQueries) {
      try {
        await pool.query(query)
        console.log(`✅ Created index: ${name}`)
        successCount++
      } catch (error: any) {
        console.error(`❌ Failed to create ${name}:`, error.message)
        results.push(`❌ Failed to create ${name}: ${error.message}`)
        failCount++
      }
    }
    
    results.push(`✅ Created ${successCount} indexes successfully`)
    if (failCount > 0) {
      results.push(`⚠️  Failed to create ${failCount} indexes`)
    }
    
    // ========================================================================
    // ANALYZE TABLES
    // ========================================================================
    
    const tablesToAnalyze = [
      'fabrics',
      'fabric_images',
      'collections',
      'collection_fabrics',
      'albums',
      'album_images'
    ]
    
    for (const table of tablesToAnalyze) {
      try {
        await pool.query(`ANALYZE ${table}`)
        console.log(`✅ Analyzed table: ${table}`)
      } catch (error: any) {
        console.error(`❌ Failed to analyze ${table}:`, error.message)
      }
    }
    
    results.push(`✅ Analyzed ${tablesToAnalyze.length} tables`)
    
    // ========================================================================
    // GET INDEX INFORMATION
    // ========================================================================
    
    const indexInfo = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('fabrics', 'fabric_images', 'collections', 'collection_fabrics', 'albums', 'album_images')
      ORDER BY tablename, indexname
    `)
    
    results.push(`\n📊 Total indexes created: ${indexInfo.rows.length}`)
    
    // ========================================================================
    // GET TABLE SIZES
    // ========================================================================
    
    const sizeInfo = await pool.query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('fabrics', 'fabric_images', 'collections', 'collection_fabrics', 'albums', 'album_images')
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `)
    
    results.push('\n📊 Table sizes:')
    for (const row of sizeInfo.rows) {
      results.push(`  ${row.tablename}: ${row.total_size} (table: ${row.table_size}, indexes: ${row.indexes_size})`)
    }
    
    console.log('✅ Database optimization completed!')
    results.push('\n✅ Database optimization completed!')
    
    const response: ApiResponse<{ results: string[], indexes: any[], sizes: any[] }> = {
      success: true,
      data: {
        results,
        indexes: indexInfo.rows,
        sizes: sizeInfo.rows
      },
      message: 'Database optimization completed successfully'
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('❌ Database optimization failed:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: `Database optimization failed: ${error.message}`
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// GET endpoint to check current indexes
export async function GET() {
  try {
    const pool = getPool()
    
    const indexInfo = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('fabrics', 'fabric_images', 'collections', 'collection_fabrics', 'albums', 'album_images')
      ORDER BY tablename, indexname
    `)
    
    const response: ApiResponse<any[]> = {
      success: true,
      data: indexInfo.rows,
      message: `Found ${indexInfo.rows.length} indexes`
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      error: `Failed to get indexes: ${error.message}`
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

