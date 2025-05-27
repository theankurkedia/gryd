import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AddEditDialog } from '../components/AddEditDialog';
import { AppBar } from '../components/AppBar';
import { Calendar } from '../components/Calendar';
import { CalendarSkeleton } from '../components/CalendarSkeleton';
import { useHabitsStore } from '../store';
import { Habit } from '../types';
import { registerForPushNotificationsAsync } from '../utils/notifications';

export default function App() {
  const [selectedHabit, setSelectedHabit] = useState<Habit>();
  const [isAddHabitDialogVisible, setIsAddHabitDialogVisible] = useState(false);

  const {
    habits,
    initialiseHabits,
    initialiseCompletions,
    isInitialisingHabits,
    saveNotifToken,
  } = useHabitsStore();

  useEffect(() => {
    initialiseHabits();
    initialiseCompletions();

    if (Platform.OS === 'android') {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          // Store token in your backend or local storage
          // saveNotifToken(token.data);
        }
      });
    }
  }, [initialiseHabits, initialiseCompletions]);

  const openAddEditDialog = (habit?: Habit) => {
    if (habit) {
      setSelectedHabit(habit);
    } else {
      setSelectedHabit(undefined);
    }
    setIsAddHabitDialogVisible(true);
  };

  const onDialogClose = () => {
    setIsAddHabitDialogVisible(false);
    setSelectedHabit(undefined);
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <AppBar onAddHabit={openAddEditDialog} />
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
                habits?.map((habit: any) => (
                  <Calendar
                    key={habit?.id}
                    habit={habit}
                    onClick={() => openAddEditDialog(habit)}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
        <AddEditDialog
          habit={selectedHabit}
          visible={isAddHabitDialogVisible}
          onClose={onDialogClose}
        />
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
