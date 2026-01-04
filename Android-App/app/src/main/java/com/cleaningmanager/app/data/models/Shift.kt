package com.cleaningmanager.app.data.models

import com.google.gson.annotations.SerializedName

data class Shift(
    @SerializedName("_id")
    val id: String,
    val apartment: ApartmentInfo,
    val cleaner: CleanerInfo,
    val scheduledDate: String,
    val scheduledStartTime: String,
    val scheduledEndTime: String? = null,
    val actualStartTime: String? = null,
    val actualEndTime: String? = null,
    val status: ShiftStatus,
    val notes: String? = null,
    val confirmedSeen: ConfirmedSeen? = null,
    val timeChangeRequest: TimeChangeRequest? = null
)

enum class ShiftStatus {
    scheduled,
    @SerializedName("in_progress")
    in_progress,
    completed,
    cancelled
}

data class ApartmentInfo(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val address: String
)

data class CleanerInfo(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val email: String
)

data class ConfirmedSeen(
    val confirmed: Boolean,
    val confirmedAt: String? = null
)

data class TimeChangeRequest(
    val requestedBy: String,
    val newStartTime: String? = null,
    val newEndTime: String? = null,
    val reason: String? = null,
    val status: String,
    val operatorConfirmed: Boolean? = null
)

data class ShiftsResponse(
    val shifts: List<Shift>
)

data class ShiftResponse(
    val shift: Shift
)

data class CreateShiftRequest(
    val apartment: String,
    val cleaner: String,
    val scheduledDate: String,
    val scheduledStartTime: String,
    val scheduledEndTime: String? = null,
    val notes: String? = null
)


