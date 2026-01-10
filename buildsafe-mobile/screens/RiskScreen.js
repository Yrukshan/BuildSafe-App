// screens/RiskScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../services/api';
import * as Linking from 'expo-linking';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';


export default function RiskScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessmentId } = route.params;

  const [riskData, setRiskData] = useState(null);
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

  // Calculate risk score
  const calculateRiskScore = async () => {
    setLoading(true);
    setLoadingProgress(0);

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

      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/api/risk/${assessmentId}`, {
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
          setRiskData(data);
        } else {
          Alert.alert('Error', data.error || 'Risk calculation failed.');
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
      calculateRiskScore();
    }
  }, [assessmentId]);

  // Get risk level label
  const getRiskLevel = (score) => {
    if (score <= 35) return 'LOW RISK';
    if (score <= 74) return 'NORMAL RISK';
    return 'HIGH RISK';
  };

  // Get risk level colors for gradient
  const getRiskGradientColors = (score) => {
    if (score <= 35) return ['#4CAF50', '#66BB6A'];
    if (score <= 74) return ['#FF9800', '#FFB74D'];
    return ['#F44336', '#E57373'];
  };

  // Get risk icon
  const getRiskIcon = (score) => {
    if (score <= 35) return 'checkmark-circle';
    if (score <= 74) return 'warning';
    return 'alert-circle';
  };

  // ✅ Modern PDF Download (Expo SDK 54+)
 const downloadPdf = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Authentication Error', 'You are not logged in.');
      return;
    }

    const pdfUrl = `${API_BASE_URL}/api/risk/${riskData._id}/pdf`;
    const filename = `risk_report_${riskData._id}.pdf`;

    // Create file reference
    const destinationFile = new File(Paths.document, filename);

    // Download with auth
    const downloadedFile = await File.downloadFileAsync(pdfUrl, destinationFile, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!downloadedFile.exists) {
      throw new Error('Download succeeded but file was not saved.');
    }

    // ✅ Use Sharing to open securely on Android/iOS
    await Sharing.shareAsync(downloadedFile.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Open Risk Report',
    });

  } catch (error) {
    console.error('PDF Download Error:', error);
    Alert.alert('Download Failed', error.message || 'Unable to open the report.');
  }
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
          <Text style={styles.welcomeText}>Risk Assessment</Text>
          <Text style={styles.welcomeSubtext}>Analyze infrastructure risks</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.riskIconContainer}>
              <View style={styles.riskMeterCircle}>
                <View style={styles.riskMeterNeedle} />
                <Text style={styles.riskMeterText}>RISK</Text>
              </View>
            </View>
            
            <Text style={styles.loadingTitle}>Calculating Risks...</Text>
            <Text style={styles.loadingSubtitle}>Using Weather & Compliance Data...</Text>
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
        ) : riskData ? (
          <>
            {/* Final Risk Score Card */}
            <View style={styles.scoreCardWrapper}>
              <LinearGradient
                colors={getRiskGradientColors(riskData.finalRiskScore)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scoreCard}
              >
                <Ionicons 
                  name={getRiskIcon(riskData.finalRiskScore)} 
                  size={56} 
                  color="white" 
                />
                <Text style={styles.scoreLabel}>Final Risk Score</Text>
                <Text style={styles.scoreValue}>{riskData.finalRiskScore}%</Text>
                <View style={styles.riskLevelBadge}>
                  <Text style={styles.riskLevelText}>{getRiskLevel(riskData.finalRiskScore)}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Risk Breakdown */}
            <View style={styles.breakdownSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chart-pie" size={24} color="#D81E5B" />
                <Text style={styles.sectionTitle}>Risk Breakdown</Text>
              </View>

              <View style={styles.breakdownCard}>
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="shield-checkmark" size={20} color="#9013CF" />
                    </View>
                    <Text style={styles.breakdownLabel}>Compliance Contribution</Text>
                  </View>
                  <Text style={styles.breakdownValue}>70%</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="cloud" size={20} color="#E82B96" />
                    </View>
                    <Text style={styles.breakdownLabel}>Weather Impact</Text>
                  </View>
                  <Text style={styles.breakdownValue}>30%</Text>
                </View>
              </View>
            </View>

            {/* Weather Conditions */}
            <View style={styles.weatherSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="partly-sunny" size={24} color="#D81E5B" />
                <Text style={styles.sectionTitle}>Weather Conditions</Text>
              </View>

              <View style={styles.weatherGrid}>
                <View style={styles.weatherItem}>
                  <View style={styles.weatherIconContainer}>
                    <Ionicons name="thermometer" size={28} color="#FF6B6B" />
                  </View>
                  <Text style={styles.weatherLabel}>Temperature</Text>
                  <Text style={styles.weatherValue}>
                    {riskData.weatherData?.temperature ?? 'N/A'} °C
                  </Text>
                </View>

                <View style={styles.weatherItem}>
                  <View style={styles.weatherIconContainer}>
                    <MaterialCommunityIcons name="weather-windy" size={28} color="#4ECDC4" />
                  </View>
                  <Text style={styles.weatherLabel}>Wind Speed</Text>
                  <Text style={styles.weatherValue}>
                    {riskData.weatherData?.windSpeed ?? 'N/A'} m/s
                  </Text>
                </View>

                <View style={styles.weatherItem}>
                  <View style={styles.weatherIconContainer}>
                    <Ionicons name="rainy" size={28} color="#5B8DEE" />
                  </View>
                  <Text style={styles.weatherLabel}>Precipitation</Text>
                  <Text style={styles.weatherValue}>
                    {riskData.weatherData?.precipitation ?? 'N/A'} mm/h
                  </Text>
                </View>

                <View style={styles.weatherItem}>
                  <View style={styles.weatherIconContainer}>
                    <Ionicons name="cloudy" size={28} color="#95A5A6" />
                  </View>
                  <Text style={styles.weatherLabel}>Conditions</Text>
                  <Text style={styles.weatherValue}>
                    {riskData.weatherData?.conditions ?? 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={calculateRiskScore}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#9013CF', '#E82B96']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.buttonText}>Re-Calculate</Text>
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

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.navigate('AI', {
                screen: 'AIRecommendations',
                params: { assessmentId }
              })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D81E5B', '#F0544F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>AI Recommendations</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.initialStateContainer}>
            <Ionicons name="analytics-outline" size={80} color="#CCC" />
            <Text style={styles.initialStateTitle}>Ready to Calculate Risk</Text>
            <Text style={styles.initialStateText}>Click below to analyze the risk assessment</Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={calculateRiskScore}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D81E5B', '#F0544F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Ionicons name="calculator" size={24} color="white" />
                <Text style={styles.buttonText}>Calculate Risk Score</Text>
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
  riskIconContainer: {
    marginBottom: 24,
  },
  riskMeterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#F5F5F5',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskMeterNeedle: {
    position: 'absolute',
    width: 4,
    height: 40,
    backgroundColor: '#D81E5B',
    top: 20,
    borderRadius: 2,
  },
  riskMeterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginTop: 20,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  loadingHint: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
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
  scoreCardWrapper: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  scoreCard: {
    padding: 40,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  riskLevelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  breakdownSection: {
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
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  breakdownLabel: {
    fontSize: 15,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81E5B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  weatherSection: {
    marginBottom: 24,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  weatherItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  weatherIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  weatherLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2D2D',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  nextButton: {
    width: '100%',
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