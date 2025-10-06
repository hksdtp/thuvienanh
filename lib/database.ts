// Database connection và utility functions
// Tạm thời sử dụng in-memory data, sau này sẽ tích hợp với database thực

import {
  Collection,
  Fabric,
  Album,
  AlbumImage,
  CollectionFabric,
  FabricImage,
  CreateCollectionForm,
  UpdateCollectionForm,
  CreateFabricForm,
  UpdateFabricForm,
  CreateAlbumForm,
  UpdateAlbumForm,
  FabricFilter,
  CollectionFilter,
  AlbumFilter,
  PaginatedResponse
} from '@/types/database'

// Mock data cho development - CLEARED FOR REAL DATA
let collections: Collection[] = []

let fabrics: Fabric[] = []

let collectionFabrics: CollectionFabric[] = []

// Collection CRUD operations
export class CollectionService {
  static async getAll(filter?: CollectionFilter): Promise<Collection[]> {
    let result = [...collections]
    
    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase()
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchTerm) ||
        c.description?.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filter?.is_active !== undefined) {
      result = result.filter(c => c.is_active === filter.is_active)
    }
    
    if (filter?.created_by) {
      result = result.filter(c => c.created_by === filter.created_by)
    }
    
    return result.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
  }
  
  static async getById(id: string): Promise<Collection | null> {
    return collections.find(c => c.id === id) || null
  }
  
  static async create(data: CreateCollectionForm, userId: string): Promise<Collection> {
    const newCollection: Collection = {
      id: `col_${Date.now()}`,
      name: data.name,
      description: data.description,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: userId,
      is_active: true,
      fabric_count: 0,
      thumbnail_url: undefined
    }
    
    collections.push(newCollection)
    return newCollection
  }
  
  static async update(id: string, data: UpdateCollectionForm): Promise<Collection | null> {
    const index = collections.findIndex(c => c.id === id)
    if (index === -1) return null
    
    collections[index] = {
      ...collections[index],
      name: data.name,
      description: data.description,
      updated_at: new Date()
    }
    
    return collections[index]
  }
  
  static async delete(id: string): Promise<boolean> {
    const index = collections.findIndex(c => c.id === id)
    if (index === -1) return false
    
    // Soft delete
    collections[index].is_active = false
    collections[index].updated_at = new Date()
    
    // Remove all fabric associations
    collectionFabrics = collectionFabrics.filter(cf => cf.collection_id !== id)
    
    return true
  }
  
  static async getFabrics(collectionId: string): Promise<Fabric[]> {
    const fabricIds = collectionFabrics
      .filter(cf => cf.collection_id === collectionId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(cf => cf.fabric_id)
    
    return fabrics.filter(f => fabricIds.includes(f.id) && f.is_active)
  }
  
  static async addFabric(collectionId: string, fabricId: string, userId: string, notes?: string): Promise<boolean> {
    // Check if association already exists
    const exists = collectionFabrics.some(cf => 
      cf.collection_id === collectionId && cf.fabric_id === fabricId
    )
    
    if (exists) return false
    
    const maxOrder = Math.max(
      ...collectionFabrics
        .filter(cf => cf.collection_id === collectionId)
        .map(cf => cf.sort_order),
      0
    )
    
    const newAssociation: CollectionFabric = {
      id: `cf_${Date.now()}`,
      collection_id: collectionId,
      fabric_id: fabricId,
      added_at: new Date(),
      added_by: userId,
      sort_order: maxOrder + 1,
      notes
    }
    
    collectionFabrics.push(newAssociation)
    
    // Update fabric count
    const collection = collections.find(c => c.id === collectionId)
    if (collection) {
      collection.fabric_count += 1
      collection.updated_at = new Date()
    }
    
    return true
  }
  
  static async removeFabric(collectionId: string, fabricId: string): Promise<boolean> {
    const index = collectionFabrics.findIndex(cf => 
      cf.collection_id === collectionId && cf.fabric_id === fabricId
    )
    
    if (index === -1) return false
    
    collectionFabrics.splice(index, 1)
    
    // Update fabric count
    const collection = collections.find(c => c.id === collectionId)
    if (collection) {
      collection.fabric_count = Math.max(0, collection.fabric_count - 1)
      collection.updated_at = new Date()
    }
    
    return true
  }
}

// Fabric CRUD operations
export class FabricService {
  static async getAll(filter?: FabricFilter): Promise<Fabric[]> {
    let result = fabrics.filter(f => f.is_active)
    
    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase()
      result = result.filter(f => 
        f.name.toLowerCase().includes(searchTerm) ||
        f.code.toLowerCase().includes(searchTerm) ||
        f.description?.toLowerCase().includes(searchTerm) ||
        f.search_keywords?.toLowerCase().includes(searchTerm) ||
        f.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }
    
    if (filter?.material?.length) {
      result = result.filter(f => filter.material!.includes(f.material))
    }
    
    if (filter?.color?.length) {
      result = result.filter(f => filter.color!.includes(f.color))
    }
    
    if (filter?.collection_id) {
      const fabricIds = collectionFabrics
        .filter(cf => cf.collection_id === filter.collection_id)
        .map(cf => cf.fabric_id)
      result = result.filter(f => fabricIds.includes(f.id))
    }
    
    return result.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
  }
  
  static async getById(id: string): Promise<Fabric | null> {
    return fabrics.find(f => f.id === id && f.is_active) || null
  }
}

// Mock data cho Albums - CLEARED FOR REAL DATA
let albums: Album[] = []

let albumImages: AlbumImage[] = []

// Album Service - Real Database Implementation
import { query } from './db'

export class AlbumService {
  static async getAll(filter?: AlbumFilter): Promise<Album[]> {
    try {
      let queryText = `
        SELECT id, name, description, cover_image_url, cover_image_id,
               created_at, updated_at, created_by, is_active,
               tags, category
        FROM albums
        WHERE is_active = true
      `
      const queryParams: any[] = []
      let paramIndex = 1

      // Apply filters
      if (filter?.search) {
        queryText += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
        queryParams.push(`%${filter.search}%`)
        paramIndex++
      }

      if (filter?.category) {
        queryText += ` AND category = $${paramIndex}`
        queryParams.push(filter.category)
        paramIndex++
      }

      if (filter?.tags && filter.tags.length > 0) {
        queryText += ` AND tags && $${paramIndex}::text[]`
        queryParams.push(filter.tags)
        paramIndex++
      }

      if (filter?.created_by) {
        queryText += ` AND created_by = $${paramIndex}`
        queryParams.push(filter.created_by)
        paramIndex++
      }

      if (filter?.date_range) {
        queryText += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`
        queryParams.push(filter.date_range.start, filter.date_range.end)
        paramIndex += 2
      }

      queryText += ` ORDER BY created_at DESC`

      const result = await query<Album>(queryText, queryParams)

      // Ensure dates are properly formatted
      return result.rows.map(album => ({
        ...album,
        created_at: new Date(album.created_at),
        updated_at: new Date(album.updated_at)
      }))
    } catch (error) {
      console.error('❌ AlbumService.getAll error:', error)
      throw error
    }
  }


  static async getById(id: string): Promise<Album | null> {
    try {
      const result = await query<Album>(
        `SELECT id, name, description, cover_image_url, cover_image_id,
                created_at, updated_at, created_by, is_active,
                tags, category
         FROM albums
         WHERE id = $1 AND is_active = true`,
        [id]
      )

      if (result.rows.length === 0) {
        return null
      }

      const album = result.rows[0]
      return {
        ...album,
        created_at: new Date(album.created_at),
        updated_at: new Date(album.updated_at)
      }
    } catch (error) {
      console.error('❌ AlbumService.getById error:', error)
      throw error
    }
  }

  static async create(data: CreateAlbumForm): Promise<Album> {
    try {
      const result = await query<Album>(
        `INSERT INTO albums (name, description, category, tags, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, description, cover_image_url, cover_image_id,
                   created_at, updated_at, created_by, is_active,
                   tags, category`,
        [
          data.name,
          data.description || null,
          data.category || 'other',
          data.tags || [],
          true
        ]
      )

      const album = result.rows[0]
      console.log('✅ Album created in database:', album.id)

      return {
        ...album,
        created_at: new Date(album.created_at),
        updated_at: new Date(album.updated_at)
      }
    } catch (error) {
      console.error('❌ AlbumService.create error:', error)
      throw error
    }
  }

  static async update(id: string, data: Partial<UpdateAlbumForm>): Promise<Album | null> {
    try {
      const updateFields: string[] = []
      const updateValues: any[] = []
      let paramIndex = 1

      if (data.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`)
        updateValues.push(data.name)
        paramIndex++
      }

      if (data.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`)
        updateValues.push(data.description)
        paramIndex++
      }

      if (data.category !== undefined) {
        updateFields.push(`category = $${paramIndex}`)
        updateValues.push(data.category)
        paramIndex++
      }

      if (data.tags !== undefined) {
        updateFields.push(`tags = $${paramIndex}`)
        updateValues.push(data.tags)
        paramIndex++
      }

      if (data.cover_image_url !== undefined) {
        updateFields.push(`cover_image_url = $${paramIndex}`)
        updateValues.push(data.cover_image_url)
        paramIndex++
      }

      if (data.cover_image_id !== undefined) {
        updateFields.push(`cover_image_id = $${paramIndex}`)
        updateValues.push(data.cover_image_id)
        paramIndex++
      }

      if (data.is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex}`)
        updateValues.push(data.is_active)
        paramIndex++
      }

      if (updateFields.length === 0) {
        return this.getById(id)
      }

      updateFields.push(`updated_at = NOW()`)
      updateValues.push(id)

      const result = await query<Album>(
        `UPDATE albums
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex} AND is_active = true
         RETURNING id, name, description, cover_image_url, cover_image_id,
                   created_at, updated_at, created_by, is_active,
                   tags, category`,
        updateValues
      )

      if (result.rows.length === 0) {
        return null
      }

      const album = result.rows[0]
      console.log('✅ Album updated in database:', album.id)

      return {
        ...album,
        created_at: new Date(album.created_at),
        updated_at: new Date(album.updated_at)
      }
    } catch (error) {
      console.error('❌ AlbumService.update error:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await query(
        `UPDATE albums
         SET is_active = false, updated_at = NOW()
         WHERE id = $1 AND is_active = true`,
        [id]
      )

      console.log('✅ Album soft deleted:', id)
      return result.rowCount ? result.rowCount > 0 : false
    } catch (error) {
      console.error('❌ AlbumService.delete error:', error)
      throw error
    }
  }

  static async getImages(albumId: string): Promise<AlbumImage[]> {
    try {
      const result = await query<AlbumImage>(
        `SELECT id, album_id, image_id, image_url, image_name, sort_order, added_at, added_by
         FROM album_images
         WHERE album_id = $1
         ORDER BY sort_order ASC, added_at DESC`,
        [albumId]
      )

      return result.rows.map(img => ({
        ...img,
        added_at: new Date(img.added_at)
      }))
    } catch (error) {
      console.error('❌ AlbumService.getImages error:', error)
      throw error
    }
  }

  static async addImage(
    albumId: string,
    imageId: string,
    imageUrl: string,
    imageName: string,
    metadata?: {
      thumbnailUrl?: string
      synologyId?: number
      folderId?: number
      fileSize?: number
      compressedSize?: number
    }
  ): Promise<AlbumImage> {
    try {
      // Get current max sort_order
      const maxOrderResult = await query<{ max_order: number | null }>(
        `SELECT MAX(sort_order) as max_order FROM album_images WHERE album_id = $1`,
        [albumId]
      )
      const nextOrder = (maxOrderResult.rows[0]?.max_order || 0) + 1

      // Calculate compression ratio if both sizes provided
      let compressionRatio = null
      if (metadata?.fileSize && metadata?.compressedSize) {
        compressionRatio = parseFloat(((metadata.fileSize - metadata.compressedSize) / metadata.fileSize * 100).toFixed(2))
      }

      // Insert new image with metadata
      const result = await query<AlbumImage>(
        `INSERT INTO album_images (
          album_id, image_id, image_url, image_name, sort_order,
          thumbnail_url, synology_id, folder_id,
          file_size, compressed_size, compression_ratio
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          albumId,
          imageId,
          imageUrl,
          imageName,
          nextOrder,
          metadata?.thumbnailUrl || null,
          metadata?.synologyId || null,
          metadata?.folderId || null,
          metadata?.fileSize || null,
          metadata?.compressedSize || null,
          compressionRatio
        ]
      )

      const albumImage = result.rows[0]
      console.log('✅ Image added to album with metadata:', albumImage.id)

      return {
        ...albumImage,
        added_at: new Date(albumImage.added_at)
      }
    } catch (error) {
      console.error('❌ AlbumService.addImage error:', error)
      throw error
    }
  }

  static async removeImage(albumId: string, recordId: string): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM album_images
         WHERE album_id = $1 AND id = $2
         RETURNING id`,
        [albumId, recordId]
      )

      if (result.rows.length === 0) {
        console.log('❌ Image not found in album')
        return false
      }

      console.log('✅ Image removed from album:', result.rows[0].id)
      return true
    } catch (error) {
      console.error('❌ AlbumService.removeImage error:', error)
      throw error
    }
  }

  static async reorderImages(albumId: string, imageOrders: { imageId: string; order: number }[]): Promise<boolean> {
    try {
      // Update each image's sort_order
      for (const { imageId, order } of imageOrders) {
        await query(
          `UPDATE album_images
           SET sort_order = $1
           WHERE album_id = $2 AND image_id = $3`,
          [order, albumId, imageId]
        )
      }

      console.log('✅ Images reordered successfully')
      return true
    } catch (error) {
      console.error('❌ AlbumService.reorderImages error:', error)
      throw error
    }
  }

  static async setCoverImage(albumId: string, imageId: string, imageUrl: string): Promise<boolean> {
    const album = albums.find(a => a.id === albumId)
    if (!album) return false

    album.cover_image_id = imageId
    album.cover_image_url = imageUrl
    album.updated_at = new Date()

    return true
  }
}

// Utility functions
export function generateFabricCode(): string {
  const prefix = 'F'
  const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `${prefix}${number}`
}
