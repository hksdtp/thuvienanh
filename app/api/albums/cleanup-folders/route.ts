import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { synologyService } from '@/lib/synology'
import { ApiResponse } from '@/types/database'
import { createFolderName } from '@/lib/utils'

/**
 * API để cleanup các folder orphan trên Synology
 * Xóa các folder không có album tương ứng trong database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting folder cleanup...')

    // Authenticate with FileStation
    const authSuccess = await synologyService.fileStation.authenticate()
    if (!authSuccess) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to authenticate with Synology FileStation'
      }
      return NextResponse.json(response, { status: 500 })
    }

    // Get all folders in thuvienanh directory
    const listResponse = await fetch(`${synologyService.fileStation['workingUrl']}/webapi/entry.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api: 'SYNO.FileStation.List',
        version: '2',
        method: 'list',
        folder_path: '/Marketing/Ninh/thuvienanh',
        _sid: synologyService.fileStation['sessionId']!,
      }),
    })

    const listData = await listResponse.json()
    if (!listData.success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to list folders from Synology'
      }
      return NextResponse.json(response, { status: 500 })
    }

    const folders = listData.data.files.filter((file: any) => file.isdir)
    console.log(`📁 Found ${folders.length} folders in Synology`)

    // Get all active albums from database
    const albums = await AlbumService.getAll({ is_active: true })
    console.log(`📊 Found ${albums.length} active albums in database`)

    // Create a set of expected folder names
    const expectedFolders = new Set<string>()
    for (const album of albums) {
      const folderName = createFolderName(album.name, album.id)
      expectedFolders.add(folderName)
    }

    // Find orphan folders (folders that don't have corresponding active albums)
    const orphanFolders: string[] = []
    for (const folder of folders) {
      const folderName = folder.name
      
      // Skip special folders
      if (folderName === 'Album Database Success' || folderName.endsWith('.txt')) {
        continue
      }

      // Check if folder name matches any expected folder
      if (!expectedFolders.has(folderName)) {
        orphanFolders.push(folderName)
      }
    }

    console.log(`🗑️ Found ${orphanFolders.length} orphan folders to delete:`)
    orphanFolders.forEach(name => console.log(`   - ${name}`))

    // Delete orphan folders
    const deletedFolders: string[] = []
    const failedFolders: string[] = []

    for (const folderName of orphanFolders) {
      try {
        const folderPath = `/Marketing/Ninh/thuvienanh/${folderName}`
        console.log(`🗑️ Deleting orphan folder: ${folderPath}`)
        
        const deleted = await synologyService.fileStation.deleteFolder(folderPath)
        if (deleted) {
          deletedFolders.push(folderName)
          console.log(`✅ Deleted: ${folderName}`)
        } else {
          failedFolders.push(folderName)
          console.warn(`⚠️ Failed to delete: ${folderName}`)
        }
      } catch (error) {
        failedFolders.push(folderName)
        console.error(`❌ Error deleting ${folderName}:`, error)
      }
    }

    console.log(`✅ Cleanup complete: ${deletedFolders.length} deleted, ${failedFolders.length} failed`)

    const response: ApiResponse<{
      totalFolders: number
      activeAlbums: number
      orphanFolders: number
      deletedFolders: string[]
      failedFolders: string[]
    }> = {
      success: true,
      data: {
        totalFolders: folders.length,
        activeAlbums: albums.length,
        orphanFolders: orphanFolders.length,
        deletedFolders,
        failedFolders
      },
      message: `Cleanup hoàn tất: Xóa ${deletedFolders.length}/${orphanFolders.length} folders`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during cleanup'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

