//
//  RegisterView.swift
//  CleaningShiftManager
//

import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authService: AuthService
    @Environment(\.dismiss) var dismiss
    
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var phone = ""
    @State private var selectedRole = "operator"
    @State private var rolePassword = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Personal Information") {
                    TextField("Full Name", text: $name)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    SecureField("Password", text: $password)
                    TextField("Phone (Optional)", text: $phone)
                        .keyboardType(.phonePad)
                }
                
                Section("Role") {
                    Picker("Role", selection: $selectedRole) {
                        Text("Operator").tag("operator")
                        Text("Admin").tag("admin")
                        Text("Owner").tag("owner")
                    }
                    
                    if selectedRole == "admin" || selectedRole == "owner" {
                        SecureField("Role Password", text: $rolePassword)
                    }
                }
                
                if let error = authService.errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
                
                Section {
                    Button(action: {
                        Task {
                            let request = RegisterRequest(
                                email: email,
                                password: password,
                                name: name,
                                role: selectedRole,
                                phone: phone.isEmpty ? nil : phone,
                                rolePassword: rolePassword.isEmpty ? nil : rolePassword
                            )
                            await authService.register(request)
                            if authService.isAuthenticated {
                                dismiss()
                            }
                        }
                    }) {
                        if authService.isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else {
                            Text("Sign Up")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .disabled(authService.isLoading || email.isEmpty || password.isEmpty || name.isEmpty)
                }
            }
            .navigationTitle("Sign Up")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    RegisterView()
        .environmentObject(AuthService.shared)
}


