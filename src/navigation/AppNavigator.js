import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { AuthContext } from '../context/AuthContext';

import HomeScreen from '../screens/main/HomeScreen';
import CourseScreen from '../screens/main/CourseScreen';
import AddRecipeScreen from '../screens/main/AddRecipeScreen';
import SavedScreen from '../screens/main/SavedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import MyCoursesScreen from '../screens/main/MyCoursesScreen';
import CourseDetailScreen from '../screens/main/CourseDetailScreen';
import CourseEnrollmentScreen from '../screens/main/CourseEnrollmentScreen';
import QRScannerScreen from '../screens/main/QRScannerScreen';

import MyRecipesScreen from '../screens/main/MyRecipesScreen';
import AccountSettingsScreen from '../screens/main/AccountSettingsScreen';
import AppSettingsScreen from '../screens/main/AppSettingsScreen';



import DatabaseTablesScreen from '../screens/main/DatabaseTablesScreen';
import AdminPanelScreen from '../screens/main/AdminPanelScreen';
import RecipeApprovalScreen from '../screens/main/RecipeApprovalScreen';
import RecipeDetailScreen from '../screens/recipe/RecipeDetailScreen';
import RecipeSearchScreen from '../screens/recipe/RecipeSearchScreen';
import SavedScaledRecipesScreen from '../screens/recipe/SavedScaledRecipesScreen';
import PendingRecipesScreen from '../screens/main/PendingRecipesScreen';
import UpgradeToStudentScreen from '../screens/main/UpgradeToStudentScreen';

import Colors from '../themes/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

//Navegador de Admin  
const AdminStackScreen = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="RecipeApproval" component={RecipeApprovalScreen} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
  </Stack.Navigator>
);

//Navegador de Usuario Regular
const HomeStackScreen = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    <Stack.Screen name="RecipeSearch" component={RecipeSearchScreen} />
    <Stack.Screen name="UpgradeToStudent" component={UpgradeToStudentScreen} />
  </Stack.Navigator>
);

const CourseStackScreen = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="Courses" component={CourseScreen} />
    <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    <Stack.Screen name="CourseEnrollment" component={CourseEnrollmentScreen} />
    <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
    <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
  </Stack.Navigator>
);

const SavedStackScreen = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="Saved" component={SavedScreen} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    <Stack.Screen name="SavedScaledRecipes" component={SavedScaledRecipesScreen} />
  </Stack.Navigator>
);

const ProfileStackScreen = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    <Stack.Screen name="MyRecipes" component={MyRecipesScreen} />
    <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
    <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
    <Stack.Screen name="SavedScaledRecipes" component={SavedScaledRecipesScreen} />
    <Stack.Screen name="PendingRecipes" component={PendingRecipesScreen} />
    <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
    <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    <Stack.Screen name="DatabaseTables" component={DatabaseTablesScreen} />
    <Stack.Screen name="UpgradeToStudent" component={UpgradeToStudentScreen} />
  </Stack.Navigator>
);

//Navegacion de Admin 
const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textDark,
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
      },
      headerShown: false,
    }}>
    <Tab.Screen
      name="PendingRecipes"
      component={AdminStackScreen}
      options={{
        tabBarLabel: 'Pendientes',
        tabBarIcon: ({ color, size }) => (
          <Icon name="clock" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="AllRecipes"
      component={HomeStackScreen}
      options={{
        tabBarLabel: 'Recetas',
        tabBarIcon: ({ color, size }) => (
          <Icon name="book-open" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="AdminProfile"
      component={ProfileStackScreen}
      options={{
        tabBarLabel: 'Perfil',
        tabBarIcon: ({ color, size }) => (
          <Icon name="user" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

//Navegacion de Usuario regular 
const UserNavigator = () => {
  const { user } = React.useContext(AuthContext);
  const isRegularUser = user && (user.tipo === 'comun' || user.accountType === 'user');

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDark,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CoursesTab"
        component={CourseStackScreen}
        options={{
          tabBarLabel: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddRecipeScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Icon name="plus-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStackScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bookmark" color={color} size={size} />
          ),
        }}
      />
      {isRegularUser && (
        <Tab.Screen
          name="UpgradeTab"
          component={UpgradeToStudentScreen}
          options={{
            tabBarLabel: 'Upgrade',
            tabBarIcon: ({ color, size }) => (
              <Icon name="graduation-cap" color={color} size={size} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isVisitor, user, isAdmin } = useContext(AuthContext);

  if (isVisitor) {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textDark,
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          },
          headerShown: false,
        }}>
        <Tab.Screen
          name="HomeTab"
          component={HomeStackScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackScreen}
          options={{
            tabBarLabel: 'Register',
            tabBarIcon: ({ color, size }) => (
              <Icon name="user-plus" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  if (user && (user.rol === 'admin' || user.tipo === 'empresa')) {
    return <AdminNavigator />;
  }

  return <UserNavigator />;
};

export default AppNavigator;