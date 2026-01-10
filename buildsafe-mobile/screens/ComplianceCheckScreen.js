// screens/ComplianceCheckScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../services/api';

export default function ComplianceCheckScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessmentId } = route.params;

  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Run compliance check
  const runComplianceCheck = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Not logged in.');
        return;
      }

      const assessmentRes = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const assessment = await assessmentRes.json();

      if (!assessmentRes.ok) throw new Error('Failed to load assessment');

      const compliancePayload = {
        assessmentId,
        type: assessment.type,
        structure: assessment.structure || {},
        safety: assessment.safety || {}
      };

      const response = await fetch(`${API_BASE_URL}/api/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(compliancePayload)
      });

      const data = await response.json();
      if (response.ok) {
        setComplianceData(data);
      } else {
        Alert.alert('Error', data.error || 'Compliance check failed.');
      }
    } catch (error) {
      Alert.alert('Network Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentId) {
      runComplianceCheck();
    }
  }, [assessmentId]);

  // Get risk level label
  const getRiskLevel = (score) => {
    if (score >= 80) return 'COMPLIANT';
    if (score >= 60) return 'REVIEW';
    return 'NON-COMPLIANT';
  };

  // Get risk level color
  const getRiskLevelColor = (score) => {
    if (score >= 80) return ['#4CAF50', '#66BB6A']; // Green
    if (score >= 60) return ['#FF9800', '#FFB74D']; // Orange
    return ['#F44336', '#E57373']; // Red
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    if (severity === 'critical') return '#f43636ff';
    if (severity === 'high') return '#d20d0dff';
    return '#FFC107';
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return 'alert-circle';
    if (severity === 'high') return 'warning';
    return 'information-circle';
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
          <Text style={styles.welcomeText}>Compliance Check</Text>
          <Text style={styles.welcomeSubtext}>Verify standards compliance</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D81E5B" />
            <Text style={styles.loadingText}>Running compliance check...</Text>
          </View>
        ) : complianceData ? (
          <>
            {/* Compliance Score Card */}
            <View style={styles.scoreCardWrapper}>
              <LinearGradient
                colors={getRiskLevelColor(complianceData.complianceScore)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scoreCard}
              >
                <Ionicons 
                  name={complianceData.complianceScore >= 80 ? "checkmark-circle" : "alert-circle"} 
                  size={48} 
                  color="white" 
                />
                <Text style={styles.scoreLabel}>Compliance Score</Text>
                <Text style={styles.scoreValue}>{complianceData.complianceScore}%</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{getRiskLevel(complianceData.complianceScore)}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Violations Section */}
            {complianceData.violations.length > 0 ? (
              <View style={styles.violationsSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning-outline" size={24} color="#D81E5B" />
                  <Text style={styles.sectionTitle}>Violations Found ({complianceData.violations.length})</Text>
                </View>

                {complianceData.violations.map((violation, index) => (
                  <View key={index} style={styles.violationCard}>
                    <View style={styles.violationHeader}>
                      <Ionicons 
                        name={getSeverityIcon(violation.severity)} 
                        size={24} 
                        color={getSeverityColor(violation.severity)} 
                      />
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(violation.severity) }
                      ]}>
                        <Text style={styles.severityText}>{violation.severity.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.violationMessage}>{violation.expectedValue}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noViolationsCard}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Text style={styles.noViolationsTitle}>All Clear!</Text>
                <Text style={styles.noViolationsText}>No violations found. Fully compliant!</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={runComplianceCheck}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#9013CF', '#E82B96']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.buttonText}>Re-Check</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Risk', { 
                  screen: 'RiskCheck', 
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
                  <Text style={styles.buttonText}>Analyze Risk</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.initialStateContainer}>
            <Ionicons name="document-text-outline" size={80} color="#CCC" />
            <Text style={styles.initialStateTitle}>Ready to Check Compliance</Text>
            <Text style={styles.initialStateText}>Click below to run the compliance check</Text>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={runComplianceCheck}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D81E5B', '#F0544F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Ionicons name="play-circle" size={24} color="white" />
                <Text style={styles.buttonText}>Run Compliance Check</Text>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    padding: 32,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  violationsSection: {
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