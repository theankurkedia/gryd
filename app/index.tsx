import React, { useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppBar } from '../components/AppBar';
import { Calendar } from '../components/Calendar';
import { CalendarSkeleton } from '../components/CalendarSkeleton';
import { useHabitsStore } from '../store';
import { Habit } from '../types';
import { router } from 'expo-router';
import { sortHabitsByOrder } from '@/utils/data';

export default function App() {
  const {
    habits,
    initialiseHabits,
    initialiseCompletions,
    isInitialisingHabits,
  } = useHabitsStore();

  useEffect(() => {
    initialiseHabits();
    initialiseCompletions();
  }, [initialiseHabits, initialiseCompletions]);

  const handleHabitClick = (habit: Habit) => {
    router.push({
      pathname: '/add-edit-habit',
      params: { habitId: habit.id },
    });
  };

  return (
    <GestureHandlerRootView>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />
      <SafeAreaView style={styles.container}>
        <AppBar />
        <ScrollView contentContainerStyle={styles.scrollView}>
          {isInitialisingHabits ? (
            <View style={styles.content}>
              <CalendarSkeleton />
            </View>
          ) : (
            <View style={styles.content}>
              {habits?.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    Create your first habit by clicking the + button.
                  </Text>
                  {Platform.OS === 'web' && (
                    <Text style={styles.emptyStateText}>
                      Use mobile view for best experience.
                    </Text>
                  )}
                </View>
              ) : (
                sortHabitsByOrder(habits)?.map((habit: Habit) => (
                  <Calendar
                    key={habit?.id}
                    habit={habit}
                    onClick={() => handleHabitClick(habit)}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1b2a',
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
    gap: 16,
    flex: 1,
  },
  offlineNotice: {
    backgroundColor: '#FFD700',
    color: '#000',
    textAlign: 'center',
    padding: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
