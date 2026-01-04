//
//  Shift.swift
//  CleaningShiftManager
//

import Foundation

struct Shift: Codable, Identifiable {
    let id: String
    let apartment: ApartmentInfo
    let cleaner: CleanerInfo
    let scheduledDate: String
    let scheduledStartTime: String
    let scheduledEndTime: String?
    let actualStartTime: String?
    let actualEndTime: String?
    let status: ShiftStatus
    let notes: String?
    let confirmedSeen: ConfirmedSeen?
    let timeChangeRequest: TimeChangeRequest?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case apartment
        case cleaner
        case scheduledDate
        case scheduledStartTime
        case scheduledEndTime
        case actualStartTime
        case actualEndTime
        case status
        case notes
        case confirmedSeen
        case timeChangeRequest
    }
    
    enum ShiftStatus: String, Codable {
        case scheduled
        case in_progress
        case completed
        case cancelled
    }
    
    struct ApartmentInfo: Codable {
        let id: String
        let name: String
        let address: String
        
        enum CodingKeys: String, CodingKey {
            case id = "_id"
            case name
            case address
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
            self.address = try container.decode(String.self, forKey: .address)
        }
        
        struct IDWrapper: Codable {
            let _id: String
        }
    }
    
    struct CleanerInfo: Codable {
        let id: String
        let name: String
        let email: String
        
        enum CodingKeys: String, CodingKey {
            case id = "_id"
            case name
            case email
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
        }
        
        struct IDWrapper: Codable {
            let _id: String
        }
    }
    
    struct ConfirmedSeen: Codable {
        let confirmed: Bool
        let confirmedAt: String?
    }
    
    struct TimeChangeRequest: Codable {
        let requestedBy: String
        let newStartTime: String?
        let newEndTime: String?
        let reason: String?
        let status: String
        let operatorConfirmed: Bool?
    }
}

struct ShiftsResponse: Codable {
    let shifts: [Shift]
}

struct CreateShiftRequest: Codable {
    let apartment: String
    let cleaner: String
    let scheduledDate: String
    let scheduledStartTime: String
    let scheduledEndTime: String?
    let notes: String?
}

