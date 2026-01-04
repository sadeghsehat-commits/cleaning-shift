//
//  CleaningShiftManagerApp.swift
//  CleaningShiftManager
//
//  Created for Cleaning Shift Manager
//

import SwiftUI

@main
struct CleaningShiftManagerApp: App {
    @StateObject private var authService = AuthService.shared
    
    var body: some Scene {
        WindowGroup {
            if authService.isAuthenticated {
                DashboardView()
                    .environmentObject(authService)
            } else {
                LoginView()
                    .environmentObject(authService)
            }
        }
    }
}


