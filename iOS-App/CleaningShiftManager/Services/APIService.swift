//
//  APIService.swift
//  CleaningShiftManager
//

import Foundation

class APIService {
    static let shared = APIService()
    
    // ⚠️ UPDATE THIS TO YOUR DEPLOYED BACKEND URL
    static let baseURL = "https://your-app.vercel.app"
    // For local testing, use: "http://192.168.1.3:3000"
    
    private let session: URLSession
    
    init() {
        let configuration = URLSessionConfiguration.default
        configuration.httpCookieAcceptPolicy = .always
        configuration.httpShouldSetCookies = true
        self.session = URLSession(configuration: configuration)
    }
    
    // MARK: - Generic Request Method
    
    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(Self.baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        if httpResponse.statusCode >= 400 {
            if let errorData = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.serverError(errorData.error)
            }
            throw APIError.httpError(httpResponse.statusCode)
        }
        
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            print("Decoding error: \(error)")
            throw APIError.decodingError
        }
    }
    
    // MARK: - Authentication
    
    func login(email: String, password: String) async throws -> AuthResponse {
        let request = LoginRequest(email: email, password: password)
        return try await self.request(endpoint: "/api/auth/login", method: "POST", body: request)
    }
    
    func register(_ request: RegisterRequest) async throws -> AuthResponse {
        return try await self.request(endpoint: "/api/auth/register", method: "POST", body: request)
    }
    
    func getCurrentUser() async throws -> AuthResponse {
        return try await self.request(endpoint: "/api/auth/me")
    }
    
    func logout() async throws {
        _ = try await self.request(endpoint: "/api/auth/logout", method: "POST") as EmptyResponse
    }
    
    // MARK: - Shifts
    
    func getShifts(month: String? = nil) async throws -> ShiftsResponse {
        var endpoint = "/api/shifts"
        if let month = month {
            endpoint += "?month=\(month)"
        }
        return try await self.request(endpoint: endpoint)
    }
    
    func getShift(id: String) async throws -> ShiftResponse {
        return try await self.request(endpoint: "/api/shifts/\(id)")
    }
    
    func createShift(_ request: CreateShiftRequest) async throws -> ShiftResponse {
        return try await self.request(endpoint: "/api/shifts", method: "POST", body: request)
    }
    
    // MARK: - Notifications
    
    func getNotifications() async throws -> NotificationsResponse {
        return try await self.request(endpoint: "/api/notifications")
    }
    
    func markNotificationsAsRead(ids: [String]) async throws {
        struct MarkReadRequest: Codable {
            let notificationIds: [String]
            let read: Bool
        }
        let request = MarkReadRequest(notificationIds: ids, read: true)
        _ = try await self.request(endpoint: "/api/notifications", method: "PATCH", body: request) as EmptyResponse
    }
    
    // MARK: - Apartments
    
    func getApartments() async throws -> ApartmentsResponse {
        return try await self.request(endpoint: "/api/apartments")
    }
    
    // MARK: - Users
    
    func getUsers(role: String? = nil) async throws -> UsersResponse {
        var endpoint = "/api/users"
        if let role = role {
            endpoint += "?role=\(role)"
        }
        return try await self.request(endpoint: endpoint)
    }
}

// MARK: - Response Types

struct ShiftResponse: Codable {
    let shift: Shift
}

struct UsersResponse: Codable {
    let users: [User]
}

struct EmptyResponse: Codable {}

struct ErrorResponse: Codable {
    let error: String
}

// MARK: - Errors

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case serverError(String)
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let code):
            return "HTTP Error: \(code)"
        case .serverError(let message):
            return message
        case .decodingError:
            return "Failed to decode response"
        }
    }
}


