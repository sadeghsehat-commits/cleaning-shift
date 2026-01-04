package com.cleaningmanager.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cleaningmanager.app.data.api.RetrofitClient
import com.cleaningmanager.app.data.models.AppNotification
import com.cleaningmanager.app.data.models.MarkReadRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NotificationsViewModel : ViewModel() {
    private val apiService = RetrofitClient.apiService
    
    private val _notifications = MutableStateFlow<List<AppNotification>>(emptyList())
    val notifications: StateFlow<List<AppNotification>> = _notifications.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    val unreadCount: Int
        get() = _notifications.value.count { !it.read }
    
    fun loadNotifications() {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = apiService.getNotifications()
                if (response.isSuccessful) {
                    response.body()?.let {
                        _notifications.value = it.notifications
                    }
                } else {
                    _errorMessage.value = "Failed to load notifications"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun markAsRead(ids: List<String>) {
        viewModelScope.launch {
            try {
                val response = apiService.markNotificationsAsRead(MarkReadRequest(ids, true))
                if (response.isSuccessful) {
                    loadNotifications()
                }
            } catch (e: Exception) {
                // Handle error silently
            }
        }
    }
}


