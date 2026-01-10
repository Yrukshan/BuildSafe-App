// screens/MyAssessmentsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyAssessmentsScreen() {
  const navigation = useNavigation();
  const [assessments, setAssessments] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllAssessments();
  }, []);

  const loadAllAssessments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      let onlineAssessments = [];
      let drafts = [];

      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/assessments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          onlineAssessments = (data.assessments || []).map(a => ({ ...a, status: 'submitted' }));
        }
      }

      const draftsStr = await AsyncStorage.getItem('drafts');
      drafts = draftsStr ? JSON.parse(draftsStr).map(d => ({
        ...d,
        _id: d.id,
        status: 'draft',
        infrastructureName: d.infrastructureName,
        type: d.infrastructureType,
        gpsCoordinates: d.gpsCoordinates
      })) : [];

      setAssessments([...onlineAssessments, ...drafts]);
    } catch (error) {
      console.error('Failed to load assessments or drafts:', error);
      Alert.alert('Error', 'Failed to load data.');
    }
  };

  const filteredAssessments = assessments.filter(item => {
    const matchesType = !filterType || item.type === filterType;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    const matchesSearch = !searchTerm ||
      item.infrastructureName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const viewAssessment = (item) => {
    if (item.status === 'draft') {
      navigation.navigate('AssessmentForm', {
        type: item.type,
        draft: item
      });
    } else {
      navigation.navigate('AssessmentDetail', { assessmentId: item._id });
    }
  };

  const deleteAssessment = async (item) => {
    Alert.alert(
      'Delete Assessment',
      `Are you sure you want to delete this ${item.status === 'draft' ? 'draft' : 'assessment'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (item.status === 'draft') {
                const draftsStr = await AsyncStorage.getItem('drafts');
                let drafts = draftsStr ? JSON.parse(draftsStr) : [];
                drafts = drafts.filter(d => d.id !== item.id);
                await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
              } else {
                const token = await AsyncStorage.getItem('token');
                await fetch(`${API_BASE_URL}/api/assessments/${item._id}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
              }
              setAssessments(prev => prev.filter(a => a._id !== item._id));
              Alert.alert('Success', 'Deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

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
          <Text style={styles.welcomeText}>My Assessments</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterButtonWrapper}
              onPress={() => setFilterType('')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={filterType === '' ? ['#D81E5B', '#F0544F'] : ['#E0E0E0', '#E0E0E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterButton}
              >
                <Text style={[styles.filterButtonText, filterType !== '' && styles.inactiveText]}>ALL</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButtonWrapper}
              onPress={() => setFilterStatus('')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={filterStatus === '' ? ['#D81E5B', '#F0544F'] : ['#E0E0E0', '#E0E0E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterButton}
              >
                <Text style={[styles.filterButtonText, filterStatus !== '' && styles.inactiveText]}>ALL Status</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterButtonWrapper}
              onPress={() => setFilterType('BUILDING')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={filterType === 'BUILDING' ? ['#D81E5B', '#F0544F'] : ['#E0E0E0', '#E0E0E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterButton}
              >
                <Text style={[styles.filterButtonText, filterType !== 'BUILDING' && styles.inactiveText]}>Building</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButtonWrapper}
              onPress={() => setFilterType('BRIDGE')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={filterType === 'BRIDGE' ? ['#D81E5B', '#F0544F'] : ['#E0E0E0', '#E0E0E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterButton}
              >
                <Text style={[styles.filterButtonText, filterType !== 'BRIDGE' && styles.inactiveText]}>Bridge</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterButtonWrapper}
              onPress={() => setFilterStatus('submitted')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={filterStatus === 'submitted' ? ['#D81E5B', '#F0544F'] : ['#E0E0E0', '#E0E0E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterButton}
              >
                <Text style={[styles.filterButtonText, filterStatus !== 'submitted' && styles.inactiveText]}>Submitted</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButtonWrapper}
              onPress={() => setFilterStatus('draft')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={filterStatus === 'draft' ? ['#D81E5B', '#F0544F'] : ['#E0E0E0', '#E0E0E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterButton}
              >
                <Text style={[styles.filterButtonText, filterStatus !== 'draft' && styles.inactiveText]}>Drafts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assessment Cards */}
        <FlatList
          data={filteredAssessments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => viewAssessment(item)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.infrastructureName || 'Untitled'}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'draft' ? '#E63946' : '#E63946' }
                ]}>
                  <Text style={styles.statusText}>
                    {item.status === 'draft' ? 'DRAFT' : 'SUBMITTED'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type:</Text>
                  <Text style={styles.infoValue}>{item.type}</Text>
                </View>

                {item.gpsCoordinates && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>GPS:</Text>
                    <Text style={styles.infoValue}>
                      {item.gpsCoordinates.latitude.toFixed(4)}° N, {item.gpsCoordinates.longitude.toFixed(4)}° W
                    </Text>
                  </View>
                )}

                {item.createdAt && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteAssessment(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={24} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No assessments found</Text>
            </View>
          }
        />
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  filterButtonWrapper: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2D2D',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 50,
  },
  infoValue: {
    fontSize: 14,
    color: '#2D2D2D',
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});