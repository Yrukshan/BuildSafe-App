import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';


// Import main tab screens
import HomeScreen from './HomeScreen';
import AssessmentsScreen from './AssessmentsScreen';
import ComplianceScreen from './ComplianceScreen';
import RiskScreen from './RiskScreen';
import RiskIntroScreen from './RiskIntroScreen';
import AISuggestionsScreen from './AISuggestionsScreen';
import HistoryScreen from './HistoryScreen'; // ⬅️ ADD THIS

import AdminScreen from './AdminScreen';
import AIIntroScreen from './AIIntroScreen'
// Import child screens
import AssessmentForm from './AssessmentForm';
import MyAssessmentsScreen from './MyAssessmentsScreen';
import AssessmentDetailScreen from './AssessmentDetailScreen';
import AssessmentEditScreen from './AssessmentEditScreen';
import ComplianceCheckScreen from './ComplianceCheckScreen';
 // History screens
import AllComplianceScreen from './AllComplianceScreen';
import AllRiskScoresScreen from './AllRiskScoresScreen';
import AllRecommendationsScreen from './AllRecommendationsScreen';


// Create stack navigators
const HomeStack = createStackNavigator();
const AssessmentsStack = createStackNavigator();
const ComplianceStack = createStackNavigator();
const RiskStack = createStackNavigator();
const AIStack = createStackNavigator();
const AdminStack = createStackNavigator();
const HistoryStack = createStackNavigator(); // ⬅️ ADD THIS


// Home Tab
function HomeTab() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

// Assessments Tab
function AssessmentsTab() {
  return (
    <AssessmentsStack.Navigator screenOptions={{ headerShown: false }}>
      <AssessmentsStack.Screen name="AssessmentsMain" component={AssessmentsScreen} />
      <AssessmentsStack.Screen name="MyAssessments" component={MyAssessmentsScreen} />
      <AssessmentsStack.Screen name="AssessmentForm" component={AssessmentForm} />
      <AssessmentsStack.Screen name="AssessmentDetail" component={AssessmentDetailScreen} />
      <AssessmentsStack.Screen name="AssessmentEdit" component={AssessmentEditScreen} />
    </AssessmentsStack.Navigator>
  );
}

// Compliance Tab
function ComplianceTab() {
  return (
    <ComplianceStack.Navigator screenOptions={{ headerShown: false }}>
      <ComplianceStack.Screen name="ComplianceMain" component={ComplianceScreen} />
      <ComplianceStack.Screen name="ComplianceCheck" component={ComplianceCheckScreen} />
    </ComplianceStack.Navigator>
  );
}

// Risk Tab
function RiskTab() {
  return (
    <RiskStack.Navigator screenOptions={{ headerShown: false }}>
      <RiskStack.Screen name="RiskMain" component={RiskIntroScreen} />
      <RiskStack.Screen name="RiskCheck" component={RiskScreen} />
    </RiskStack.Navigator>
  );
}

// AI Tab
function AITab() {
  return (
    <AIStack.Navigator screenOptions={{ headerShown: false }}>
      <AIStack.Screen name="AIMain" component={AIIntroScreen} />
      <AIStack.Screen name="AIRecommendations" component={AISuggestionsScreen} />
    </AIStack.Navigator>
  );
}

function HistoryTab() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryMain" component={HistoryScreen} />
      <HistoryStack.Screen name="AllCompliance" component={AllComplianceScreen} />
      <HistoryStack.Screen name="AllRisk" component={AllRiskScoresScreen} />
      <HistoryStack.Screen name="AllRecommendations" component={AllRecommendationsScreen} />
    </HistoryStack.Navigator>
  );
}

// Admin Tab
function AdminTab() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminMain" component={AdminScreen} />
    </AdminStack.Navigator>
  );
}

// ✅ Custom Tab Bar Icon Component (using Ionicons now)
const TabIcon = ({ iconName, focused }) => {
  const getBgColor = () => {
    return focused ? 'rgba(255, 255, 255, 0.2)' : '#331832';
  };

  return (
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: getBgColor() },
        focused && styles.iconContainerFocused,
      ]}
    >
      <Ionicons
        name={iconName}
        size={26}
        color={focused ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );
};

// Main Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const loadRole = async () => {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role || 'user');
    };
    loadRole();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // ✅ This removes the screen name at the top
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === 'Assessments') iconName = focused ? 'clipboard' : 'clipboard-outline';
          else if (route.name === 'Compliance') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          else if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Risk') iconName = focused ? 'warning' : 'warning-outline';
          else if (route.name === 'AI') iconName = focused ? 'sparkles' : 'sparkles-outline';
          else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline'; // ⬅️ ADD THIS
           else if (route.name === 'Admin') iconName = focused ? 'settings' : 'settings-outline';

          return <TabIcon iconName={iconName} focused={focused} />;
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen name="Assessments" component={AssessmentsTab} />
      <Tab.Screen name="Compliance" component={ComplianceTab} />
      <Tab.Screen name="Home" component={HomeTab} />
      <Tab.Screen name="Risk" component={RiskTab} />
      <Tab.Screen name="AI" component={AITab} />
      <Tab.Screen name="History" component={HistoryTab} />
      {userRole === 'admin' && (
        <Tab.Screen name="Admin" component={AdminTab} />
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#331832',
    height: 75,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  tabBarItem: {
    paddingVertical: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconContainerFocused: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});