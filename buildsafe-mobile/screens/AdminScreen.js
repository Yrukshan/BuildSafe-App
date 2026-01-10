// screens/AdminScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, FlatList, ScrollView, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../services/api';

export default function AdminScreen({ navigation }) {
  const [naturalLanguageRule, setNaturalLanguageRule] = useState('');
  const [complianceResults, setComplianceResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Filter selections
  const [filterType, setFilterType] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Add custom rule via Ollama with loading animation
  const addCustomRule = async () => {
    if (!naturalLanguageRule.trim()) {
      Alert.alert('Error', 'Please enter a rule description.');
      return;
    }

    setLoading(true);
    setLoadingProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/rules/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ naturalLanguageRule }),
      });
      const data = await response.json();
      
      clearInterval(progressInterval);
      setLoadingProgress(100);

      setTimeout(() => {
        if (response.ok) {
          Alert.alert('Success', 'Custom rule added!');
          setNaturalLanguageRule('');
        } else {
          Alert.alert('Error', data.error || 'Failed to add rule.');
        }
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setLoading(false);
      setLoadingProgress(0);
      Alert.alert('Network Error', 'Check your connection and IP.');
    }
  };

  // Fetch compliance results with filters
  const fetchComplianceResults = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (filterType) queryParams.append('type', filterType);
      if (filterSource) queryParams.append('source', filterSource);
      if (filterCategory) queryParams.append('category', filterCategory);

      const response = await fetch(`${API_BASE_URL}/api/compliance?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setComplianceResults(data.results || []);
      } else {
        Alert.alert('Error', data.error || 'Failed to load compliance results.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Check your connection and IP.');
    }
  };

  // Helper component for toggle buttons
  const ToggleGroup = ({ options, selected, onSelect }) => (
    <View style={styles.toggleGroup}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.toggleButtonWrapper}
          onPress={() => onSelect(selected === option ? '' : option)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selected === option ? ['#D81E5B', '#F0544F'] : ['#E0E0E0', '#E0E0E0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.toggleButton}
          >
            <Text style={[styles.toggleText, selected !== option && styles.toggleTextInactive]}>
              {option}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
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
          <Text style={styles.welcomeText}>Create Custom Rules</Text>
        </View>
      </View>

      {/* Loading Modal */}
      <Modal
        transparent
        visible={loading}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{loadingProgress}%</Text>
            <Text style={styles.modalSubtitle}>Loading...</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Example Info Card */}
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>Example for Adding rule Correctly</Text>
          <Text style={styles.exampleText}>For Building : Buildings taller than 35 meters must have at least 2 emergency exits.
          </Text>
          <Text style={styles.exampleText}>For Bridge : Bridges with a span length greater than 400 meters must be designed to withstand wind speeds of at least 150 km/h.
           </Text>
        </View>

        {/* Add Custom Rule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe a rule in natural language...</Text>
          <TextInput
            placeholder="Enter your custom rule here..."
            value={naturalLanguageRule}
            onChangeText={setNaturalLanguageRule}
            multiline
            numberOfLines={4}
            style={styles.textInput}
            placeholderTextColor="#999"
          />
          
          <TouchableOpacity
            style={styles.addRuleButton}
            onPress={addCustomRule}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={['#D81E5B', '#F0544F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Add Custom Rule</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Type:</Text>
            <ToggleGroup
              options={['BUILDING', 'BRIDGE']}
              selected={filterType}
              onSelect={setFilterType}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Source:</Text>
            <ToggleGroup
              options={['standard', 'custom']}
              selected={filterSource}
              onSelect={setFilterSource}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Category:</Text>
            <ToggleGroup
              options={['safety', 'structural']}
              selected={filterCategory}
              onSelect={setFilterCategory}
            />
          </View>

          <TouchableOpacity
            style={styles.loadButton}
            onPress={fetchComplianceResults}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9013CF', '#E82B96']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>LOAD RESULT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Compliance Results List */}
        <View style={styles.resultsSection}>
          <FlatList
            data={complianceResults}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const assessment = item.assessmentId;
              return (
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="document-text" size={24} color="#9013CF" />
                    <View style={styles.resultHeaderText}>
                      <Text style={styles.resultTitle}>
                        {assessment ? assessment.infrastructureName : 'N/A'}
                      </Text>
                      <Text style={styles.resultSubtitle}>
                        {assessment ? assessment.type : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.resultStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Score</Text>
                      <Text style={styles.statValue}>{item.complianceScore ?? 0}%</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Violations</Text>
                      <Text style={styles.statValue}>{item.violations?.length ?? 0}</Text>
                    </View>
                  </View>
                  {item.standard && (
                    <View style={styles.standardBadge}>
                      <Text style={styles.standardText}>{item.standard}</Text>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
              </View>
            }
            scrollEnabled={false}
          />
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 12,
  },
  textInput: {
    borderColor: '#E0E0E0',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    backgroundColor: '#F8F9FE',
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 100,
    color: '#333',
  },
  addRuleButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButtonWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#666',
  },
  loadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resultsSection: {
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81E5B',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  standardBadge: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  standardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9013CF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    minWidth: 250,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  progressBarContainer: {
    width: 200,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9013CF',
    borderRadius: 4,
  },
});