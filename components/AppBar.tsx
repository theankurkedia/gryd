import { Plus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AppBarProps {
  onAddHabit: () => void;
}

export function AppBar({ onAddHabit }: AppBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gryd</Text>
      <TouchableOpacity onPress={() => onAddHabit()} style={styles.addButton}>
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d1b2a',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
});
