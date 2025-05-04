import { StyleSheet } from 'react-native';

import { ChatScreen } from '@/components/ChatScreen';
import { ThemedView } from '@/components/ThemedView';

/**
 * Chat tab screen that displays the ChatBot interface
 */
export default function ChatTab() {
  return (
    <ThemedView style={styles.container}>
      <ChatScreen />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});