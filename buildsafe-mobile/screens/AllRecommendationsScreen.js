// screens/AllRecommendationsScreen.js
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

export default function AllRecommendationsScreen() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load recommendations');
      }

      const data = await response.json();
      const recs = data.recommendations || [];
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      Alert.alert('Error', error.message || 'Unable to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityGradient = (priority) => {
    switch (priority) {
      case 'HIGH': return ['#F44336', '#E57373'];
      case 'MEDIUM': return ['#FF9800', '#FFB74D'];
      default: return ['#4CAF50', '#66BB6A'];
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'alert-circle';
      case 'normal': return 'warning';
      default: return 'checkmark-circle';
    }
  };

  const getRiskLabel = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'High Risk';
      case 'normal': return 'Normal Risk';
      default: return 'Low Risk';
    }
  };

  const renderRecommendationItem = ({ item }) => {
    const assessment = item.assessmentId;
    
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() =>
          navigation.navigate('AI', {
            screen: 'AIRecommendations',
            params: { assessmentId: assessment._id }
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="lightbulb-on" size={28} color="#FFB800" />
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

        <View style={styles.infoSection}>
          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <Ionicons name={getRiskIcon(item.riskLevel)} size={20} color="#9013CF" />
              <Text style={styles.riskLabel}>Risk Level</Text>
            </View>
            <Text style={styles.riskValue}>{getRiskLabel(item.riskLevel)}</Text>
          </View>

          <View style={styles.priorityCardWrapper}>
            <LinearGradient
              colors={getPriorityGradient(item.priority)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.priorityCard}
            >
              <Text style={styles.priorityLabel}>Priority</Text>
              <Text style={styles.priorityValue}>{item.priority}</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.suggestionsPreview}>
          <Text style={styles.previewLabel}>AI Suggestions:</Text>
          <Text style={styles.previewText} numberOfLines={2}>
            {item.suggestions && item.suggestions.length > 0 
              ? item.suggestions[0] 
              : 'View recommendations'}
          </Text>
        </View>

        <View style={styles.footer}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#9013CF" />
          </View>
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
            <Text style={styles.welcomeText}>AI Recommendations</Text>
            <Text style={styles.welcomeSubtext}>Smart suggestions history</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D81E5B" />
          <Text style={styles.loadingText}>Loading AI recommendations...</Text>
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
          <Text style={styles.welcomeText}>AI Recommendations</Text>
          <Text style={styles.welcomeSubtext}>
            {recommendations.length} {recommendations.length === 1 ? 'recommendation' : 'recommendations'} found
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {recommendations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="lightbulb-outline" size={64} color="#FFB800" />
            </View>
            <Text style={styles.emptyTitle}>No Suggestions Yet</Text>
            <Text style={styles.emptyText}>No AI recommendations found.</Text>
            <Text style={styles.hintText}>Complete an assessment to generate AI suggestions.</Text>
            
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
            data={recommendations}
            keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
            renderItem={renderRecommendationItem}
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
    backgroundColor: '#FFF9E6',
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
  infoSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  riskCard: {
    flex: 1,
    backgroundColor: '#F8F9FE',
    padding: 12,
    borderRadius: 12,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '600',
  },
  riskValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  priorityCardWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  priorityCard: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  priorityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestionsPreview: {
    backgroundColor: '#F8F9FE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB800',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
  },
  previewText: {
    fontSize: 13,
    color: '#2D2D2D',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9013CF',
    marginRight: 4,
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
    backgroundColor: '#FFF9E6',
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