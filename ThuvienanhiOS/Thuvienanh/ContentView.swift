//
//  ContentView.swift
//  Thuvienanh iOS
//
//  Created on 27/10/25.
//

import SwiftUI
import PhotosUI

struct ContentView: View {
    @StateObject private var viewModel = PhotoLibraryViewModel()
    @State private var showingAlbumList = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                    TextField("Tìm kiếm ảnh...", text: $viewModel.searchText)
                        .textFieldStyle(.plain)
                }
                .padding(10)
                .background(Color(UIColor.systemGray6))
                .cornerRadius(10)
                .padding(.horizontal)
                .padding(.top, 8)
                
                // Album selector
                if let selectedAlbum = viewModel.selectedAlbum {
                    HStack {
                        Button(action: {
                            showingAlbumList = true
                        }) {
                            HStack {
                                Image(systemName: selectedAlbum.name == "Tất cả ảnh" ? "photo.on.rectangle" :
                                                 selectedAlbum.name == "Yêu thích" ? "heart.fill" : "folder")
                                    .foregroundColor(selectedAlbum.name == "Yêu thích" ? .red : .blue)
                                Text(selectedAlbum.name)
                                    .font(.headline)
                                Image(systemName: "chevron.down")
                                    .font(.caption)
                            }
                        }
                        
                        Spacer()
                        
                        Text("\(viewModel.filteredPhotos.count) ảnh")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
                
                Divider()
                
                // Main content
                if viewModel.isLoading {
                    VStack {
                        Spacer()
                        ProgressView()
                            .scaleEffect(1.5)
                        Text("Đang tải ảnh...")
                            .padding(.top)
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                } else {
                    PhotoGridView(viewModel: viewModel)
                }
            }
            .navigationTitle("Thư viện ảnh")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        showingAlbumList = true
                    }) {
                        Image(systemName: "line.3.horizontal")
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: {
                            viewModel.showingImagePicker = true
                        }) {
                            Label("Chọn từ thư viện", systemImage: "photo.on.rectangle")
                        }
                        
                        Button(action: {
                            Task {
                                await viewModel.loadPhotosFromPhotoLibrary()
                            }
                        }) {
                            Label("Tải từ Photos", systemImage: "photo.stack")
                        }
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAlbumList) {
                AlbumListView(viewModel: viewModel)
            }
            .sheet(isPresented: $viewModel.showingImagePicker) {
                PhotosPicker(
                    selection: $viewModel.selectedItems,
                    maxSelectionCount: 20,
                    matching: .images
                ) {
                    Text("Chọn ảnh")
                }
                .onChange(of: viewModel.selectedItems) { _ in
                    Task {
                        await viewModel.loadPhotosFromPicker()
                    }
                }
            }
            .sheet(item: $viewModel.selectedPhoto) { photo in
                PhotoDetailView(photo: photo, viewModel: viewModel)
            }
        }
        .onAppear {
            // Select "Tất cả ảnh" by default
            if viewModel.selectedAlbum == nil {
                viewModel.selectedAlbum = viewModel.albums.first(where: { $0.name == "Tất cả ảnh" })
            }
        }
    }
}

#Preview {
    ContentView()
}

