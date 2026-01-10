// screens/AllRiskScoresScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../services/api';

export default function AllRiskScoresScreen() {
  const [riskList, setRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadRiskHistory();
  }, []);

  const loadRiskHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/risk`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load risk history');
      }

      const data = await response.json();
      const risks = data.risks || [];
      setRiskList(risks);
    } catch (error) {
      console.error('Error loading risk history:', error);
      Alert.alert('Error', error.message || 'Unable to load risk records.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskGradientColors = (score) => {
    if (score <= 35) return ['#4CAF50', '#66BB6A']; // Green - Low Risk
    if (score <= 74) return ['#FF9800', '#FFB74D']; // Orange - Normal Risk
    return ['#F44336', '#E57373']; // Red - High Risk
  };

  const getRiskLabel = (score) => {
    if (score <= 35) return 'LOW RISK';
    if (score <= 74) return 'NORMAL RISK';
    return 'HIGH RISK';
  };

  const getRiskIcon = (score) => {
    if (score <= 35) return 'checkmark-circle';
    if (score <= 74) return 'warning';
    return 'alert-circle';
  };

  const renderRiskItem = ({ item }) => {
    const assessment = item.assessmentId;
    const score = item.finalRiskScore || 0;
    
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() =>
          navigation.navigate('Risk', { 
            screen: 'RiskCheck', 
            params: { assessmentId: assessment._id } 
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="analytics" size={28} color="#E82B96" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.itemTitle}>
              {assessment?.infrastructureName || 'Unnamed Asset'}
            </Text>
            <View style={styles.typeBadge}>
              <Ionicons 
                name={assessment?.type === 'BUILDING' ? 'business' : 'git-network'} 
                size={14} 
                color="#666" 
              />
              <Text style={styles.typeText}>{assessment?.type || 'Unknown'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.riskSection}>
          <View style={styles.riskWrapper}>
            <LinearGradient
              colors={getRiskGradientColors(score)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.riskGradient}
            >
              <Ionicons name={getRiskIcon(score)} size={24} color="white" />
              <Text style={styles.riskValue}>{score}%</Text>
            </LinearGradient>
            <Text style={styles.riskLabel}>{getRiskLabel(score)}</Text>
          </View>

          <View style={styles.weatherSection}>
            <View style={styles.weatherItem}>
              <Ionicons name="thermometer" size={20} color="#FF6B6B" />
              <Text style={styles.weatherText}>
                {item.weatherData?.temperature ?? 'N/A'}°C
              </Text>
            </View>
            <View style={styles.weatherItem}>
              <MaterialCommunityIcons name="weather-windy" size={20} color="#4ECDC4" />
              <Text style={styles.weatherText}>
                {item.weatherData?.windSpeed ?? 'N/A'} m/s
              </Text>
            </View>
          </View>

          <View style={styles.dateSection}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color="#E82B96" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
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
            <Text style={styles.welcomeText}>All Risk Scores</Text>
            <Text style={styles.welcomeSubtext}>View risk assessments</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D81E5B" />
          <Text style={styles.loadingText}>Loading risk history...</Text>
        </View>
      </View>
    );
  }

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
          <Text style={styles.welcomeText}>All Risk Scores</Text>
          <Text style={styles.welcomeSubtext}>
            {riskList.length} {riskList.length === 1 ? 'assessment' : 'assessments'} found
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {riskList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="analytics-outline" size={64} color="#E82B96" />
            </View>
            <Text style={styles.emptyTitle}>No Assessments Yet</Text>
            <Text style={styles.emptyText}>No risk assessments found.</Text>
            <Text style={styles.hintText}>Complete an assessment to generate risk scores.</Text>
            
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Assessments')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D81E5B', '#F0544F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.buttonText}>Start Assessment</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={riskList}
            keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
            renderItem={renderRiskItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  riskSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  riskWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  riskGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  riskValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  riskLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 0.5,
  },
  weatherSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  weatherText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '600',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  hintText: {
    color: '#999',
    marginBottom: 32,
    textAlign: 'center',
    fontSize: 14,
  },
  emptyButton: {
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
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});