// PostgreSQL Database Service Layer
// Replaces in-memory data with real PostgreSQL queries

import { query, transaction } from './db'
import {
  Collection,
  Fabric,
  Album,
  AlbumImage,
  CollectionFabric,
  CreateCollectionForm,
  UpdateCollectionForm,
  CreateFabricForm,
  UpdateFabricForm,
  CreateAlbumForm,
  UpdateAlbumForm,
  FabricFilter,
  CollectionFilter,
  AlbumFilter
} from '@/types/database'

// Collection CRUD operations
export class CollectionService {
  static async getAll(filter?: CollectionFilter): Promise<Collection[]> {
    let sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT cf.fabric_id) as fabric_count
      FROM collections c
      LEFT JOIN collection_fabrics cf ON c.id = cf.collection_id
      WHERE c.is_active = true
    `
    const params: any[] = []
    let paramIndex = 1

    if (filter?.search) {
      sql += ` AND (c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`
      params.push(`%${filter.search}%`)
      paramIndex++
    }

    if (filter?.created_by) {
      sql += ` AND c.created_by = $${paramIndex}`
      params.push(filter.created_by)
      paramIndex++
    }

    sql += ` GROUP BY c.id ORDER BY c.updated_at DESC`

    const result = await query<Collection>(sql, params)
    return result.rows
  }

  static async getById(id: string): Promise<Collection | null> {
    const sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT cf.fabric_id) as fabric_count
      FROM collections c
      LEFT JOIN collection_fabrics cf ON c.id = cf.collection_id
      WHERE c.id = $1 AND c.is_active = true
      GROUP BY c.id
    `
    const result = await query<Collection>(sql, [id])
    return result.rows[0] || null
  }

  static async create(data: CreateCollectionForm, userId: string): Promise<Collection> {
    const sql = `
      INSERT INTO collections (name, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await query<Collection>(sql, [data.name, data.description, userId])
    return { ...result.rows[0], fabric_count: 0 }
  }

  static async update(id: string, data: UpdateCollectionForm): Promise<Collection | null> {
    const sql = `
      UPDATE collections
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND is_active = true
      RETURNING *
    `
    const result = await query<Collection>(sql, [data.name, data.description, id])
    if (result.rows[0]) {
      return this.getById(id) // Get with fabric_count
    }
    return null
  }

  static async delete(id: string): Promise<boolean> {
    const sql = `
      UPDATE collections
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `
    const result = await query(sql, [id])
    return result.rowCount ? result.rowCount > 0 : false
  }

  static async getFabrics(collectionId: string): Promise<Fabric[]> {
    const sql = `
      SELECT f.*
      FROM fabrics f
      INNER JOIN collection_fabrics cf ON f.id = cf.fabric_id
      WHERE cf.collection_id = $1 AND f.is_active = true
      ORDER BY cf.sort_order ASC
    `
    const result = await query<Fabric>(sql, [collectionId])
    return result.rows
  }

  static async addFabric(collectionId: string, fabricId: string, userId: string, notes?: string): Promise<boolean> {
    try {
      // Get max sort_order
      const maxOrderResult = await query(
        `SELECT COALESCE(MAX(sort_order), 0) as max_order 
         FROM collection_fabrics WHERE collection_id = $1`,
        [collectionId]
      )
      const maxOrder = maxOrderResult.rows[0].max_order

      const sql = `
        INSERT INTO collection_fabrics (collection_id, fabric_id, added_by, sort_order, notes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (collection_id, fabric_id) DO NOTHING
        RETURNING id
      `
      const result = await query(sql, [collectionId, fabricId, userId, maxOrder + 1, notes])
      return result.rowCount ? result.rowCount > 0 : false
    } catch (error) {
      console.error('Error adding fabric to collection:', error)
      return false
    }
  }

  static async removeFabric(collectionId: string, fabricId: string): Promise<boolean> {
    const sql = `
      DELETE FROM collection_fabrics
      WHERE collection_id = $1 AND fabric_id = $2
      RETURNING id
    `
    const result = await query(sql, [collectionId, fabricId])
    return result.rowCount ? result.rowCount > 0 : false
  }
}

// Fabric CRUD operations
export class FabricService {
  static async getAll(filter?: FabricFilter): Promise<Fabric[]> {
    let sql = `SELECT * FROM fabrics WHERE is_active = true`
    const params: any[] = []
    let paramIndex = 1

    if (filter?.search) {
      sql += ` AND (
        name ILIKE $${paramIndex} OR 
        code ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR
        search_keywords ILIKE $${paramIndex} OR
        $${paramIndex} = ANY(tags)
      )`
      params.push(`%${filter.search}%`)
      paramIndex++
    }

    if (filter?.material?.length) {
      sql += ` AND material = ANY($${paramIndex})`
      params.push(filter.material)
      paramIndex++
    }

    if (filter?.color?.length) {
      sql += ` AND color = ANY($${paramIndex})`
      params.push(filter.color)
      paramIndex++
    }

    if (filter?.collection_id) {
      sql = `
        SELECT f.* FROM fabrics f
        INNER JOIN collection_fabrics cf ON f.id = cf.fabric_id
        WHERE f.is_active = true AND cf.collection_id = $${paramIndex}
      `
      params.push(filter.collection_id)
      paramIndex++
    }

    sql += ` ORDER BY updated_at DESC`

    const result = await query<Fabric>(sql, params)
    return result.rows
  }

  static async getById(id: string): Promise<Fabric | null> {
    const sql = `SELECT * FROM fabrics WHERE id = $1 AND is_active = true`
    const result = await query<Fabric>(sql, [id])
    return result.rows[0] || null
  }

  static async create(data: CreateFabricForm, userId: string): Promise<Fabric> {
    const sql = `
      INSERT INTO fabrics (
        code, name, description, material, width, weight, color, pattern, finish, origin,
        price_per_meter, stock_quantity, min_order_quantity, created_by, tags, search_keywords
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `
    const result = await query<Fabric>(sql, [
      data.code, data.name, data.description, data.material, data.width, data.weight,
      data.color, data.pattern, data.finish, data.origin, data.price_per_meter,
      data.stock_quantity, data.min_order_quantity, userId, data.tags, data.search_keywords
    ])
    return result.rows[0]
  }

  static async update(id: string, data: UpdateFabricForm): Promise<Fabric | null> {
    const sql = `
      UPDATE fabrics
      SET name = $1, description = $2, material = $3, width = $4, weight = $5,
          color = $6, pattern = $7, finish = $8, origin = $9, price_per_meter = $10,
          stock_quantity = $11, min_order_quantity = $12, tags = $13, search_keywords = $14,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $15 AND is_active = true
      RETURNING *
    `
    const result = await query<Fabric>(sql, [
      data.name, data.description, data.material, data.width, data.weight, data.color,
      data.pattern, data.finish, data.origin, data.price_per_meter, data.stock_quantity,
      data.min_order_quantity, data.tags, data.search_keywords, id
    ])
    return result.rows[0] || null
  }

  static async delete(id: string): Promise<boolean> {
    const sql = `
      UPDATE fabrics
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `
    const result = await query(sql, [id])
    return result.rowCount ? result.rowCount > 0 : false
  }
}

// Album Service
export class AlbumService {
  static async getAll(filter?: AlbumFilter): Promise<Album[]> {
    let sql = `
      SELECT 
        a.*,
        COUNT(ai.id) as image_count
      FROM albums a
      LEFT JOIN album_images ai ON a.id = ai.album_id
      WHERE a.is_active = true
    `
    const params: any[] = []
    let paramIndex = 1

    if (filter?.search) {
      sql += ` AND (a.name ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex})`
      params.push(`%${filter.search}%`)
      paramIndex++
    }

    if (filter?.category) {
      sql += ` AND a.category = $${paramIndex}`
      params.push(filter.category)
      paramIndex++
    }

    if (filter?.created_by) {
      sql += ` AND a.created_by = $${paramIndex}`
      params.push(filter.created_by)
      paramIndex++
    }

    sql += ` GROUP BY a.id ORDER BY a.updated_at DESC`

    const result = await query<Album>(sql, params)
    return result.rows
  }

  static async getById(id: string): Promise<Album | null> {
    const sql = `
      SELECT 
        a.*,
        COUNT(ai.id) as image_count
      FROM albums a
      LEFT JOIN album_images ai ON a.id = ai.album_id
      WHERE a.id = $1 AND a.is_active = true
      GROUP BY a.id
    `
    const result = await query<Album>(sql, [id])
    return result.rows[0] || null
  }

  static async create(data: CreateAlbumForm): Promise<Album> {
    const sql = `
      INSERT INTO albums (name, description, category, tags, created_by)
      VALUES ($1, $2, $3, $4, 'current-user')
      RETURNING *
    `
    const result = await query<Album>(sql, [
      data.name, data.description, data.category || 'other', data.tags || []
    ])
    return { ...result.rows[0], image_count: 0 }
  }

  static async update(id: string, data: UpdateAlbumForm): Promise<Album | null> {
    const sql = `
      UPDATE albums
      SET name = $1, description = $2, category = $3, tags = $4, 
          cover_image_id = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND is_active = true
      RETURNING *
    `
    const result = await query<Album>(sql, [
      data.name, data.description, data.category, data.tags, data.cover_image_id, id
    ])
    if (result.rows[0]) {
      return this.getById(id)
    }
    return null
  }

  static async delete(id: string): Promise<boolean> {
    const sql = `
      UPDATE albums
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `
    const result = await query(sql, [id])
    return result.rowCount ? result.rowCount > 0 : false
  }

  static async getImages(albumId: string): Promise<AlbumImage[]> {
    const sql = `
      SELECT * FROM album_images
      WHERE album_id = $1
      ORDER BY sort_order ASC
    `
    const result = await query<AlbumImage>(sql, [albumId])
    return result.rows
  }

  static async addImage(albumId: string, imageId: string, imageUrl: string, imageName: string): Promise<AlbumImage> {
    // Get max sort_order
    const maxOrderResult = await query(
      `SELECT COALESCE(MAX(sort_order), 0) as max_order 
       FROM album_images WHERE album_id = $1`,
      [albumId]
    )
    const maxOrder = maxOrderResult.rows[0].max_order

    const sql = `
      INSERT INTO album_images (album_id, image_id, image_url, image_name, sort_order, added_by)
      VALUES ($1, $2, $3, $4, $5, 'current-user')
      RETURNING *
    `
    const result = await query<AlbumImage>(sql, [albumId, imageId, imageUrl, imageName, maxOrder + 1])
    return result.rows[0]
  }

  static async removeImage(albumId: string, imageId: string): Promise<boolean> {
    const sql = `
      DELETE FROM album_images
      WHERE album_id = $1 AND image_id = $2
      RETURNING id
    `
    const result = await query(sql, [albumId, imageId])
    return result.rowCount ? result.rowCount > 0 : false
  }

  static async reorderImages(albumId: string, imageOrders: { imageId: string; order: number }[]): Promise<boolean> {
    try {
      await transaction(async (client) => {
        for (const { imageId, order } of imageOrders) {
          await client.query(
            `UPDATE album_images SET sort_order = $1 WHERE album_id = $2 AND image_id = $3`,
            [order, albumId, imageId]
          )
        }
      })
      return true
    } catch (error) {
      console.error('Error reordering images:', error)
      return false
    }
  }

  static async setCoverImage(albumId: string, imageId: string, imageUrl: string): Promise<boolean> {
    const sql = `
      UPDATE albums
      SET cover_image_id = $1, cover_image_url = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id
    `
    const result = await query(sql, [imageId, imageUrl, albumId])
    return result.rowCount ? result.rowCount > 0 : false
  }
}

// Utility function
export function generateFabricCode(): string {
  const prefix = 'F'
  const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `${prefix}${number}`
}
