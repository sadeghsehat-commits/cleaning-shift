//
//  Notification.swift
//  CleaningShiftManager
//

import Foundation

struct AppNotification: Codable, Identifiable {
    let id: String
    let type: String
    let title: String
    let message: String
    let read: Bool
    let createdAt: String
    let relatedShift: String?
    let shiftDetails: ShiftDetails?
    let timeChangeDetails: TimeChangeDetails?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case type
        case title
        case message
        case read
        case createdAt
        case relatedShift
        case shiftDetails
        case timeChangeDetails
    }
    
    struct ShiftDetails: Codable {
        let apartmentName: String
        let apartmentAddress: String
        let scheduledDate: String
        let scheduledStartTime: String
        let scheduledEndTime: String?
        let confirmed: Bool
    }
    
    struct TimeChangeDetails: Codable {
        let newStartTime: String
        let newEndTime: String?
        let reason: String?
        let operatorConfirmed: Bool
    }
}

struct NotificationsResponse: Codable {
    let notifications: [AppNotification]
}

