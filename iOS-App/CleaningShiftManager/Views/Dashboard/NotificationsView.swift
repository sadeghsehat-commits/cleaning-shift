//
//  NotificationsView.swift
//  CleaningShiftManager
//

import SwiftUI

struct NotificationsView: View {
    @State private var notifications: [AppNotification] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    private let apiService = APIService.shared
    
    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = errorMessage {
                    VStack {
                        Text("Error: \(error)")
                            .foregroundColor(.red)
                        Button("Retry") {
                            loadNotifications()
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if notifications.isEmpty {
                    Text("No notifications")
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(notifications) { notification in
                        NotificationRow(notification: notification)
                            .swipeActions(edge: .trailing) {
                                if !notification.read {
                                    Button("Mark Read") {
                                        markAsRead([notification.id])
                                    }
                                    .tint(.blue)
                                }
                            }
                    }
                }
            }
            .navigationTitle("Notifications")
            .refreshable {
                await loadNotificationsAsync()
            }
            .onAppear {
                loadNotifications()
            }
        }
    }
    
    private func loadNotifications() {
        isLoading = true
        errorMessage = nil
        
        Task {
            await loadNotificationsAsync()
        }
    }
    
    private func loadNotificationsAsync() async {
        do {
            let response = try await apiService.getNotifications()
            await MainActor.run {
                self.notifications = response.notifications
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    private func markAsRead(_ ids: [String]) {
        Task {
            do {
                try await apiService.markNotificationsAsRead(ids: ids)
                await loadNotificationsAsync()
            } catch {
                print("Error marking as read: \(error)")
            }
        }
    }
}

struct NotificationRow: View {
    let notification: AppNotification
    
    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 4) {
                Text(notification.title)
                    .font(.headline)
                    .foregroundColor(notification.read ? .secondary : .primary)
                
                Text(notification.message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                if let shiftDetails = notification.shiftDetails {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("📍 \(shiftDetails.apartmentName)")
                            .font(.caption)
                        Text(shiftDetails.apartmentAddress)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 4)
                }
                
                Text(formatDate(notification.createdAt))
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .padding(.top, 2)
            }
            
            Spacer()
            
            if !notification.read {
                Circle()
                    .fill(Color.blue)
                    .frame(width: 8, height: 8)
            }
        }
        .padding(.vertical, 4)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .short
            displayFormatter.timeStyle = .short
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

#Preview {
    NotificationsView()
}


