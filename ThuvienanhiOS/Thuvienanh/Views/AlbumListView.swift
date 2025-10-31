//
//  AlbumListView.swift
//  Thuvienanh iOS
//
//  Created on 27/10/25.
//

import SwiftUI

struct AlbumListView: View {
    @ObservedObject var viewModel: PhotoLibraryViewModel
    @State private var showingNewAlbumSheet = false
    @State private var newAlbumName = ""
    
    var body: some View {
        NavigationView {
            List {
                Section("Album") {
                    ForEach(viewModel.albums) { album in
                        Button(action: {
                            viewModel.selectedAlbum = album
                        }) {
                            HStack {
                                Image(systemName: album.name == "Tất cả ảnh" ? "photo.on.rectangle" : 
                                                 album.name == "Yêu thích" ? "heart.fill" : "folder")
                                    .foregroundColor(album.name == "Yêu thích" ? .red : .blue)
                                
                                Text(album.name)
                                    .foregroundColor(.primary)
                                
                                Spacer()
                                
                                Text("\(album.photoIDs.count)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                if viewModel.selectedAlbum?.id == album.id {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                            if album.name != "Tất cả ảnh" && album.name != "Yêu thích" {
                                Button(role: .destructive) {
                                    viewModel.deleteAlbum(album)
                                } label: {
                                    Label("Xóa", systemImage: "trash")
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Thư viện")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingNewAlbumSheet = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingNewAlbumSheet) {
                NavigationView {
                    Form {
                        Section {
                            TextField("Tên album", text: $newAlbumName)
                        }
                    }
                    .navigationTitle("Album mới")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button("Hủy") {
                                showingNewAlbumSheet = false
                                newAlbumName = ""
                            }
                        }
                        
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button("Tạo") {
                                if !newAlbumName.isEmpty {
                                    viewModel.createAlbum(name: newAlbumName)
                                    showingNewAlbumSheet = false
                                    newAlbumName = ""
                                }
                            }
                            .disabled(newAlbumName.isEmpty)
                        }
                    }
                }
            }
        }
    }
}

