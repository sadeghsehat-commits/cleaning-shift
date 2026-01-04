package com.cleaningmanager.app.data.api

import com.cleaningmanager.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

// ⚠️ UPDATE THIS TO YOUR DEPLOYED BACKEND URL
const val BASE_URL = "https://your-app.vercel.app"
// For local testing, use: "http://192.168.1.3:3000"

interface ApiService {
    // Authentication
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @GET("api/auth/me")
    suspend fun getCurrentUser(): Response<AuthResponse>
    
    @POST("api/auth/logout")
    suspend fun logout(): Response<Unit>
    
    // Shifts
    @GET("api/shifts")
    suspend fun getShifts(
        @Query("month") month: String? = null,
        @Query("excludeCompleted") excludeCompleted: Boolean? = null
    ): Response<ShiftsResponse>
    
    @GET("api/shifts/{id}")
    suspend fun getShift(@Path("id") id: String): Response<ShiftResponse>
    
    @POST("api/shifts")
    suspend fun createShift(@Body request: CreateShiftRequest): Response<ShiftResponse>
    
    // Notifications
    @GET("api/notifications")
    suspend fun getNotifications(): Response<NotificationsResponse>
    
    @PATCH("api/notifications")
    suspend fun markNotificationsAsRead(@Body request: MarkReadRequest): Response<Unit>
    
    // Apartments
    @GET("api/apartments")
    suspend fun getApartments(): Response<ApartmentsResponse>
    
    // Users
    @GET("api/users")
    suspend fun getUsers(@Query("role") role: String? = null): Response<UsersResponse>
}

data class UsersResponse(
    val users: List<User>
)


