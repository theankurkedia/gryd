import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppBar } from '../components/AppBar';
import { Calendar } from '../components/Calendar';
import { CalendarSkeleton } from '../components/CalendarSkeleton';
import { useHabitsStore } from '../store';
import { Habit } from '../types';
import { sortHabitsByOrder } from '@/utils/data';
import { CalendarModal } from '@/components/CalendarModal';
import { router } from 'expo-router';

export default function App() {
  const {
    habits,
    initialiseHabits,
    initialiseCompletions,
    isInitialisingHabits,
  } = useHabitsStore();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  useEffect(() => {
    initialiseHabits();
    initialiseCompletions();
  }, [initialiseHabits, initialiseCompletions]);

  const handleHabitClick = (habit: Habit) => {
    setSelectedHabit(habit);
  };

  const handleCloseModal = () => {
    setSelectedHabit(null);
  };
  const handleAddHabit = () => {
    router.push('/add-edit-habit');
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
                    Track and build your habits with the + button.
                  </Text>
                  <TouchableOpacity
                    style={[styles.headerButton]}
                    onPress={handleAddHabit}
                  >
                    <Text style={styles.headerButtonText}>
                      Create your first habit
                    </Text>
                  </TouchableOpacity>
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
        {selectedHabit && (
          <CalendarModal
            visible={!!selectedHabit}
            onClose={handleCloseModal}
            habit={selectedHabit}
          />
        )}
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
    gap: 16,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  headerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
});
