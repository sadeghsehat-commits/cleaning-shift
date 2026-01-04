//
//  Apartment.swift
//  CleaningShiftManager
//

import Foundation

struct Apartment: Codable, Identifiable {
    let id: String
    let name: String
    let address: String
    let street: String?
    let city: String?
    let postalCode: String?
    let country: String?
    let owner: OwnerInfo
    let description: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name
        case address
        case street
        case city
        case postalCode
        case country
        case owner
        case description
    }
    
    struct OwnerInfo: Codable {
        let id: String
        let name: String
        let email: String
        let phone: String?
        
        enum CodingKeys: String, CodingKey {
            case id = "_id"
            case name
            case email
            case phone
        }
        
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            
            // Handle _id as string or object
            if let idString = try? container.decode(String.self, forKey: .id) {
                self.id = idString
            } else {
                let idObj = try container.decode(IDWrapper.self, forKey: .id)
                self.id = idObj._id
            }
            
            self.name = try container.decode(String.self, forKey: .name)
            self.email = try container.decode(String.self, forKey: .email)
            self.phone = try? container.decode(String.self, forKey: .phone)
        }
        
        struct IDWrapper: Codable {
            let _id: String
        }
    }
}

struct ApartmentsResponse: Codable {
    let apartments: [Apartment]
}

