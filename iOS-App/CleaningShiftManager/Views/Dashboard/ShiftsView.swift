//
//  ShiftsView.swift
//  CleaningShiftManager
//

import SwiftUI

struct ShiftsView: View {
    @State private var shifts: [Shift] = []
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
                            loadShifts()
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if shifts.isEmpty {
                    Text("No shifts found")
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(shifts) { shift in
                        NavigationLink(destination: ShiftDetailView(shiftId: shift.id)) {
                            ShiftCard(shift: shift)
                        }
                    }
                }
            }
            .navigationTitle("Shifts")
            .refreshable {
                await loadShiftsAsync()
            }
            .onAppear {
                loadShifts()
            }
        }
    }
    
    private func loadShifts() {
        isLoading = true
        errorMessage = nil
        
        Task {
            await loadShiftsAsync()
        }
    }
    
    private func loadShiftsAsync() async {
        do {
            let response = try await apiService.getShifts()
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

#Preview {
    ShiftsView()
}


