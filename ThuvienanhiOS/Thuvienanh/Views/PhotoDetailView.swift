//
//  PhotoDetailView.swift
//  Thuvienanh iOS
//
//  Created on 27/10/25.
//

import SwiftUI

struct PhotoDetailView: View {
    let photo: PhotoItem
    @ObservedObject var viewModel: PhotoLibraryViewModel
    @State private var scale: CGFloat = 1.0
    @State private var lastScale: CGFloat = 1.0
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Image viewer with zoom and pan
                GeometryReader { geometry in
                    ScrollView([.horizontal, .vertical], showsIndicators: false) {
                        Image(uiImage: photo.image)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: geometry.size.width * scale, height: geometry.size.height * scale)
                            .offset(offset)
                            .gesture(
                                MagnificationGesture()
                                    .onChanged { value in
                                        scale = lastScale * value
                                    }
                                    .onEnded { _ in
                                        lastScale = scale
                                        // Limit scale
                                        if scale < 1.0 {
                                            scale = 1.0
                                            lastScale = 1.0
                                        } else if scale > 5.0 {
                                            scale = 5.0
                                            lastScale = 5.0
                                        }
                                    }
                            )
                            .gesture(
                                DragGesture()
                                    .onChanged { value in
                                        offset = CGSize(
                                            width: lastOffset.width + value.translation.width,
                                            height: lastOffset.height + value.translation.height
                                        )
                                    }
                                    .onEnded { _ in
                                        lastOffset = offset
                                    }
                            )
                    }
                }
                .background(Color.black)
                
                // Info panel
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text(photo.name)
                            .font(.headline)
                        
                        Spacer()
                        
                        Button(action: {
                            viewModel.toggleFavorite(photo)
                        }) {
                            Image(systemName: viewModel.isFavorite(photo) ? "heart.fill" : "heart")
                                .foregroundColor(viewModel.isFavorite(photo) ? .red : .gray)
                                .font(.title3)
                        }
                    }
                    
                    Divider()
                    
                    HStack(spacing: 20) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Kích thước")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(photo.formattedFileSize)
                                .font(.body)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Độ phân giải")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(photo.resolution)
                                .font(.body)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Định dạng")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("JPEG")
                                .font(.body)
                        }
                    }
                }
                .padding()
                .background(Color(UIColor.systemBackground))
            }
            .navigationTitle("Chi tiết ảnh")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Đóng") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        // Share photo
                        sharePhoto()
                    }) {
                        Image(systemName: "square.and.arrow.up")
                    }
                }
            }
        }
    }
    
    private func sharePhoto() {
        let activityVC = UIActivityViewController(activityItems: [photo.image], applicationActivities: nil)
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let rootVC = window.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }
}

