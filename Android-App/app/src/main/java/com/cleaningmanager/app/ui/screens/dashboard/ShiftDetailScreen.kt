package com.cleaningmanager.app.ui.screens.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.cleaningmanager.app.data.api.RetrofitClient
import com.cleaningmanager.app.data.models.Shift
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShiftDetailScreen(shiftId: String, navController: NavController) {
    var shift by remember { mutableStateOf<Shift?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    LaunchedEffect(shiftId) {
        isLoading = true
        try {
            val response = RetrofitClient.apiService.getShift(shiftId)
            if (response.isSuccessful) {
                shift = response.body()?.shift
            } else {
                errorMessage = "Failed to load shift"
            }
        } catch (e: Exception) {
            errorMessage = e.message
        } finally {
            isLoading = false
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Shift Details") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> {
                Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = androidx.compose.ui.Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            errorMessage != null -> {
                Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = androidx.compose.ui.Alignment.Center) {
                    Text("Error: $errorMessage", color = MaterialTheme.colorScheme.error)
                }
            }
            shift != null -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    InfoCard(title = "Apartment") {
                        Text(shift!!.apartment.name, style = MaterialTheme.typography.titleMedium)
                        Text(shift!!.apartment.address, style = MaterialTheme.typography.bodyMedium)
                    }
                    
                    InfoCard(title = "Operator") {
                        Text(shift!!.cleaner.name, style = MaterialTheme.typography.titleMedium)
                        Text(shift!!.cleaner.email, style = MaterialTheme.typography.bodyMedium)
                    }
                    
                    InfoCard(title = "Schedule") {
                        Text("Date: ${formatDate(shift!!.scheduledDate)}")
                        Text("Start: ${formatTime(shift!!.scheduledStartTime)}")
                        shift!!.scheduledEndTime?.let {
                            Text("End: ${formatTime(it)}")
                        }
                    }
                    
                    InfoCard(title = "Status") {
                        StatusChip(status = shift!!.status)
                    }
                    
                    shift!!.notes?.let {
                        InfoCard(title = "Notes") {
                            Text(it)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun InfoCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(title, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
            content()
        }
    }
}

@Composable
fun StatusChip(status: com.cleaningmanager.app.data.models.ShiftStatus) {
    val (color, text) = when (status) {
        com.cleaningmanager.app.data.models.ShiftStatus.scheduled -> MaterialTheme.colorScheme.tertiary to "Scheduled"
        com.cleaningmanager.app.data.models.ShiftStatus.in_progress -> MaterialTheme.colorScheme.primary to "In Progress"
        com.cleaningmanager.app.data.models.ShiftStatus.completed -> MaterialTheme.colorScheme.primaryContainer to "Completed"
        com.cleaningmanager.app.data.models.ShiftStatus.cancelled -> MaterialTheme.colorScheme.error to "Cancelled"
    }
    
    Surface(color = color, shape = MaterialTheme.shapes.small) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelMedium
        )
    }
}

fun formatDate(dateString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
        val date = inputFormat.parse(dateString)
        outputFormat.format(date ?: Date())
    } catch (e: Exception) {
        dateString
    }
}

fun formatTime(timeString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        val outputFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())
        val date = inputFormat.parse(timeString)
        outputFormat.format(date ?: Date())
    } catch (e: Exception) {
        timeString
    }
}


