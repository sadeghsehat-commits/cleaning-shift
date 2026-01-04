//
//  User.swift
//  CleaningShiftManager
//

import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let role: UserRole
    let phone: String?
    
    enum UserRole: String, Codable {
        case admin
        case operator
        case owner
        case cleaner
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let name: String
    let role: String
    let phone: String?
    let rolePassword: String?
}

struct AuthResponse: Codable {
    let user: User
}


