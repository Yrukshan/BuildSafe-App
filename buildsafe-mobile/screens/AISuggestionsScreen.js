// screens/AISuggestionsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../services/api';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AISuggestionsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessmentId } = route.params;

  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Animation values for loading dots
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  // Animate loading dots
  useEffect(() => {
    if (loading) {
      const animateDot = (dot, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateDot(dot1, 0);
      animateDot(dot2, 200);
      animateDot(dot3, 400);
    }
  }, [loading]);

  // Generate AI recommendations
  const generateRecommendations = async () => {
    setLoading(true);
    setLoadingProgress(0);

    // Simulate progress for at least 4 seconds
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 400);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Not logged in.');
        clearInterval(progressInterval);
        setLoading(false);
        return;
      }

      // Ensure minimum 4 second loading
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}/api/recommendations/${assessmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 4000 - elapsed);

      setTimeout(() => {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        
        if (response.ok) {
          setRecommendationData(data);
        } else {
          Alert.alert('Error', data.error || 'AI generation failed.');
        }
        setLoading(false);
      }, remainingTime);

    } catch (error) {
      clearInterval(progressInterval);
      Alert.alert('Network Error', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentId) {
      generateRecommendations();
    }
  }, [assessmentId]);

  // ✅ Secure PDF Download Function (NEW)
  const downloadPdf = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'You are not logged in.');
        return;
      }

      const pdfUrl = `${API_BASE_URL}/api/recommendations/${recommendationData._id}/pdf`;
      const filename = `ai_recommendations_${recommendationData._id}.pdf`;

      const destinationFile = new File(Paths.document, filename);

      const downloadedFile = await File.downloadFileAsync(pdfUrl, destinationFile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!downloadedFile.exists) {
        throw new Error('File not found after download.');
      }

      await Sharing.shareAsync(downloadedFile.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'AI Recommendations Report',
      });

    } catch (error) {
      console.error('AI PDF Download Error:', error);
      Alert.alert('Download Failed', error.message || 'Could not download the report.');
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'HIGH') return '#F44336';
    if (priority === 'MEDIUM') return '#FF9800';
    return '#4CAF50';
  };

  const getPriorityGradient = (priority) => {
    if (priority === 'HIGH') return ['#F44336', '#E57373'];
    if (priority === 'MEDIUM') return ['#FF9800', '#FFB74D'];
    return ['#4CAF50', '#66BB6A'];
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return '#e72e21ff';
    if (severity === 'high') return '#ff0000ff';
    return '#FFC107';
  };

  const getRiskLevelIcon = (riskLevel) => {
    if (riskLevel === 'high') return 'alert-circle';
    if (riskLevel === 'normal') return 'warning';
    return 'checkmark-circle';
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
          <Text style={styles.welcomeText}>AI Recommendations</Text>
          <Text style={styles.welcomeSubtext}>Smart suggestions for safety</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.robotContainer}>
              <MaterialCommunityIcons name="robot-outline" size={80} color="#9013CF" />
            </View>
            
            <Text style={styles.loadingTitle}>Analyzing Risks...</Text>
            <Text style={styles.loadingSubtitle}>Checking Violation Data...</Text>
            <Text style={styles.loadingHint}>This may take awhile</Text>

            {/* Animated Dots */}
            <View style={styles.dotsContainer}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot1,
                    transform: [
                      {
                        scale: dot1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.3],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot2,
                    transform: [
                      {
                        scale: dot2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.3],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot3,
                    transform: [
                      {
                        scale: dot3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.3],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{loadingProgress}%</Text>
          </View>
        ) : recommendationData ? (
          <>
            {/* Risk Level & Priority Card */}
            <View style={styles.headerCardWrapper}>
              <LinearGradient
                colors={getPriorityGradient(recommendationData.priority)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerCard}
              >
                <Ionicons 
                  name={getRiskLevelIcon(recommendationData.riskLevel)} 
                  size={48} 
                  color="white" 
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.riskLevel}>
                    Risk Level: <Text style={styles.boldText}>{recommendationData.riskLevel.toUpperCase()}</Text>
                  </Text>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>
                      {recommendationData.priority} PRIORITY
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* AI Suggestions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={24} color="#D81E5B" />
                <Text style={styles.sectionTitle}>AI Suggestions</Text>
              </View>

              <View style={styles.suggestionsCard}>
                {recommendationData.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <View style={styles.suggestionNumber}>
                      <Text style={styles.suggestionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Compliance Violations */}
            {recommendationData.violations && recommendationData.violations.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning" size={24} color="#D81E5B" />
                  <Text style={styles.sectionTitle}>Compliance Violations</Text>
                </View>

                {recommendationData.violations.map((violation, index) => (
                  <View key={index} style={styles.violationCard}>
                    <View style={styles.violationHeader}>
                      <Ionicons 
                        name="alert-circle" 
                        size={24} 
                        color={getSeverityColor(violation.severity)} 
                      />
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(violation.severity) }
                      ]}>
                        <Text style={styles.severityText}>
                          {violation.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.violationMessage}>{violation.expectedValue}</Text>
                    <Text style={styles.violationParam}>({violation.parameterName})</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noViolationsCard}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Text style={styles.noViolationsTitle}>All Clear!</Text>
                <Text style={styles.noViolationsText}>No compliance violations found.</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={generateRecommendations}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#9013CF', '#E82B96']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.buttonText}>Re-Generate</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={downloadPdf}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#D81E5B', '#F0544F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="download" size={20} color="white" />
                  <Text style={styles.buttonText}>Download PDF</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.initialStateContainer}>
            <MaterialCommunityIcons name="robot-outline" size={80} color="#CCC" />
            <Text style={styles.initialStateTitle}>Ready for AI Analysis</Text>
            <Text style={styles.initialStateText}>Click below to generate smart recommendations</Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={generateRecommendations}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D81E5B', '#F0544F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <MaterialCommunityIcons name="brain" size={24} color="white" />
                <Text style={styles.buttonText}>Generate AI Recommendations</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  robotContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  loadingHint: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D81E5B',
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D81E5B',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D81E5B',
  },
  headerCardWrapper: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  headerCard: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  riskLevel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginLeft: 8,
  },
  suggestionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  suggestionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9013CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  suggestionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestionText: {
    fontSize: 15,
    color: '#2D2D2D',
    lineHeight: 22,
    flex: 1,
  },
  violationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  violationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  violationMessage: {
    fontSize: 15,
    color: '#2D2D2D',
    lineHeight: 22,
    marginBottom: 6,
  },
  violationParam: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  noViolationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noViolationsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  noViolationsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
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
  initialStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  initialStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginTop: 20,
    marginBottom: 8,
  },
  initialStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});