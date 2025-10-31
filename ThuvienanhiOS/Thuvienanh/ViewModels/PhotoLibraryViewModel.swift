//
//  PhotoLibraryViewModel.swift
//  Thuvienanh iOS
//
//  Created on 27/10/25.
//

import Foundation
import SwiftUI
import UIKit
import PhotosUI
import Combine

@MainActor
final class PhotoLibraryViewModel: ObservableObject {
    @Published var photos: [PhotoItem] = []
    @Published var albums: [Album] = []
    @Published var selectedPhoto: PhotoItem?
    @Published var selectedAlbum: Album?
    @Published var searchText: String = ""
    @Published var isLoading: Bool = false
    @Published var showingImagePicker = false
    @Published var selectedItems: [PhotosPickerItem] = []
    
    var filteredPhotos: [PhotoItem] {
        if searchText.isEmpty {
            if let album = selectedAlbum {
                return photos.filter { album.photoIDs.contains($0.id) }
            }
            return photos
        } else {
            let filtered = photos.filter { photo in
                photo.name.localizedCaseInsensitiveContains(searchText)
            }
            if let album = selectedAlbum {
                return filtered.filter { album.photoIDs.contains($0.id) }
            }
            return filtered
        }
    }
    
    init() {
        // Create default albums
        albums = [
            Album(name: "Tất cả ảnh"),
            Album(name: "Yêu thích")
        ]
    }
    
    func loadPhotosFromPicker() async {
        isLoading = true
        
        for item in selectedItems {
            if let data = try? await item.loadTransferable(type: Data.self),
               let image = UIImage(data: data) {
                let photo = PhotoItem(image: image, name: "Photo \(photos.count + 1)")
                photos.append(photo)
                
                // Add to "Tất cả ảnh" album
                if let allPhotosIndex = albums.firstIndex(where: { $0.name == "Tất cả ảnh" }) {
                    albums[allPhotosIndex].photoIDs.insert(photo.id)
                }
            }
        }
        
        selectedItems = []
        isLoading = false
    }
    
    func requestPhotoLibraryAccess() async -> Bool {
        let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        
        switch status {
        case .authorized, .limited:
            return true
        case .notDetermined:
            let newStatus = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
            return newStatus == .authorized || newStatus == .limited
        default:
            return false
        }
    }
    
    func loadPhotosFromPhotoLibrary() async {
        guard await requestPhotoLibraryAccess() else {
            return
        }
        
        isLoading = true
        
        let fetchOptions = PHFetchOptions()
        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        fetchOptions.fetchLimit = 100 // Limit to 100 photos for performance
        
        let results = PHAsset.fetchAssets(with: .image, options: fetchOptions)
        
        let imageManager = PHImageManager.default()
        let requestOptions = PHImageRequestOptions()
        requestOptions.isSynchronous = false
        requestOptions.deliveryMode = .highQualityFormat
        
        results.enumerateObjects { asset, _, _ in
            let targetSize = CGSize(width: 1000, height: 1000)
            
            imageManager.requestImage(for: asset, targetSize: targetSize, contentMode: .aspectFit, options: requestOptions) { image, _ in
                if let image = image {
                    Task { @MainActor in
                        let photo = PhotoItem(image: image, name: "Photo \(self.photos.count + 1)")
                        self.photos.append(photo)
                        
                        // Add to "Tất cả ảnh" album
                        if let allPhotosIndex = self.albums.firstIndex(where: { $0.name == "Tất cả ảnh" }) {
                            self.albums[allPhotosIndex].photoIDs.insert(photo.id)
                        }
                    }
                }
            }
        }
        
        isLoading = false
    }
    
    func createAlbum(name: String) {
        let newAlbum = Album(name: name)
        albums.append(newAlbum)
    }
    
    func deleteAlbum(_ album: Album) {
        albums.removeAll { $0.id == album.id }
        if selectedAlbum?.id == album.id {
            selectedAlbum = nil
        }
    }
    
    func addPhotoToAlbum(_ photo: PhotoItem, album: Album) {
        if let index = albums.firstIndex(where: { $0.id == album.id }) {
            albums[index].photoIDs.insert(photo.id)
        }
    }
    
    func removePhotoFromAlbum(_ photo: PhotoItem, album: Album) {
        if let index = albums.firstIndex(where: { $0.id == album.id }) {
            albums[index].photoIDs.remove(photo.id)
        }
    }
    
    func toggleFavorite(_ photo: PhotoItem) {
        if let favIndex = albums.firstIndex(where: { $0.name == "Yêu thích" }) {
            if albums[favIndex].photoIDs.contains(photo.id) {
                albums[favIndex].photoIDs.remove(photo.id)
            } else {
                albums[favIndex].photoIDs.insert(photo.id)
            }
        }
    }
    
    func isFavorite(_ photo: PhotoItem) -> Bool {
        if let favAlbum = albums.first(where: { $0.name == "Yêu thích" }) {
            return favAlbum.photoIDs.contains(photo.id)
        }
        return false
    }
    
    func deletePhoto(_ photo: PhotoItem) {
        photos.removeAll { $0.id == photo.id }
        
        // Remove from all albums
        for index in albums.indices {
            albums[index].photoIDs.remove(photo.id)
        }
        
        if selectedPhoto?.id == photo.id {
            selectedPhoto = nil
        }
    }
}

