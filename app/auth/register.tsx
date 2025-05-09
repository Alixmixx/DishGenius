import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TextInput } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useAuth } from '../../lib/auth/AuthProvider';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    // Input validation
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      
      // Show success message and redirect to login
      alert('Registration successful! Please check your email to verify your account.');
      router.push('/auth/login');
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen 
        options={{
          title: 'Register',
          headerTitleAlign: 'center',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </ThemedView>
        
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.title}>Create Account</ThemedText>
          
          {errorMessage ? (
            <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
          ) : null}
          
          <View style={styles.inputContainer}>
            <ThemedText>Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ddd' }
              ]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#888' : '#999'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText>Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ddd' }
              ]}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? '#888' : '#999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText>Confirm Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ddd' }
              ]}
              placeholder="Confirm your password"
              placeholderTextColor={isDark ? '#888' : '#999'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Register</ThemedText>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <ThemedText>Already have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <ThemedText style={styles.link}>Login</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff5252',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#7fb8ff',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});