//
//  AuthService.swift
//  CleaningShiftManager
//

import Foundation
import SwiftUI

@MainActor
class AuthService: ObservableObject {
    static let shared = AuthService()
    
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService.shared
    
    private init() {
        Task {
            await checkAuthStatus()
        }
    }
    
    func checkAuthStatus() async {
        isLoading = true
        do {
            let response = try await apiService.getCurrentUser()
            self.currentUser = response.user
            self.isAuthenticated = true
        } catch {
            self.isAuthenticated = false
            self.currentUser = nil
        }
        isLoading = false
    }
    
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await apiService.login(email: email, password: password)
            self.currentUser = response.user
            self.isAuthenticated = true
        } catch {
            self.errorMessage = error.localizedDescription
            self.isAuthenticated = false
        }
        
        isLoading = false
    }
    
    func register(_ request: RegisterRequest) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await apiService.register(request)
            self.currentUser = response.user
            self.isAuthenticated = true
        } catch {
            self.errorMessage = error.localizedDescription
            self.isAuthenticated = false
        }
        
        isLoading = false
    }
    
    func logout() async {
        do {
            try await apiService.logout()
        } catch {
            print("Logout error: \(error)")
        }
        self.currentUser = nil
        self.isAuthenticated = false
    }
}


