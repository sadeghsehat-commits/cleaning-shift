//
//  CalendarView.swift
//  CleaningShiftManager
//

import SwiftUI

struct CalendarView: View {
    @State private var selectedDate = Date()
    @State private var shifts: [Shift] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    private let apiService = APIService.shared
    
    var body: some View {
        NavigationStack {
            VStack {
                // Calendar
                DatePicker("Select Date", selection: $selectedDate, displayedComponents: .date)
                    .datePickerStyle(.graphical)
                    .padding()
                
                // Shifts for selected date
                if isLoading {
                    ProgressView()
                        .padding()
                } else if let error = errorMessage {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                        .padding()
                } else {
                    List(filteredShifts) { shift in
                        NavigationLink(destination: ShiftDetailView(shiftId: shift.id)) {
                            ShiftCard(shift: shift)
                        }
                    }
                }
            }
            .navigationTitle("Dashboard")
            .onChange(of: selectedDate) { _, _ in
                loadShifts()
            }
            .onAppear {
                loadShifts()
            }
        }
    }
    
    private var filteredShifts: [Shift] {
        let calendar = Calendar.current
        return shifts.filter { shift in
            if let shiftDate = ISO8601DateFormatter().date(from: shift.scheduledDate) {
                return calendar.isDate(shiftDate, inSameDayAs: selectedDate)
            }
            return false
        }
    }
    
    private func loadShifts() {
        isLoading = true
        errorMessage = nil
        
        let calendar = Calendar.current
        let month = calendar.component(.month, from: selectedDate)
        let year = calendar.component(.year, from: selectedDate)
        let monthString = String(format: "%d-%02d", year, month)
        
        Task {
            do {
                let response = try await apiService.getShifts(month: monthString)
                await MainActor.run {
                    self.shifts = response.shifts
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
}

#Preview {
    CalendarView()
}


