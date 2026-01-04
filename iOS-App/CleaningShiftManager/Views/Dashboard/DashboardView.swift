//
//  DashboardView.swift
//  CleaningShiftManager
//

import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authService: AuthService
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            CalendarView()
                .tabItem {
                    Label("Calendar", systemImage: "calendar")
                }
                .tag(0)
            
            ShiftsView()
                .tabItem {
                    Label("Shifts", systemImage: "list.bullet")
                }
                .tag(1)
            
            NotificationsView()
                .tabItem {
                    Label("Notifications", systemImage: "bell")
                }
                .tag(2)
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
                .tag(3)
        }
    }
}

struct ProfileView: View {
    @EnvironmentObject var authService: AuthService
    
    var body: some View {
        NavigationStack {
            List {
                Section("User Information") {
                    if let user = authService.currentUser {
                        HStack {
                            Text("Name")
                            Spacer()
                            Text(user.name)
                                .foregroundColor(.secondary)
                        }
                        HStack {
                            Text("Email")
                            Spacer()
                            Text(user.email)
                                .foregroundColor(.secondary)
                        }
                        HStack {
                            Text("Role")
                            Spacer()
                            Text(user.role.rawValue.capitalized)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Section("Web App") {
                    NavigationLink {
                        PWAView()
                    } label: {
                        HStack {
                            Image(systemName: "globe")
                            Text("Open Web App")
                        }
                    }
                }
                
                Section {
                    Button("Logout", role: .destructive) {
                        Task {
                            await authService.logout()
                        }
                    }
                }
            }
            .navigationTitle("Profile")
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(AuthService.shared)
}

