import { useHabitsStore } from '@/store';
import {
  DndProvider,
  Draggable,
  DraggableStack,
  DraggableStackProps,
} from '@mgcrea/react-native-dnd';
import { router } from 'expo-router';
import { GripHorizontal, X } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from '../components/Icon';
import { COLORS_PALETTE } from '../constants/colors';

export default function ReorderHabitsScreen() {
  const habits = useHabitsStore(state => state.habits);
  const editHabits = useHabitsStore(state => state.editHabits);

  const onStackOrderChange: DraggableStackProps['onOrderChange'] =
    newHabitsOrder => {
      const updatedHabits = habits.map(habit => ({
        ...habit,
        order: newHabitsOrder?.findIndex(h => h === habit.id),
      }));
      editHabits(updatedHabits);
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Reorder habits</Text>
      </View>
      <ScrollView>
        <GestureHandlerRootView>
          <DndProvider>
            <DraggableStack
              direction="column"
              gap={10}
              onOrderChange={onStackOrderChange}
            >
              {habits.map(habit => (
                <Draggable key={habit.id} id={habit.id}>
                  <View
                    style={[
                      styles.box,
                      {
                        backgroundColor: habit.color || COLORS_PALETTE.cyan,
                      },
                    ]}
                  >
                    <View style={styles.habitContent}>
                      <View style={styles.habitInfo}>
                        {habit.icon && (
                          <Icon name={habit.icon} color="#fff" size={24} />
                        )}
                        <Text style={styles.habitName}>{habit.name}</Text>
                      </View>
                      <GripHorizontal color="#fff" size={20} />
                    </View>
                  </View>
                </Draggable>
              ))}
            </DraggableStack>
          </DndProvider>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    flex: 1,
    marginLeft: 12,
  },
  box: {
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS_PALETTE.cyan,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  habitName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
