//
//  LoginView.swift
//  CleaningShiftManager
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authService: AuthService
    @State private var email = ""
    @State private var password = ""
    @State private var showRegister = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Logo/Title
                VStack(spacing: 10) {
                    Image(systemName: "house.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)
                    Text("Cleaning Shift Manager")
                        .font(.title)
                        .fontWeight(.bold)
                }
                .padding(.bottom, 40)
                
                // Login Form
                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(.roundedBorder)
                    
                    if let error = authService.errorMessage {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                    
                    Button(action: {
                        Task {
                            await authService.login(email: email, password: password)
                        }
                    }) {
                        if authService.isLoading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("Sign In")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(authService.isLoading || email.isEmpty || password.isEmpty)
                    
                    Button("Don't have an account? Sign Up") {
                        showRegister = true
                    }
                    .font(.caption)
                }
                .padding()
            }
            .padding()
            .sheet(isPresented: $showRegister) {
                RegisterView()
                    .environmentObject(authService)
            }
        }
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthService.shared)
}


