// API Routes cho Fabrics
// GET /api/fabrics - Lấy danh sách fabrics với filter

import { NextRequest, NextResponse } from 'next/server'
import { FabricService } from '@/lib/database'
import { FabricFilter, ApiResponse } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filter: FabricFilter = {}
    
    if (searchParams.get('search')) {
      filter.search = searchParams.get('search')!
    }
    
    if (searchParams.get('material')) {
      filter.material = searchParams.get('material')!.split(',')
    }
    
    if (searchParams.get('color')) {
      filter.color = searchParams.get('color')!.split(',')
    }
    
    if (searchParams.get('pattern')) {
      filter.pattern = searchParams.get('pattern')!.split(',')
    }
    
    if (searchParams.get('collection_id')) {
      filter.collection_id = searchParams.get('collection_id')!
    }
    
    if (searchParams.get('tags')) {
      filter.tags = searchParams.get('tags')!.split(',')
    }
    
    if (searchParams.get('stock_status')) {
      filter.stock_status = searchParams.get('stock_status') as any
    }
    
    // Parse price range
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    if (minPrice || maxPrice) {
      filter.price_range = {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : Infinity
      }
    }

    // Parse MOQ range
    const minMOQ = searchParams.get('min_moq')
    const maxMOQ = searchParams.get('max_moq')
    if (minMOQ || maxMOQ) {
      filter.min_order_quantity = {
        min: minMOQ ? parseInt(minMOQ) : 0,
        max: maxMOQ ? parseInt(maxMOQ) : Infinity
      }
    }

    // Parse created_after for "new" filter
    const createdAfter = searchParams.get('created_after')
    if (createdAfter) {
      filter.created_after = createdAfter
    }
    
    const fabrics = await FabricService.getAll(filter)
    
    const response: ApiResponse<typeof fabrics> = {
      success: true,
      data: fabrics,
      message: `Tìm thấy ${fabrics.length} loại vải`
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching fabrics:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể tải danh sách vải'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
