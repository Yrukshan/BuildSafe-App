// screens/AssessmentDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AssessmentDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessmentId } = route.params;

  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Not logged in. Please log in again.');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAssessment(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load assessment.');
    }
  };

  if (!assessment) {
    return (
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
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
            <Text style={styles.welcomeText}>Assessment Details</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D81E5B" />
          <Text style={styles.loadingText}>Loading assessment...</Text>
        </View>
      </View>
    );
  }

  const renderDetailItem = (icon, label, value) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={20} color="#9013CF" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
          <Text style={styles.welcomeText}>Assessment Details</Text>
          <Text style={styles.welcomeSubtext}>{assessment.type}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleIconCircle}>
            <Ionicons 
              name={assessment.type === 'BUILDING' ? 'business' : 'git-network'} 
              size={40} 
              color="#9013CF" 
            />
          </View>
          <Text style={styles.title}>{assessment.infrastructureName}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{assessment.type}</Text>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color="#D81E5B" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Latitude:</Text>
              <Text style={styles.locationValue}>
                {assessment.gpsCoordinates?.latitude?.toFixed(6) || 'N/A'}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Longitude:</Text>
              <Text style={styles.locationValue}>
                {assessment.gpsCoordinates?.longitude?.toFixed(6) || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Structure Section */}
        {assessment.structure && Object.keys(assessment.structure).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="office-building" size={24} color="#D81E5B" />
              <Text style={styles.sectionTitle}>Structure Details</Text>
            </View>
            <View style={styles.detailsCard}>
              {Object.keys(assessment.structure).map((key, index) => (
                <View key={key}>
                  {renderDetailItem(
                    'cube-outline',
                    key.replace(/([A-Z])/g, ' $1').trim(),
                    assessment.structure[key]?.toString()
                  )}
                  {index < Object.keys(assessment.structure).length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Safety Section */}
        {assessment.safety && Object.keys(assessment.safety).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#D81E5B" />
              <Text style={styles.sectionTitle}>Safety Information</Text>
            </View>
            <View style={styles.detailsCard}>
              {Object.keys(assessment.safety).map((key, index) => (
                <View key={key}>
                  {renderDetailItem(
                    'shield-outline',
                    key.replace(/([A-Z])/g, ' $1').trim(),
                    assessment.safety[key]?.toString()
                  )}
                  {index < Object.keys(assessment.safety).length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButtonBottom}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#9013CF', '#E82B96']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.buttonText}>Back to List</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  titleIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 12,
    textAlign: 'center',
  },
  typeBadge: {
    backgroundColor: '#9013CF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginLeft: 8,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  locationValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  backButtonBottom: {
    marginTop: 12,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});