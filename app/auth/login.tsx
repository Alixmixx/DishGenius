import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TextInput } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useAuth } from '../../lib/auth/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      
      // Navigation will be handled by the AuthProvider
    } catch (error) {
      console.error('Login error:', error);
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
          title: 'Login',
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
          <ThemedText style={styles.title}>Welcome Back</ThemedText>
          
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
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Login</ThemedText>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <ThemedText>Don't have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <ThemedText style={styles.link}>Register</ThemedText>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <ThemedText style={styles.link}>Forgot Password?</ThemedText>
          </TouchableOpacity>
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
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
});