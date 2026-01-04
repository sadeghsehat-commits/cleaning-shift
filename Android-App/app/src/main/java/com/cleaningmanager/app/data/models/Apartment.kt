package com.cleaningmanager.app.data.models

import com.google.gson.annotations.SerializedName

data class Apartment(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val address: String,
    val street: String? = null,
    val city: String? = null,
    val postalCode: String? = null,
    val country: String? = null,
    val owner: OwnerInfo,
    val description: String? = null
)

data class OwnerInfo(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val email: String,
    val phone: String? = null
)

data class ApartmentsResponse(
    val apartments: List<Apartment>
)


