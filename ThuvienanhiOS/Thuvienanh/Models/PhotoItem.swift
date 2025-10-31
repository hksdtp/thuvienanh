//
//  PhotoItem.swift
//  Thuvienanh iOS
//
//  Created on 27/10/25.
//

import Foundation
import SwiftUI
import UIKit
import UniformTypeIdentifiers

struct PhotoItem: Identifiable, Hashable {
    let id = UUID()
    let image: UIImage
    let name: String
    let dateAdded: Date
    let fileSize: Int64
    
    init(image: UIImage, name: String = "Photo") {
        self.image = image
        self.name = name
        self.dateAdded = Date()
        
        // Estimate file size from image data
        if let data = image.jpegData(compressionQuality: 1.0) {
            self.fileSize = Int64(data.count)
        } else {
            self.fileSize = 0
        }
    }
    
    var formattedFileSize: String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useKB, .useMB, .useGB]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: fileSize)
    }
    
    var resolution: String {
        let width = Int(image.size.width * image.scale)
        let height = Int(image.size.height * image.scale)
        return "\(width) × \(height)"
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: PhotoItem, rhs: PhotoItem) -> Bool {
        lhs.id == rhs.id
    }
}

