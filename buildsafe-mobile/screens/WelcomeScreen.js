// screens/WelcomeScreen.js
import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 10000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
       <Text style={styles.title}>BuildSafe</Text>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#412d4f', // Papaya Whip
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 5,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFF', // Dark Purple
    marginBottom: 8,
  },
   
});