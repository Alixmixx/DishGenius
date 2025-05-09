import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../lib/auth/AuthProvider';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerTitleAlign: 'center',
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.profileCard}>
          <ThemedText style={styles.title}>My Profile</ThemedText>
          
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{user?.email}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.label}>User ID</ThemedText>
            <ThemedText style={styles.value}>{user?.id}</ThemedText>
          </ThemedView>
          
          {user?.email_confirmed_at ? (
            <ThemedView style={styles.infoSection}>
              <ThemedText style={styles.label}>Email Verified</ThemedText>
              <ThemedText style={styles.value}>Yes</ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.infoSection}>
              <ThemedText style={styles.label}>Email Verified</ThemedText>
              <ThemedText style={styles.value}>No</ThemedText>
              <TouchableOpacity style={styles.verifyButton}>
                <ThemedText style={styles.verifyButtonText}>Verify Email</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
          
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.label}>Last Sign In</ThemedText>
            <ThemedText style={styles.value}>
              {user?.last_sign_in_at 
                ? new Date(user.last_sign_in_at).toLocaleString() 
                : 'N/A'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.actionsCard}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // Navigate to edit profile screen
              Alert.alert('Coming Soon', 'Edit profile functionality coming soon!');
            }}
          >
            <ThemedText style={styles.actionButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // Navigate to change password screen
              Alert.alert('Coming Soon', 'Change password functionality coming soon!');
            }}
          >
            <ThemedText style={styles.actionButtonText}>Change Password</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleSignOut}
          >
            <ThemedText style={styles.logoutButtonText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});