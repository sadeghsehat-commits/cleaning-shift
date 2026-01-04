package com.cleaningmanager.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.cleaningmanager.app.ui.screens.auth.LoginScreen
import com.cleaningmanager.app.ui.screens.auth.RegisterScreen
import com.cleaningmanager.app.ui.screens.dashboard.CalendarScreen
import com.cleaningmanager.app.ui.screens.dashboard.DashboardScreen
import com.cleaningmanager.app.ui.screens.dashboard.NotificationsScreen
import com.cleaningmanager.app.ui.screens.dashboard.ProfileScreen
import com.cleaningmanager.app.ui.screens.dashboard.ShiftsScreen
import com.cleaningmanager.app.ui.screens.dashboard.ShiftDetailScreen
import com.cleaningmanager.app.ui.viewmodel.AuthViewModel

@Composable
fun AppNavigation(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    authViewModel: AuthViewModel = viewModel()
) {
    NavHost(
        navController = navController,
        startDestination = if (authViewModel.isAuthenticated.value) "dashboard" else "login",
        modifier = modifier
    ) {
        composable("login") {
            LoginScreen(
                onLoginSuccess = { navController.navigate("dashboard") { popUpTo("login") } },
                onNavigateToRegister = { navController.navigate("register") }
            )
        }
        
        composable("register") {
            RegisterScreen(
                onRegisterSuccess = { navController.navigate("dashboard") { popUpTo("login") } },
                onNavigateToLogin = { navController.popBackStack() }
            )
        }
        
        composable("dashboard") {
            DashboardScreen(navController = navController)
        }
        
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
        
        composable("shift_detail/{shiftId}") { backStackEntry ->
            val shiftId = backStackEntry.arguments?.getString("shiftId") ?: ""
            ShiftDetailScreen(shiftId = shiftId, navController = navController)
        }
    }
}


