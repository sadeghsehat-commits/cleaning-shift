package com.cleaningmanager.app.data.models

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("id")
    val id: String,
    val email: String,
    val name: String,
    val role: UserRole,
    val phone: String? = null
)

enum class UserRole {
    admin,
    operator,
    owner,
    cleaner
}

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String,
    val role: String,
    val phone: String? = null,
    val rolePassword: String? = null
)

data class AuthResponse(
    val user: User
)


