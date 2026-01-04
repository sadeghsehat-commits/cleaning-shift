//
//  ShiftCard.swift
//  CleaningShiftManager
//

import SwiftUI

struct ShiftCard: View {
    let shift: Shift
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(shift.apartment.name)
                    .font(.headline)
                Spacer()
                StatusBadge(status: shift.status)
            }
            
            Text(shift.apartment.address)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack {
                Label(formatDate(shift.scheduledDate), systemImage: "calendar")
                    .font(.caption)
                Spacer()
                Label(formatTime(shift.scheduledStartTime), systemImage: "clock")
                    .font(.caption)
            }
            .foregroundColor(.secondary)
            
            Text("Operator: \(shift.cleaner.name)")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .short
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

#Preview {
    List {
        ShiftCard(shift: Shift(
            id: "1",
            apartment: Shift.ApartmentInfo(id: "1", name: "Apartment 1", address: "123 Main St"),
            cleaner: Shift.CleanerInfo(id: "1", name: "John Doe", email: "john@example.com"),
            scheduledDate: "2024-01-15T00:00:00.000Z",
            scheduledStartTime: "2024-01-15T09:00:00.000Z",
            scheduledEndTime: "2024-01-15T11:00:00.000Z",
            actualStartTime: nil,
            actualEndTime: nil,
            status: .scheduled,
            notes: nil,
            confirmedSeen: nil,
            timeChangeRequest: nil
        ))
    }
}


