// screens/AssessmentForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AssessmentForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params; // 'BUILDING' or 'BRIDGE'

  const [infrastructureName, setInfrastructureName] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [formData, setFormData] = useState({});

  const getValue = (field) => formData[field] ?? '';
  const [currentDraftId, setCurrentDraftId] = useState(null);

  const resetForm = () => {
    setInfrastructureName('');
    setFormData({
      // Building fields
      buildingHeight: '',
      exitCount: '',
      foundationType: '',
      fireRating: '',
      // Bridge fields
      spanLength: '',
      trafficLanes: '',
      designSpeed: '',
      designLoad: ''
    });
  };

  // Auto-capture GPS on load
  /* useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setGpsCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []); */
  useEffect(() => {
  const { draft } = route.params || {};

  // If draft has GPS, use it and skip location request
  if (draft?.gpsCoordinates) {
    setGpsCoordinates(draft.gpsCoordinates);
    return;
  }

  // Otherwise, request location
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setGpsCoordinates({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  })();
}, [route.params?.draft]); // Only re-run if draft changes

 /* useFocusEffect(
  useCallback(() => {
    const { draft } = route.params || {};
    if (draft) {
      // Load draft data
      setInfrastructureName(draft.infrastructureName || '');
      setGpsCoordinates(draft.gpsCoordinates || null);
      setFormData(draft.parameters || {});
    } else {
      resetForm();
    }
  }, [type, route.params?.draft])
);
 */

useFocusEffect(
  useCallback(() => {
    const { draft } = route.params || {};

    if (draft) {
      // Pre-fill form with draft data
      setInfrastructureName(draft.infrastructureName || '');
      setGpsCoordinates(draft.gpsCoordinates || null);
      setFormData(draft.parameters || {});
      setCurrentDraftId(draft.id); // 👈 Store ID

    } else {
      // Fresh form
      resetForm();
      setCurrentDraftId(null);
    }
  }, [route.params?.draft]) // Re-run only when draft changes
);

  // Handle input changes
  const handleInputChange = (field, value) => {
    const safeValue = value ?? '';
    setFormData(prev => ({ ...prev, [field]: safeValue }));
  };

  // Save as draft (offline)
  const saveDraft = async () => {
    const draft = {
      id: Date.now().toString(),
      infrastructureType: type,
      infrastructureName,
      gpsCoordinates,
      parameters: formData,
      createdAt: new Date().getTime(),
      synced: false,
    };

    try {
      const drafts = await AsyncStorage.getItem('drafts');
      const draftList = drafts ? JSON.parse(drafts) : [];
      draftList.push(draft);
      await AsyncStorage.setItem('drafts', JSON.stringify(draftList));
      Alert.alert('Success', 'Draft saved offline!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save draft.');
    }
  };

  // Submit to backend (online)
  const submitAssessment = async () => {
  if (!infrastructureName || !gpsCoordinates) {
    Alert.alert('Error', 'Name and GPS are required.');
    return;
  }

  const token = await AsyncStorage.getItem('token');
  if (!token) {
    Alert.alert('Error', 'Not logged in. Please log in again.');
    return;
  }

  const assessmentData = {
    draftId: currentDraftId || Date.now().toString(), // Use existing ID if available
    infrastructureId: '68f000000000000000000001',
    infrastructureName,
    type,
    gpsCoordinates,
    safety: type === 'BUILDING' 
      ? { fireRating: formData.fireRating ? parseFloat(formData.fireRating) : 2 }
      : { spanLength: parseFloat(formData.spanLength) || 0 },
    structure: type === 'BUILDING'
      ? {
          buildingHeight: parseFloat(formData.buildingHeight) || 0,
          exitCount: parseInt(formData.exitCount) || 0,
          foundationType: formData.foundationType || 'Concrete'
        }
      : {
          trafficLanes: parseInt(formData.trafficLanes) || 0,
          designSpeed: parseFloat(formData.designSpeed) || 0,
          designLoad: parseFloat(formData.designLoad) || 0
        }
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(assessmentData)
    });

    const data = await response.json();
    if (response.ok) {
      // ✅ SUCCESS: Now delete the draft if it existed
      if (currentDraftId) {
        try {
          const draftsStr = await AsyncStorage.getItem('drafts');
          let draftList = draftsStr ? JSON.parse(draftsStr) : [];
          draftList = draftList.filter(draft => draft.id !== currentDraftId);
          await AsyncStorage.setItem('drafts', JSON.stringify(draftList));
        } catch (err) {
          console.warn('Failed to delete draft after submit:', err);
          // Even if cleanup fails, we still succeeded in submitting
        }
      }

      Alert.alert('Success', 'Assessment submitted!');
      navigation.navigate('Compliance', {
        screen: 'ComplianceCheck',
        params: { assessmentId: data._id }
      });
    } else {
      Alert.alert('Error', data.error || 'Submission failed.');
    }
  } catch (error) {
    console.error('Submission error:', error);
    Alert.alert('Network Error', 'Check your connection and IP.');
  }
};

  return (
    <View style={styles.container}>
      {/* Header Section - Matching AssessmentsScreen */}
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
          <Text style={styles.welcomeText}>{type === 'BUILDING' ? 'Building' : 'Bridge'}</Text>
          <Text style={styles.welcomeSubtext}>{type} Assessment Form</Text>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>{type} Assessment</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Infrastructure Name</Text>
            <TextInput
              placeholder="Enter name"
              value={infrastructureName}
              onChangeText={setInfrastructureName}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {gpsCoordinates ? (
            <View style={styles.gpsBox}>
              <View style={styles.gpsHeader}>
                <Ionicons name="location" size={20} color="#3E2748" />
                <Text style={styles.gpsLabel}>GPS Location</Text>
              </View>
              <Text style={styles.gpsText}>
                {gpsCoordinates.latitude.toFixed(4)}° N, {gpsCoordinates.longitude.toFixed(4)}° W
              </Text>
            </View>
          ) : (
            <View style={styles.gpsLoading}>
              <Ionicons name="locate-outline" size={20} color="#999" />
              <Text style={styles.gpsLoadingText}>Getting GPS location...</Text>
            </View>
          )}

          {/* Dynamic form fields */}
          {type === 'BUILDING' ? (
            <>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Fire Rating</Text>
                <TextInput
                  placeholder="Enter fire rating (1-5)"
                  value={formData.fireRating}
                  onChangeText={(v) => handleInputChange('fireRating', v)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Exit Count</Text>
                <TextInput
                  placeholder="Number of exits"
                  value={formData.exitCount}
                  onChangeText={(v) => handleInputChange('exitCount', v)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Building Height (m)</Text>
                <TextInput
                  placeholder="Height in meters"
                  value={formData.buildingHeight}
                  onChangeText={(v) => handleInputChange('buildingHeight', v)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Foundation Type</Text>
                <TextInput
                  placeholder="e.g., Concrete, Steel"
                  value={formData.foundationType}
                  onChangeText={(v) => handleInputChange('foundationType', v)}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Span Length (m)</Text>
                <TextInput
                  placeholder="Length in meters"
                  value={formData.spanLength}
                  onChangeText={(v) => handleInputChange('spanLength', v)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Traffic Lanes</Text>
                <TextInput
                  placeholder="Number of lanes"
                  value={formData.trafficLanes}
                  onChangeText={(v) => handleInputChange('trafficLanes', v)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Design Speed (km/h)</Text>
                <TextInput
                  placeholder="Speed in km/h"
                  value={formData.designSpeed}
                  onChangeText={(v) => handleInputChange('designSpeed', v)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Design Load (tons)</Text>
                <TextInput
                  placeholder="Load in tons"
                  value={formData.designLoad}
                  onChangeText={(v) => handleInputChange('designLoad', v)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.draftButton}
            onPress={saveDraft}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D81E5B', '#F0544F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Save Draft</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitAssessment}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D81E5B', '#F0544F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3E2748',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E2748',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FE',
    fontSize: 16,
    color: '#333',
  },
  gpsBox: {
    backgroundColor: '#F0F4FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3E2748',
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gpsLabel: {
    fontWeight: 'bold',
    color: '#3E2748',
    fontSize: 16,
    marginLeft: 8,
  },
  gpsText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 28,
  },
  gpsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  gpsLoadingText: {
    fontStyle: 'italic',
    color: '#999',
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButton: {
    flex: 1,
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