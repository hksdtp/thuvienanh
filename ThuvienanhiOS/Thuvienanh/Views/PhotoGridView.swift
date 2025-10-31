//
//  PhotoGridView.swift
//  Thuvienanh iOS
//
//  Created on 27/10/25.
//

import SwiftUI

struct PhotoGridView: View {
    @ObservedObject var viewModel: PhotoLibraryViewModel
    let columns = [
        GridItem(.adaptive(minimum: 100, maximum: 150), spacing: 8)
    ]
    
    var body: some View {
        ScrollView {
            if viewModel.filteredPhotos.isEmpty {
                VStack(spacing: 20) {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 60))
                        .foregroundColor(.gray)
                    
                    Text("Chưa có ảnh nào")
                        .font(.title2)
                        .foregroundColor(.gray)
                    
                    Text("Nhấn nút '+' để thêm ảnh")
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.top, 100)
            } else {
                LazyVGrid(columns: columns, spacing: 8) {
                    ForEach(viewModel.filteredPhotos) { photo in
                        PhotoGridItemView(photo: photo, viewModel: viewModel)
                    }
                }
                .padding()
            }
        }
    }
}

struct PhotoGridItemView: View {
    let photo: PhotoItem
    @ObservedObject var viewModel: PhotoLibraryViewModel
    @State private var showingActionSheet = false
    
    var body: some View {
        ZStack(alignment: .topTrailing) {
            Image(uiImage: photo.image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 110, height: 110)
                .clipped()
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(viewModel.selectedPhoto?.id == photo.id ? Color.blue : Color.clear, lineWidth: 3)
                )
                .shadow(radius: 2)
                .onTapGesture {
                    viewModel.selectedPhoto = photo
                }
                .onLongPressGesture {
                    showingActionSheet = true
                }
            
            // Favorite indicator
            if viewModel.isFavorite(photo) {
                Image(systemName: "heart.fill")
                    .foregroundColor(.red)
                    .font(.system(size: 14))
                    .padding(6)
                    .background(Color.white.opacity(0.8))
                    .clipShape(Circle())
                    .padding(6)
            }
        }
        .confirmationDialog("Tùy chọn", isPresented: $showingActionSheet, titleVisibility: .hidden) {
            Button("Xem chi tiết") {
                viewModel.selectedPhoto = photo
            }
            
            Button(viewModel.isFavorite(photo) ? "Bỏ yêu thích" : "Yêu thích") {
                viewModel.toggleFavorite(photo)
            }
            
            Button("Xóa", role: .destructive) {
                viewModel.deletePhoto(photo)
            }
            
            Button("Hủy", role: .cancel) {}
        }
    }
}

