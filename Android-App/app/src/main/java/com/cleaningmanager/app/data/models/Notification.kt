package com.cleaningmanager.app.data.models

import com.google.gson.annotations.SerializedName

data class AppNotification(
    @SerializedName("_id")
    val id: String,
    val type: String,
    val title: String,
    val message: String,
    val read: Boolean,
    val createdAt: String,
    val relatedShift: String? = null,
    val shiftDetails: ShiftDetails? = null,
    val timeChangeDetails: TimeChangeDetails? = null
)

data class ShiftDetails(
    val apartmentName: String,
    val apartmentAddress: String,
    val scheduledDate: String,
    val scheduledStartTime: String,
    val scheduledEndTime: String? = null,
    val confirmed: Boolean
)

data class TimeChangeDetails(
    val newStartTime: String,
    val newEndTime: String? = null,
    val reason: String? = null,
    val operatorConfirmed: Boolean
)

data class NotificationsResponse(
    val notifications: List<AppNotification>
)

data class MarkReadRequest(
    val notificationIds: List<String>,
    val read: Boolean
)


