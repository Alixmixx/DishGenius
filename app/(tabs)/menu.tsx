import { StyleSheet } from "react-native";

import { MenuScreen } from "@/components/menu/MenuScreen";
import { ThemedView } from "@/components/ThemedView";

/**
 * Chat tab screen that displays the ChatBot interface
 */
export default function MenuTab() {
  return (
    <ThemedView style={styles.container}>
      <MenuScreen />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
