import { Plus, Settings } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

export function AppBar() {
  const handleAddHabit = () => {
    router.push('/add-edit-habit');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={handleSettings} style={styles.button}>
          <Settings color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Gryd</Text>
      </View>
      <TouchableOpacity onPress={handleAddHabit} style={styles.button}>
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    padding: 8,
  },
});
