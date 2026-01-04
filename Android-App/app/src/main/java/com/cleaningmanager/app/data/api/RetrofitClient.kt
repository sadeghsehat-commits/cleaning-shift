package com.cleaningmanager.app.data.api

import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private val cookieJar = object : CookieJar {
        private val cookieStore = mutableMapOf<String, List<okhttp3.Cookie>>()
        
        override fun saveFromResponse(url: HttpUrl, cookies: List<okhttp3.Cookie>) {
            cookieStore[url.host] = cookies
        }
        
        override fun loadForRequest(url: HttpUrl): List<okhttp3.Cookie> {
            return cookieStore[url.host] ?: emptyList()
        }
    }
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .cookieJar(cookieJar)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}


