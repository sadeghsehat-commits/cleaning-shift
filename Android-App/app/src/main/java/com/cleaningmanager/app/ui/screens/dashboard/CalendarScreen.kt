package com.cleaningmanager.app.ui.screens.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.cleaningmanager.app.ui.components.ShiftCard
import com.cleaningmanager.app.ui.viewmodel.ShiftsViewModel
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen(navController: NavController) {
    val viewModel: ShiftsViewModel = viewModel()
    val shifts by viewModel.shifts.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val selectedDate = remember { mutableStateOf(Date()) }
    
    val monthString = viewModel.getMonthString(selectedDate.value)
    val filteredShifts = viewModel.getShiftsForDate(selectedDate.value)
    
    LaunchedEffect(monthString) {
        viewModel.loadShifts(monthString)
    }
    
    Column(modifier = Modifier.fillMaxSize()) {
        // Date Picker
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Select Date", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))
                // Simple date display - you can add a date picker library here
                Text(
                    text = android.text.format.DateFormat.format("MMMM dd, yyyy", selectedDate.value).toString(),
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        }
        
        // Shifts for selected date
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredShifts) { shift ->
                    ShiftCard(
                        shift = shift,
                        onClick = { navController.navigate("shift_detail/${shift.id}") }
                    )
                }
                
                if (filteredShifts.isEmpty()) {
                    item {
                        Text(
                            text = "No shifts for this date",
                            modifier = Modifier.padding(16.dp),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }
    }
}


