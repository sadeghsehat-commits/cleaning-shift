//
//  ShiftDetailView.swift
//  CleaningShiftManager
//

import SwiftUI

struct ShiftDetailView: View {
    let shiftId: String
    @State private var shift: Shift?
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    private let apiService = APIService.shared
    
    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView()
                    .padding()
            } else if let error = errorMessage {
                Text("Error: \(error)")
                    .foregroundColor(.red)
                    .padding()
            } else if let shift = shift {
                VStack(alignment: .leading, spacing: 20) {
                    // Apartment Info
                    SectionView(title: "Apartment") {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(shift.apartment.name)
                                .font(.headline)
                            Text(shift.apartment.address)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // Cleaner Info
                    SectionView(title: "Operator") {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(shift.cleaner.name)
                                .font(.headline)
                            Text(shift.cleaner.email)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // Schedule
                    SectionView(title: "Schedule") {
                        VStack(alignment: .leading, spacing: 8) {
                            Label(formatDate(shift.scheduledDate), systemImage: "calendar")
                            Label(formatTime(shift.scheduledStartTime), systemImage: "clock")
                            if let endTime = shift.scheduledEndTime {
                                Label(formatTime(endTime), systemImage: "clock.fill")
                            }
                        }
                    }
                    
                    // Status
                    SectionView(title: "Status") {
                        StatusBadge(status: shift.status)
                    }
                    
                    // Notes
                    if let notes = shift.notes, !notes.isEmpty {
                        SectionView(title: "Notes") {
                            Text(notes)
                                .font(.body)
                        }
                    }
                }
                .padding()
            }
        }
        .navigationTitle("Shift Details")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            loadShift()
        }
    }
    
    private func loadShift() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let response = try await apiService.getShift(id: shiftId)
                await MainActor.run {
                    self.shift = response.shift
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            return displayFormatter.string(from: date)
        }
        return dateString
    }
    
    private func formatTime(_ timeString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: timeString) {
            let displayFormatter = DateFormatter()
            displayFormatter.timeStyle = .short
            return displayFormatter.string(from: date)
        }
        return timeString
    }
}

struct SectionView<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
                .foregroundColor(.secondary)
            content
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

struct StatusBadge: View {
    let status: Shift.ShiftStatus
    
    var body: some View {
        HStack {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)
            Text(status.rawValue.capitalized)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(statusColor.opacity(0.2))
        .foregroundColor(statusColor)
        .cornerRadius(8)
    }
    
    private var statusColor: Color {
        switch status {
        case .scheduled: return .yellow
        case .in_progress: return .blue
        case .completed: return .green
        case .cancelled: return .red
        }
    }
}

#Preview {
    NavigationStack {
        ShiftDetailView(shiftId: "test")
    }
}


