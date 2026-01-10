// screens/HistoryScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HistoryScreen() {
  const navigation = useNavigation();

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
          <Text style={styles.welcomeText}>History</Text>
          <Text style={styles.welcomeSubtext}>Access your past records</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="time-outline" size={32} color="#9013CF" />
          </View>
          <Text style={styles.description}>
            View all compliance checks, risk scores, and AI recommendations in one place.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {/* All Compliance Button */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AllCompliance')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D81E5B', '#F0544F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="white" />
              </View>
              <Text style={styles.cardTitle}>All Compliance</Text>
              <Text style={styles.cardSubtitle}>View compliance history</Text>
              <Ionicons name="chevron-forward" size={24} color="white" style={styles.arrowIcon} />
            </LinearGradient>
          </TouchableOpacity>

          {/* All Risk Scores Button */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AllRisk')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D81E5B', '#F0544F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons name="analytics" size={32} color="white" />
              </View>
              <Text style={styles.cardTitle}>All Risk Scores</Text>
              <Text style={styles.cardSubtitle}>View risk assessments</Text>
              <Ionicons name="chevron-forward" size={24} color="white" style={styles.arrowIcon} />
            </LinearGradient>
          </TouchableOpacity>

          {/* All Recommendations Button */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AllRecommendations')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D81E5B', '#F0544F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <View style={styles.cardIconContainer}>
                <MaterialCommunityIcons name="lightbulb-on" size={32} color="white" />
              </View>
              <Text style={styles.cardTitle}>All Recommendations</Text>
              <Text style={styles.cardSubtitle}>View AI suggestions</Text>
              <Ionicons name="chevron-forward" size={24} color="white" style={styles.arrowIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Ionicons name="information-circle" size={20} color="#9013CF" />
          <Text style={styles.infoText}>
            Tap any card to view detailed history
          </Text>
        </View>
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
    padding: 20,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 16,
  },
  actionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gradientCard: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 100,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    position: 'absolute',
    left: 100,
    bottom: 24,
  },
  arrowIcon: {
    position: 'absolute',
    right: 20,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});