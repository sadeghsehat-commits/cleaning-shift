package com.cleaningmanager.app.ui.screens.dashboard

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(navController: NavController) {
    val bottomNavController = rememberNavController()
    val navBackStackEntry by bottomNavController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.CalendarToday, contentDescription = "Calendar") },
                    label = { Text("Calendar") },
                    selected = currentRoute == "calendar",
                    onClick = { bottomNavController.navigate("calendar") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.List, contentDescription = "Shifts") },
                    label = { Text("Shifts") },
                    selected = currentRoute == "shifts",
                    onClick = { bottomNavController.navigate("shifts") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Notifications, contentDescription = "Notifications") },
                    label = { Text("Notifications") },
                    selected = currentRoute == "notifications",
                    onClick = { bottomNavController.navigate("notifications") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                    label = { Text("Profile") },
                    selected = currentRoute == "profile",
                    onClick = { bottomNavController.navigate("profile") }
                )
            }
        }
    ) { padding ->
        NavHost(
            navController = bottomNavController,
            startDestination = "calendar",
            modifier = Modifier.padding(padding)
        ) {
            composable("calendar") {
                CalendarScreen(navController = navController)
            }
            composable("shifts") {
                ShiftsScreen(navController = navController)
            }
            composable("notifications") {
                NotificationsScreen()
            }
            composable("profile") {
                ProfileScreen()
            }
        }
    }
}


