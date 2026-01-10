// screens/AssessmentsScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AssessmentsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header Section - Matching HomeScreen */}
      <View style={styles.headerSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack('Login')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Select Infrastructure</Text>
          <Text style={styles.welcomeText}>Type</Text>
          <Text style={styles.welcomeSubtext}>Choose what you are assessing</Text>
        </View>
      </View>

      {/* Cards Section */}
      <View style={styles.cardsContainer}>
        {/* Building Card */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AssessmentForm', { type: 'BUILDING' }, { key: 'building-form' })
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#9013CF', '#E82B96']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card]}
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="business-outline" size={28} color="white" />
            </View>
            <Text style={styles.cardText}>Building</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bridge Card */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AssessmentForm', { type: 'BRIDGE' }, { key: 'bridge-form' })
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#9013CF', '#E82B96']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card]}
          >
            <View style={styles.cardIconContainer}>
              <MaterialCommunityIcons name="bridge" size={28} color="white" />
            </View>
            <Text style={styles.cardText}>Bridge</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* My Assessments Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('MyAssessments')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#D81E5B', '#F0544F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { justifyContent: 'center' }]}
          >
            <Text style={styles.cardText}>My Assessments</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
  },
  headerSection: {
    backgroundColor: '#3E2748',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  profileButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContent: {
    marginTop: 50,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 6,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    padding: 20,
    borderRadius: 25,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
});
