import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import CourseScreen from '../screens/main/CourseScreen';
import AddRecipeScreen from '../screens/main/AddRecipeScreen';
import SavedScreen from '../screens/main/SavedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import MyCoursesScreen from '../screens/main/MyCoursesScreen';
import CourseDetailScreen from '../screens/main/CourseDetailScreen';
import CourseEnrollmentScreen from '../screens/main/CourseEnrollmentScreen';
import QRScannerScreen from '../screens/main/QRScannerScreen';
import ServerConfigScreen from '../screens/main/ServerConfigScreen';

// Recipe Screens
import RecipeDetailScreen from '../screens/recipe/RecipeDetailScreen';
import RecipeSearchScreen from '../screens/recipe/RecipeSearchScreen';
import SavedScaledRecipesScreen from '../screens/recipe/SavedScaledRecipesScreen';

// Theme
import Colors from '../themes/colors';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const CourseStack = createStackNavigator();
const SavedStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    <HomeStack.Screen name="RecipeSearch" component={RecipeSearchScreen} />
  </HomeStack.Navigator>
);

const CourseStackScreen = () => (
  <CourseStack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <CourseStack.Screen name="Courses" component={CourseScreen} />
    <CourseStack.Screen name="CourseDetail" component={CourseDetailScreen} />
    <CourseStack.Screen name="CourseEnrollment" component={CourseEnrollmentScreen} />
    <CourseStack.Screen name="MyCourses" component={MyCoursesScreen} />
    <CourseStack.Screen name="QRScannerScreen" component={QRScannerScreen} />
  </CourseStack.Navigator>
);

const SavedStackScreen = () => (
  <SavedStack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <SavedStack.Screen name="Saved" component={SavedScreen} />
    <SavedStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    <SavedStack.Screen name="SavedScaledRecipes" component={SavedScaledRecipesScreen} />
  </SavedStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
    <ProfileStack.Screen name="MyCourses" component={MyCoursesScreen} />
    <ProfileStack.Screen name="SavedScaledRecipes" component={SavedScaledRecipesScreen} />
    <ProfileStack.Screen name="ServerConfig" component={ServerConfigScreen} />
  </ProfileStack.Navigator>
);

const AppNavigator = () => {
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

export default AppNavigator;