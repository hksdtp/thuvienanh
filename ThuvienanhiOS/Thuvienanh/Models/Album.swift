//
//  Album.swift
//  Thuvienanh iOS
//
//  Created on 27/10/25.
//

import Foundation

struct Album: Identifiable, Hashable {
    let id = UUID()
    var name: String
    var photoIDs: Set<UUID>
    let dateCreated: Date
    
    init(name: String, photoIDs: Set<UUID> = []) {
        self.name = name
        self.photoIDs = photoIDs
        self.dateCreated = Date()
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Album, rhs: Album) -> Bool {
        lhs.id == rhs.id
    }
}

