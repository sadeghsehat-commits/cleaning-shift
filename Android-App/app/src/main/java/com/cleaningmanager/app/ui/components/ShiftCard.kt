package com.cleaningmanager.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.cleaningmanager.app.data.models.Shift
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ShiftCard(shift: Shift, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = shift.apartment.name,
                    style = MaterialTheme.typography.titleMedium
                )
                StatusChip(status = shift.status)
            }
            
            Text(
                text = shift.apartment.address,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "📅 ${formatDate(shift.scheduledDate)}",
                    style = MaterialTheme.typography.bodySmall
                )
                Text(
                    text = "🕐 ${formatTime(shift.scheduledStartTime)}",
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            Text(
                text = "Operator: ${shift.cleaner.name}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
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
            style = MaterialTheme.typography.labelSmall
        )
    }
}

fun formatDate(dateString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        val outputFormat = SimpleDateFormat("MMM dd", Locale.getDefault())
        val date = inputFormat.parse(dateString)
        outputFormat.format(date ?: Date())
    } catch (e: Exception) {
        dateString.substring(0, 10)
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


