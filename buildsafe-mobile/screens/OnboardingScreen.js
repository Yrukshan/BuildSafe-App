// screens/OnboardingScreen.js
import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation();

  const OnboardingPage = ({ imageSource, title, subtitle, dots, isLast }) => (
    <View style={styles.pageContainer}>
      <Image 
        source={imageSource} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
        style={styles.overlay}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.dotsContainer}>
            {dots}
          </View>
          {isLast ? (
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={() => navigation.replace('Login')}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <Onboarding
      onDone={() => navigation.replace('Login')}
      onSkip={() => navigation.replace('Login')}
      containerStyles={styles.onboardingContainer}
      pages={[
        {
          backgroundColor: 'transparent',
          image: (
            <OnboardingPage
              imageSource={require('../assets/onboarding1.jpg')}
              title="Welcome to BuildSafe"
              subtitle="Probe. Prevent. Protect."
              dots={
                <>
                  <View style={[styles.dot, styles.activeDot]} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </>
              }
              isLast={false}
            />
          ),
          title: '',
          subtitle: '',
        },
        {
          backgroundColor: 'transparent',
          image: (
            <OnboardingPage
              imageSource={require('../assets/onboarding2.jpg')}
              title="Choose Infrastructures On Your Own."
              subtitle=""
              dots={
                <>
                  <View style={styles.dot} />
                  <View style={[styles.dot, styles.activeDot]} />
                  <View style={styles.dot} />
                </>
              }
              isLast={false}
            />
          ),
          title: '',
          subtitle: '',
        },
        {
          backgroundColor: 'transparent',
          image: (
            <OnboardingPage
              imageSource={require('../assets/onboarding3.jpg')}
              title="Analyze Risks On The Spot."
              subtitle=""
              dots={
                <>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={[styles.dot, styles.activeDot]} />
                </>
              }
              isLast={false}
            />
          ),
          title: '',
          subtitle: '',
        },
        {
          backgroundColor: 'transparent',
          image: (
            <OnboardingPage
              imageSource={require('../assets/onboarding4.jpg')}
              title="Get an AI to Help You - On Site."
              subtitle=""
              dots={
                <>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={[styles.dot, styles.activeDot]} />
                </>
              }
              isLast={true}
            />
          ),
          title: '',
          subtitle: '',
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  onboardingContainer: {
    flex: 1,
  },
  pageContainer: {
    width: width,
    height: height,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  textContainer: {
    paddingHorizontal: 30,
    alignItems: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 50,
    textAlign: 'left',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'left',
    marginBottom: 30,
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
    borderRadius: 4,
  },
  getStartedButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowContainer: {
    marginTop: 20,
  },
});
