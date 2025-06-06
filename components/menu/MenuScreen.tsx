import React from "react";
import { StyleSheet } from "react-native";
import { ChatBot } from "../chat/ChatBot";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

/**
 * Example ChatScreen component that demonstrates how to use the ChatBot component
 */
export function MenuScreen() {
  // Initial messages to display in the chat
  const initialMessages = [
    {
      role: "assistant",
      content:
        "Hello! I'm your DishGenius assistant. How can I help you today?",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerText}>
          Chat Assistant
        </ThemedText>
      </ThemedView>

      <ChatBot
        initialMessages={initialMessages}
        placeholder="Ask about recipes, cooking tips, etc..."
        apiUrl="/api/chat"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerText: {
    textAlign: "center",
  },
});
