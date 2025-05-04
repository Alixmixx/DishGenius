import React, { useState } from 'react';
import { StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

/**
 * Extended Message type to support tool calls
 */
type Message = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    function: {
      name: string;
      arguments: string;
    }
  }>;
};

/**
 * Props for the ChatBot component
 */
export type ChatBotProps = {
  initialMessages?: Message[];
  placeholder?: string;
  apiUrl?: string;
};

/**
 * ChatBot component that provides a chat interface with message history,
 * input field, and message sending capabilities.
 */
export function ChatBot({
  initialMessages = [],
  placeholder = 'Type your message...',
  apiUrl = '/api/chat',
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles sending a message to the chat API
   */
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle the response (which might include tool calls)
      if (data) {
        setMessages(prev => [...prev, data]);
      } else {
        console.error("No response data received from backend");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'system', content: `Error: ${error instanceof Error ? error.message : String(error)}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format JSON for display
   */
  const formatJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  /**
   * Renders a message item in the chat
   */
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isSystem = item.role === 'system';
    const isAssistant = item.role === 'assistant';
    const isTool = item.role === 'tool';
    const hasTool = item.tool_calls && item.tool_calls.length > 0;
    
    // If the message has tool calls, render both content and tool calls
    if (isAssistant && hasTool) {
      return (
        <ThemedView style={styles.messageBubbleWrapper}>
          {item.content && (
            <ThemedView style={[styles.messageBubble, styles.assistantMessage]}>
              <ThemedText style={styles.assistantMessageText}>
                {item.content}
              </ThemedText>
            </ThemedView>
          )}
          
          {item.tool_calls?.map((tool) => (
            <ThemedView key={tool.id} style={styles.toolCall}>
              <ThemedText style={styles.toolName}>
                Using tool: {tool.function.name}
              </ThemedText>
              <ThemedText style={styles.toolArgs}>
                With parameters: {formatJSON(tool.function.arguments)}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      );
    }
    
    // If it's a tool response message
    if (isTool) {
      return (
        <ThemedView style={[styles.messageBubble, styles.toolMessage]}>
          <ThemedText style={styles.toolName}>Tool result:</ThemedText>
          <ThemedText style={styles.toolMessageText}>
            {formatJSON(item.content)}
          </ThemedText>
        </ThemedView>
      );
    }
    
    // Regular message rendering
    return (
      <ThemedView
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : isSystem ? styles.systemMessage : styles.assistantMessage,
        ]}>
        <ThemedText
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : isSystem ? styles.systemMessageText : styles.assistantMessageText,
          ]}>
          {item.content}
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 10,
  },
  messageBubbleWrapper: {
    marginVertical: 5,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 10,
  },
  toolCall: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1E90FF',
    marginVertical: 5,
    maxWidth: '85%',
  },
  toolMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1F5FE',
    borderBottomLeftRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#0277BD',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#000000',
  },
  systemMessageText: {
    color: '#FFFFFF',
  },
  toolMessageText: {
    color: '#0277BD',
    fontFamily: 'monospace',
  },
  toolName: {
    fontWeight: 'bold',
    color: '#0277BD',
    marginBottom: 4,
  },
  toolArgs: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});