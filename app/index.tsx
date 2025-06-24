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
import { Heatmap } from '../components/Heatmap';
import { CalendarSkeleton } from '../components/CalendarSkeleton';
import { useHabitsStore } from '../store';
import { Habit } from '../types';
import { sortHabitsByOrder } from '@/utils/data';
import { HeatmapInModal } from '@/components/HeatmapInModal';
import { router } from 'expo-router';
import { WeeklyHeatmap } from '@/components/WeeklyHeatmap';

export default function App() {
  const {
    habits,
    initialiseHabits,
    initialiseCompletions,
    isInitialisingHabits,
  } = useHabitsStore();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedView, setSelectedView] = useState<'yearly' | 'weekly'>(
    'yearly'
  );

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

  const ComponentToRender = selectedView === 'yearly' ? Heatmap : WeeklyHeatmap;

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
                  <ComponentToRender
                    key={habit?.id}
                    habit={habit}
                    onClick={() => handleHabitClick(habit)}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonGroupContainer}>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.buttonGroupButton,
                styles.leftButton,
                selectedView === 'yearly' && styles.buttonGroupButtonActive,
              ]}
              onPress={() => setSelectedView('yearly')}
            >
              <Text
                style={[
                  styles.buttonGroupButtonText,
                  selectedView === 'yearly' &&
                    styles.buttonGroupButtonTextActive,
                ]}
              >
                Yearly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.buttonGroupButton,
                styles.rightButton,
                selectedView === 'weekly' && styles.buttonGroupButtonActive,
              ]}
              onPress={() => setSelectedView('weekly')}
            >
              <Text
                style={[
                  styles.buttonGroupButtonText,
                  selectedView === 'weekly' &&
                    styles.buttonGroupButtonTextActive,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedHabit && (
          <HeatmapInModal
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
    paddingBottom: 60, // Add padding to prevent content from being hidden behind the button group
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
  buttonGroupContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d1b2a',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    backgroundColor: '#1e2832',
    borderRadius: 12,
    overflow: 'hidden',
    width: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGroupButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  leftButton: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightButton: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  buttonGroupButtonActive: {
    backgroundColor: '#3B82F6',
  },
  buttonGroupButtonText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonGroupButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
