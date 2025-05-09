import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TextInput } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useAuth } from '../../lib/auth/AuthProvider';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
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
          title: 'Forgot Password',
          headerTitleAlign: 'center',
        }} 
      />
      
      <ThemedView style={styles.container}>
        <ThemedView style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </ThemedView>
        
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.title}>Reset Password</ThemedText>
          
          {isSuccess ? (
            <View style={styles.successContainer}>
              <ThemedText style={styles.successText}>
                Password reset email sent. Please check your inbox and follow the instructions.
              </ThemedText>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => router.push('/auth/login')}
              >
                <ThemedText style={styles.buttonText}>Back to Login</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ThemedText style={styles.instructionText}>
                Enter your email address and we'll send you instructions to reset your password.
              </ThemedText>
              
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
              
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.buttonText}>Reset Password</ThemedText>
                )}
              </TouchableOpacity>
              
              <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <ThemedText style={styles.link}>Back to Login</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 20,
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
    alignItems: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
  },
});