// screens/AssessmentEditScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AssessmentEditScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessmentId } = route.params;

  const [infrastructureName, setInfrastructureName] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState({ latitude: '', longitude: '' });
  const [formData, setFormData] = useState({});

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
        'Authorization': `Bearer ${token}` // ✅ Add this
      }
    });
      const data = await response.json();
      if (response.ok) {
        setInfrastructureName(data.infrastructureName);
        setGpsCoordinates(data.gpsCoordinates || { latitude: '', longitude: '' });
        setFormData({
          ...data.structure,
          ...data.safety
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load assessment.');
    }
  };

  const updateAssessment = async () => {
    const updatedData = {
      infrastructureName,
      gpsCoordinates,
      structure: {
        buildingHeight: formData.buildingHeight || 0,
        exitCount: formData.exitCount || 0,
        foundationType: formData.foundationType || 'Concrete'
      },
      safety: {
        fireRating: formData.fireRating || 2
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Assessment updated!');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error || 'Update failed.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Check your connection.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Assessment</Text>

      <TextInput
        placeholder="Infrastructure Name"
        value={infrastructureName}
        onChangeText={setInfrastructureName}
        style={styles.input}
      />

      <TextInput
        placeholder="Latitude"
        value={gpsCoordinates.latitude}
        onChangeText={(v) => setGpsCoordinates(prev => ({ ...prev, latitude: v }))}
        style={styles.input}
      />

      <TextInput
        placeholder="Longitude"
        value={gpsCoordinates.longitude}
        onChangeText={(v) => setGpsCoordinates(prev => ({ ...prev, longitude: v }))}
        style={styles.input}
      />

      <TextInput
        placeholder="Building Height (m)"
        value={formData.buildingHeight}
        onChangeText={(v) => setFormData(prev => ({ ...prev, buildingHeight: v }))}
        style={styles.input}
      />

      <TextInput
        placeholder="Exit Count"
        value={formData.exitCount}
        onChangeText={(v) => setFormData(prev => ({ ...prev, exitCount: v }))}
        style={styles.input}
      />

      <TextInput
        placeholder="Foundation Type"
        value={formData.foundationType}
        onChangeText={(v) => setFormData(prev => ({ ...prev, foundationType: v }))}
        style={styles.input}
      />

      <TextInput
        placeholder="Fire Rating (1-5)"
        value={formData.fireRating}
        onChangeText={(v) => setFormData(prev => ({ ...prev, fireRating: v }))}
        style={styles.input}
      />

      <Button
        title="Save Changes"
        onPress={updateAssessment}
        color="#D81E5B"
      />

      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        color="#331832"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FDF0D5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#331832',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderColor: '#C6D8D3',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
});