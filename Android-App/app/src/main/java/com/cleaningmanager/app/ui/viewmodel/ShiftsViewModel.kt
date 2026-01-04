package com.cleaningmanager.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cleaningmanager.app.data.api.RetrofitClient
import com.cleaningmanager.app.data.models.Shift
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class ShiftsViewModel : ViewModel() {
    private val apiService = RetrofitClient.apiService
    
    private val _shifts = MutableStateFlow<List<Shift>>(emptyList())
    val shifts: StateFlow<List<Shift>> = _shifts.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    fun loadShifts(month: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = apiService.getShifts(month = month)
                if (response.isSuccessful) {
                    response.body()?.let {
                        _shifts.value = it.shifts
                    }
                } else {
                    _errorMessage.value = "Failed to load shifts"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun getShiftsForDate(date: Date): List<Shift> {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val targetDate = dateFormat.format(date)
        
        return _shifts.value.filter { shift ->
            val shiftDate = shift.scheduledDate.substring(0, 10)
            shiftDate == targetDate
        }
    }
    
    fun getMonthString(date: Date): String {
        val format = SimpleDateFormat("yyyy-MM", Locale.getDefault())
        return format.format(date)
    }
}


