package com.cleaningmanager.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cleaningmanager.app.data.api.RetrofitClient
import com.cleaningmanager.app.data.models.AuthResponse
import com.cleaningmanager.app.data.models.LoginRequest
import com.cleaningmanager.app.data.models.RegisterRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val apiService = RetrofitClient.apiService
    
    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()
    
    private val _currentUser = MutableStateFlow<com.cleaningmanager.app.data.models.User?>(null)
    val currentUser: StateFlow<com.cleaningmanager.app.data.models.User?> = _currentUser.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    init {
        checkAuthStatus()
    }
    
    fun checkAuthStatus() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.getCurrentUser()
                if (response.isSuccessful) {
                    response.body()?.let {
                        _currentUser.value = it.user
                        _isAuthenticated.value = true
                    }
                } else {
                    _isAuthenticated.value = false
                }
            } catch (e: Exception) {
                _isAuthenticated.value = false
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = apiService.login(LoginRequest(email, password))
                if (response.isSuccessful) {
                    response.body()?.let {
                        _currentUser.value = it.user
                        _isAuthenticated.value = true
                    }
                } else {
                    _errorMessage.value = response.errorBody()?.string() ?: "Login failed"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun register(request: RegisterRequest) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = apiService.register(request)
                if (response.isSuccessful) {
                    response.body()?.let {
                        _currentUser.value = it.user
                        _isAuthenticated.value = true
                    }
                } else {
                    _errorMessage.value = response.errorBody()?.string() ?: "Registration failed"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            try {
                apiService.logout()
            } catch (e: Exception) {
                // Ignore logout errors
            }
            _currentUser.value = null
            _isAuthenticated.value = false
        }
    }
}


