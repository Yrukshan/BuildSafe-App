// screens/HomeScreen.js
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


export default function HomeScreen() {
  const navigation = useNavigation();

  const handleCardPress = (targetScreen) => {
    // Navigate to the tab screen inside the HomeTabs navigator
    navigation.navigate('HomeTabs', { screen: targetScreen });
  };

  const mockCards = [
    {
      id: '1',
      title: 'New Assessment',
      description: 'Start a new infrastructure risk assessment',
      gradient: ['#E91E63', '#C2185B'], // Pink to darker pink
      target: 'Assessments',
    },
    {
      id: '2',
      title: 'Manage Compliance',
      description: 'Add custom standards from here!',
      gradient: ['#EC407A', '#6A1B4D'], // Pink to deep purple
      target: 'Compliance',
    },
    {
      id: '3',
      title: 'Analyze Risks',
      description: 'View and analyze potential risks in infrastructure projects',
      gradient: ['#FF5252', '#E53935'], // Coral red gradient
      target: 'Risk',
    },
    {
      id: '4',
      title: 'AI Recommendations',
      description: 'Get smart suggestions for infrastructure safety',
      gradient: ['#5d4487ff', '#502b9aff'], // Purple gradient
      target: 'AI',
    },
    {
      id: '5',
      title: 'Offline Drafts',
      description: 'Review and sync unsaved assessments',
      gradient: ['#26A69A', '#00897B'], // Teal gradient
      target: 'Assessments',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header Section - Full Width Background */}
      <View style={styles.headerSection}>
        <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('Login')} // Change 'Profile' to your screen name
      >
        <Ionicons name="person-circle-outline" size={28} color="white" />
      </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtext}>Your next assessment awaits</Text>
        </View>
      </View>

      {/* Scrollable Cards Section */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Cards */}
        {mockCards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardWrapper}
            onPress={() => handleCardPress(card.target)}
            activeOpacity={0.85}
          >
            <View style={[
              styles.card,
              {
                backgroundColor: card.gradient[0],
              }
            ]}>
              {/* Gradient overlay effect */}
              <View style={[
                styles.gradientOverlay,
                {
                  backgroundColor: card.gradient[1],
                }
              ]} />
              
              {/* Side accent bar */}
              <View style={styles.accentBar} />
              
              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>✨ Tap any card to get started</Text>
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
  backArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
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
  profileIcon: {
    fontSize: 20,
  },
  headerContent: {
    marginTop: 50,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    minHeight: 140,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '60%',
    opacity: 0.6,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    transform: [{ skewX: '-10deg' }],
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 20,
    bottom: 20,
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  cardContent: {
    padding: 24,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    lineHeight: 20,
    maxWidth: '85%',
  },
  footer: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#5E35B1',
    opacity: 0.8,
    fontWeight: '500',
  },
});